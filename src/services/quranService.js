import { surahList } from '../data/surahList';
import { storageService } from './storageService';
import { logger } from '../utils/logger';

const BASE_URL = 'https://api.alquran.cloud/v1';
const ACIK_KURAN_URL = 'https://api.acikkuran.com';
const FETCH_OPTIONS = { cache: 'no-store' };

const SURAH_CACHE_PREFIX = 'quran_surah_v5_';
const SURAH_CACHE_MAX_AGE_DAYS = 7;
const DEFAULT_TURKISH_TRANSLATION_ID = 'tr.vakfi';

const normalizeTranslationId = (translationId = DEFAULT_TURKISH_TRANSLATION_ID) => {
    return translationId === 'tr.diyanet' ? DEFAULT_TURKISH_TRANSLATION_ID : translationId;
};

const hasMatchingSurahNumber = (data, surahNumber) => {
    return Number(data?.number) === Number(surahNumber);
};

const getCachedSurah = (cacheKey, expectedSurahNumber = null) => {
    try {
        const storageKey = `${SURAH_CACHE_PREFIX}${cacheKey}`;
        const cached = storageService.getItem(storageKey);

        if (!cached) {
            return null;
        }

        const { data, timestamp } = cached;

        if (expectedSurahNumber !== null && !hasMatchingSurahNumber(data, expectedSurahNumber)) {
            storageService.removeItem(storageKey);
            logger.warn(`[Quran] Discarded mismatched cache for surah ${cacheKey}`);
            return null;
        }

        const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        if (ageInDays > SURAH_CACHE_MAX_AGE_DAYS) {
            storageService.removeItem(storageKey);
            return null;
        }

        logger.log(`[Quran] Using cached surah ${cacheKey}`);
        return data;
    } catch (error) {
        logger.warn('[Quran] Cache read error:', error);
        return null;
    }
};

const cacheSurah = (cacheKey, data) => {
    try {
        storageService.setItem(`${SURAH_CACHE_PREFIX}${cacheKey}`, {
            data,
            timestamp: Date.now()
        });
        logger.log(`[Quran] Cached surah ${cacheKey}`);
    } catch (error) {
        logger.warn('[Quran] Cache write error:', error);
    }
};

const buildSurahData = (surahNumber, arabicPayload, translationPayload, transliterationByAyah = null) => {
    if (arabicPayload?.code !== 200 || translationPayload?.code !== 200) {
        throw new Error('Sure yuklenemedi - kritik veri eksik');
    }

    if (
        !hasMatchingSurahNumber({ number: arabicPayload.data?.number }, surahNumber) ||
        !hasMatchingSurahNumber({ number: translationPayload.data?.number }, surahNumber)
    ) {
        throw new Error(`Wrong surah returned for request ${surahNumber}`);
    }

    const translations = new Map(
        (translationPayload.data?.ayahs || []).map((ayah) => [Number(ayah.numberInSurah), ayah.text || ''])
    );

    const ayahs = (arabicPayload.data?.ayahs || []).map((ayah) => {
        const ayahNumber = Number(ayah.numberInSurah);

        return {
            number: ayahNumber,
            arabic: ayah.text,
            transliteration: transliterationByAyah?.get(ayahNumber) || '',
            translation: translations.get(ayahNumber) || ''
        };
    });

    return {
        number: arabicPayload.data.number,
        name: arabicPayload.data.name,
        englishName: arabicPayload.data.englishName,
        turkishName: arabicPayload.data.englishNameTranslation,
        meaning: arabicPayload.data.englishNameTranslation,
        revelationType: arabicPayload.data.revelationType,
        numberOfAyahs: arabicPayload.data.numberOfAyahs,
        ayahs
    };
};

const fetchAcikKuranTransliteration = async (surahNumber) => {
    try {
        const response = await fetch(`${ACIK_KURAN_URL}/surah/${surahNumber}`, FETCH_OPTIONS);
        if (!response.ok) {
            throw new Error('Acik Kuran transliteration request failed');
        }

        const result = await response.json();
        const apiData = result.data;

        if (!apiData?.verses) {
            throw new Error('Acik Kuran transliteration payload missing verses');
        }

        if (!hasMatchingSurahNumber({ number: apiData.id }, surahNumber)) {
            throw new Error(`Acik Kuran returned wrong surah: expected ${surahNumber}, got ${apiData.id}`);
        }

        return new Map(
            apiData.verses.map((verse) => [Number(verse.verse_number), verse.transcription || ''])
        );
    } catch (error) {
        logger.warn('[Quran] Transliteration fetch failed, continuing without it:', error);
        return null;
    }
};

const fetchJson = async (url) => {
    const response = await fetch(url, FETCH_OPTIONS);
    return response.json();
};

export const getSurahArabic = async (surahNumber) => {
    try {
        const data = await fetchJson(`${BASE_URL}/surah/${surahNumber}`);
        if (data.code === 200) {
            return data.data;
        }
        throw new Error('Sure yuklenemedi');
    } catch (error) {
        logger.error('Surah fetch error:', error);
        return null;
    }
};

export const getSurahWithTranslation = async (surahNumber) => {
    try {
        const data = await fetchJson(`${BASE_URL}/surah/${surahNumber}/${DEFAULT_TURKISH_TRANSLATION_ID}`);
        if (data.code === 200) {
            return data.data;
        }
        throw new Error('Meal yuklenemedi');
    } catch (error) {
        logger.error('Translation fetch error:', error);
        return null;
    }
};

export const getSurahComplete = async (surahNumber, translationId = DEFAULT_TURKISH_TRANSLATION_ID) => {
    const normalizedTranslationId = normalizeTranslationId(translationId);
    const cacheKey = `${surahNumber}_${normalizedTranslationId}`;
    const cached = getCachedSurah(cacheKey, surahNumber);

    if (cached) {
        return cached;
    }

    try {
        if (normalizedTranslationId === DEFAULT_TURKISH_TRANSLATION_ID) {
            const [arabicPayload, vakfiPayload, transliterationByAyah] = await Promise.all([
                fetchJson(`${BASE_URL}/surah/${surahNumber}`),
                fetchJson(`${BASE_URL}/surah/${surahNumber}/${DEFAULT_TURKISH_TRANSLATION_ID}`),
                fetchAcikKuranTransliteration(surahNumber)
            ]);

            const surahData = buildSurahData(
                surahNumber,
                arabicPayload,
                vakfiPayload,
                transliterationByAyah
            );

            if (!hasMatchingSurahNumber(surahData, surahNumber)) {
                throw new Error(`Vakfi hybrid payload returned wrong surah: expected ${surahNumber}, got ${surahData.number}`);
            }

            cacheSurah(cacheKey, surahData);
            return surahData;
        }

        logger.log(`[Quran] Fetching from Al Quran Cloud API for ${normalizedTranslationId}...`);

        const transliterationUrl = normalizedTranslationId.startsWith('tr')
            ? `${BASE_URL}/surah/${surahNumber}/tr.transliteration`
            : `${BASE_URL}/surah/${surahNumber}/en.transliteration`;

        const [arabicPayload, translationPayload, transliterationPayload] = await Promise.all([
            fetchJson(`${BASE_URL}/surah/${surahNumber}`),
            fetchJson(`${BASE_URL}/surah/${surahNumber}/${normalizedTranslationId}`),
            fetchJson(transliterationUrl).catch(() => null)
        ]);

        const transliterationByAyah = transliterationPayload?.data?.ayahs
            ? new Map(
                transliterationPayload.data.ayahs.map((ayah) => [Number(ayah.numberInSurah), ayah.text || ''])
            )
            : null;

        const surahData = buildSurahData(
            surahNumber,
            arabicPayload,
            translationPayload,
            transliterationByAyah
        );

        if (!hasMatchingSurahNumber(surahData, surahNumber)) {
            throw new Error(`Al Quran Cloud returned wrong surah: expected ${surahNumber}, got ${surahData.number}`);
        }

        cacheSurah(cacheKey, surahData);
        return surahData;
    } catch (error) {
        logger.error('Quran API error:', error);

        try {
            const storageKey = `${SURAH_CACHE_PREFIX}${cacheKey}`;
            const expiredCache = storageService.getItem(storageKey);
            if (expiredCache?.data && hasMatchingSurahNumber(expiredCache.data, surahNumber)) {
                logger.log(`[Quran] Using expired cache for surah ${surahNumber} (offline fallback)`);
                return expiredCache.data;
            }

            if (expiredCache?.data && !hasMatchingSurahNumber(expiredCache.data, surahNumber)) {
                storageService.removeItem(storageKey);
            }
        } catch {
            // Ignore offline fallback cache errors.
        }

        return null;
    }
};

export const getAvailableTranslations = async () => {
    try {
        const response = await fetch(`${BASE_URL}/edition?language=tr`, FETCH_OPTIONS);
        const data = await response.json();

        const fallbackTurkishTranslation = {
            identifier: DEFAULT_TURKISH_TRANSLATION_ID,
            name: 'Diyanet Vakfı (Türkçe)',
            language: 'tr',
            type: 'translation'
        };

        let translations = [fallbackTurkishTranslation];

        if (data.code === 200) {
            const vakfiTranslation = data.data.find(
                (edition) => edition.type === 'translation' && edition.identifier === DEFAULT_TURKISH_TRANSLATION_ID
            );

            if (vakfiTranslation) {
                translations = [
                    {
                        ...vakfiTranslation,
                        name: 'Diyanet Vakfı (Türkçe)'
                    }
                ];
            }
        }

        const extraTranslations = [
            {
                identifier: 'en.sahih',
                name: 'Sahih International (English)',
                language: 'en',
                type: 'translation'
            },
            {
                identifier: 'ar.jalalayn',
                name: 'Tafsir Al-Jalalayn (العربية)',
                language: 'ar',
                type: 'tafsir'
            }
        ];

        const priorityIds = [DEFAULT_TURKISH_TRANSLATION_ID, 'en.sahih', 'ar.jalalayn'];

        return [...translations, ...extraTranslations].sort((a, b) => {
            const aIndex = priorityIds.indexOf(a.identifier);
            const bIndex = priorityIds.indexOf(b.identifier);

            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.name.localeCompare(b.name);
        });
    } catch (error) {
        logger.error('Translations fetch error:', error);
        return [
            { identifier: DEFAULT_TURKISH_TRANSLATION_ID, name: 'Diyanet Vakfı (Türkçe)', language: 'tr', type: 'translation' },
            { identifier: 'en.sahih', name: 'Sahih International (English)', language: 'en' },
            { identifier: 'ar.jalalayn', name: 'Tafsir Al-Jalalayn (العربية)', language: 'ar' }
        ];
    }
};

export const getAudioUrl = async (surahNumber, reciterId = 'ar.alafasy') => {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}`);
        const data = await response.json();

        if (data.code === 200 && data.data && data.data.ayahs && data.data.ayahs.length > 0) {
            const firstAyahAudio = data.data.ayahs[0].audio;
            if (firstAyahAudio) {
                return firstAyahAudio
                    .replace('/audio/', '/audio-surah/')
                    .replace(/\/(\d+)\.mp3$/, `/${surahNumber}.mp3`);
            }
        }

        return `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`;
    } catch (error) {
        logger.error('Audio URL fetch error:', error);
        return `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`;
    }
};

export const getAudioUrlSync = (surahNumber, reciterId = 'ar.alafasy') => {
    const surahNum = String(surahNumber).padStart(3, '0');

    const urlFormats = {
        'ar.alafasy': `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`,
        'ar.abdulbasitmurattal': `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${surahNumber}.mp3`,
        'ar.husary': `https://server7.mp3quran.net/husary/${surahNum}.mp3`,
        'ar.minshawi': `https://server7.mp3quran.net/minshawi/${surahNum}.mp3`,
        'ar.abdurrahmaansudais': `https://server7.mp3quran.net/sudais/${surahNum}.mp3`
    };

    return urlFormats[reciterId] || `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`;
};

export const getAyahAudioUrl = (surahNumber, ayahNumber, reciterId = 'ar.alafasy') => {
    let globalAyahNumber = 0;

    for (let i = 1; i < surahNumber; i += 1) {
        const surah = surahList.find((item) => item.number === i);
        if (surah) {
            globalAyahNumber += surah.ayahCount;
        }
    }

    globalAyahNumber += ayahNumber;

    return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${globalAyahNumber}.mp3`;
};

export const getReciters = () => {
    return [
        { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', country: 'ğŸ‡°ğŸ‡¼ Kuveyt' },
        { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', country: 'ğŸ‡ªğŸ‡¬ MÄ±sÄ±r' },
        { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', country: 'ğŸ‡ªğŸ‡¬ MÄ±sÄ±r' },
        { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi', country: 'ğŸ‡ªğŸ‡¬ MÄ±sÄ±r' },
        { id: 'ar.abdurrahmaansudais', name: 'Abdurrahman As-Sudais', country: 'ğŸ‡¸ğŸ‡¦ S. Arabistan' },
        { id: 'ar.shuraim', name: 'Saud Al-Shuraim', country: 'ğŸ‡¸ğŸ‡¦ S. Arabistan' },
        { id: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly', country: 'ğŸ‡¸ğŸ‡¦ S. Arabistan' },
        { id: 'ar.basfar', name: 'Abdullah Basfar', country: 'ğŸ‡¸ğŸ‡¦ S. Arabistan' },
        { id: 'ar.ahmedajamy', name: 'Ahmed Al-Ajmy', country: 'ğŸ‡¸ğŸ‡¦ S. Arabistan' },
        { id: 'ar.nasserqatami', name: 'Nasser Al-Qatami', country: 'ğŸ‡¸ğŸ‡¦ S. Arabistan' },
        { id: 'ar.yasseraldossari', name: 'Yasser Al-Dosari', country: 'ğŸ‡¸ğŸ‡¦ S. Arabistan' }
    ];
};
