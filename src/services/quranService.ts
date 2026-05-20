import { surahList } from '../data/surahList';
import { storageService } from './storageService';
import { logger } from '../utils/logger';

interface Ayah {
  number: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  turkishName: string;
  meaning: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

interface ApiResponse {
  code: number;
  data: {
    number?: number;
    name?: string;
    englishName?: string;
    englishNameTranslation?: string;
    revelationType?: string;
    numberOfAyahs?: number;
    ayahs?: Array<{
      numberInSurah?: number;
      text?: string;
      audio?: string;
    }>;
  };
}

interface TranslationEdition {
  identifier: string;
  name: string;
  language: string;
  type: string;
}

interface Reciter {
  id: string;
  name: string;
  country: string;
}

interface SurahCacheEntry {
  data: SurahData;
  timestamp: number;
}

interface AcikKuranVerse {
  verse_number: number;
  transcription?: string;
}

interface AcikKuranData {
  id: number;
  verses: AcikKuranVerse[];
}

interface AcikKuranResponse {
  data: AcikKuranData;
}

const BASE_URL = 'https://api.alquran.cloud/v1';
const ACIK_KURAN_URL = 'https://api.acikkuran.com';
const FETCH_OPTIONS: RequestInit = { cache: 'no-store' };
const FETCH_TIMEOUT_MS = 10000;
const TRANSLITERATION_FETCH_TIMEOUT_MS = 4000;
const TRANSLITERATION_SOFT_TIMEOUT_MS = 750;

const SURAH_CACHE_PREFIX = 'quran_surah_v5_';
const SURAH_CACHE_MAX_AGE_DAYS = 7;
const DEFAULT_TURKISH_TRANSLATION_ID = 'tr.vakfi';

const normalizeTranslationId = (translationId = DEFAULT_TURKISH_TRANSLATION_ID): string => {
    return translationId === 'tr.diyanet' ? DEFAULT_TURKISH_TRANSLATION_ID : translationId;
};

const hasMatchingSurahNumber = (data: { number?: number } | null | undefined, surahNumber: number): boolean => {
    return Number(data?.number) === Number(surahNumber);
};

const getCachedSurah = (cacheKey: string, expectedSurahNumber: number | null = null): SurahData | null => {
    try {
        const storageKey = `${SURAH_CACHE_PREFIX}${cacheKey}`;
        const cached = storageService.getItem<SurahCacheEntry>(storageKey);

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

const cacheSurah = (cacheKey: string, data: SurahData): void => {
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

const buildSurahData = (surahNumber: number, arabicPayload: ApiResponse, translationPayload: ApiResponse, transliterationByAyah: Map<number, string> | null = null): SurahData => {
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
            arabic: ayah.text || '',
            transliteration: transliterationByAyah?.get(ayahNumber) || '',
            translation: translations.get(ayahNumber) || ''
        };
    });

    return {
        number: arabicPayload.data.number!,
        name: arabicPayload.data.name!,
        englishName: arabicPayload.data.englishName!,
        turkishName: arabicPayload.data.englishNameTranslation!,
        meaning: arabicPayload.data.englishNameTranslation!,
        revelationType: arabicPayload.data.revelationType!,
        numberOfAyahs: arabicPayload.data.numberOfAyahs!,
        ayahs
    };
};

const fetchWithTimeout = async (
    url: string,
    options: RequestInit = FETCH_OPTIONS,
    timeoutMs = FETCH_TIMEOUT_MS
): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal
        });
    } finally {
        window.clearTimeout(timeoutId);
    }
};

const fetchAcikKuranTransliteration = async (surahNumber: number): Promise<Map<number, string> | null> => {
    try {
        const response = await fetchWithTimeout(`${ACIK_KURAN_URL}/surah/${surahNumber}`, FETCH_OPTIONS, TRANSLITERATION_FETCH_TIMEOUT_MS);
        if (!response.ok) {
            throw new Error('Acik Kuran transliteration request failed');
        }

        const result = await response.json() as AcikKuranResponse;
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

const fetchJson = async (url: string): Promise<ApiResponse> => {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
        throw new Error(`Quran request failed: HTTP ${response.status}`);
    }
    return response.json() as Promise<ApiResponse>;
};

const withSoftTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
        return await Promise.race([
            promise,
            new Promise<null>((resolve) => {
                timeoutId = window.setTimeout(() => resolve(null), timeoutMs);
            })
        ]);
    } finally {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }
    }
};

const hydrateTransliterationCache = async (
    cacheKey: string,
    surahNumber: number,
    baseData: SurahData,
    transliterationLoader: () => Promise<Map<number, string> | null>
): Promise<void> => {
    try {
        const transliterationByAyah = await transliterationLoader();
        if (!transliterationByAyah || transliterationByAyah.size === 0) {
            return;
        }

        const hydratedData: SurahData = {
            ...baseData,
            ayahs: baseData.ayahs.map((ayah) => ({
                ...ayah,
                transliteration: transliterationByAyah.get(ayah.number) || ayah.transliteration || ''
            }))
        };

        if (hasMatchingSurahNumber(hydratedData, surahNumber)) {
            cacheSurah(cacheKey, hydratedData);
        }
    } catch (error) {
        logger.warn('[Quran] Background transliteration hydration failed:', error);
    }
};

export const getSurahArabic = async (surahNumber: number): Promise<ApiResponse['data'] | null> => {
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

export const getSurahWithTranslation = async (surahNumber: number): Promise<ApiResponse['data'] | null> => {
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

export const getSurahComplete = async (surahNumber: number, translationId = DEFAULT_TURKISH_TRANSLATION_ID): Promise<SurahData | null> => {
    const normalizedTranslationId = normalizeTranslationId(translationId);
    const cacheKey = `${surahNumber}_${normalizedTranslationId}`;
    const cached = getCachedSurah(cacheKey, surahNumber);

    if (cached) {
        return cached;
    }

    try {
        if (normalizedTranslationId === DEFAULT_TURKISH_TRANSLATION_ID) {
            const transliterationPromise = fetchAcikKuranTransliteration(surahNumber);
            const [arabicPayload, vakfiPayload] = await Promise.all([
                fetchJson(`${BASE_URL}/surah/${surahNumber}`),
                fetchJson(`${BASE_URL}/surah/${surahNumber}/${DEFAULT_TURKISH_TRANSLATION_ID}`)
            ]);
            const transliterationByAyah = await withSoftTimeout(
                transliterationPromise,
                TRANSLITERATION_SOFT_TIMEOUT_MS
            );

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
            if (!transliterationByAyah) {
                void hydrateTransliterationCache(
                    cacheKey,
                    surahNumber,
                    surahData,
                    () => transliterationPromise
                );
            }
            return surahData;
        }

        logger.log(`[Quran] Fetching from Al Quran Cloud API for ${normalizedTranslationId}...`);

        const transliterationUrl = normalizedTranslationId.startsWith('tr')
            ? `${BASE_URL}/surah/${surahNumber}/tr.transliteration`
            : `${BASE_URL}/surah/${surahNumber}/en.transliteration`;

        const transliterationPromise = fetchJson(transliterationUrl)
            .then((transliterationPayload) => {
                return transliterationPayload?.data?.ayahs
                    ? new Map(
                        transliterationPayload.data.ayahs.map((ayah) => [Number(ayah.numberInSurah), ayah.text || ''])
                    )
                    : null;
            })
            .catch((error: Error) => {
                logger.warn('[QuranService] Transliteration fetch failed', { surahNumber, error: error?.message });
                return null;
            });

        const [arabicPayload, translationPayload] = await Promise.all([
            fetchJson(`${BASE_URL}/surah/${surahNumber}`),
            fetchJson(`${BASE_URL}/surah/${surahNumber}/${normalizedTranslationId}`)
        ]);
        const transliterationByAyah = await withSoftTimeout(
            transliterationPromise,
            TRANSLITERATION_SOFT_TIMEOUT_MS
        );

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
        if (!transliterationByAyah) {
            void hydrateTransliterationCache(cacheKey, surahNumber, surahData, () => transliterationPromise);
        }
        return surahData;
    } catch (error) {
        logger.error('Quran API error:', error);

        try {
            const storageKey = `${SURAH_CACHE_PREFIX}${cacheKey}`;
            const expiredCache = storageService.getItem<SurahCacheEntry>(storageKey);
            if (expiredCache?.data && hasMatchingSurahNumber(expiredCache.data, surahNumber)) {
                logger.log(`[Quran] Using expired cache for surah ${surahNumber} (offline fallback)`);
                return expiredCache.data;
            }

            if (expiredCache?.data && !hasMatchingSurahNumber(expiredCache.data, surahNumber)) {
                storageService.removeItem(storageKey);
            }
        } catch (error) {
            logger.error('[QuranService] Offline fallback cache cleanup failed', error);
        }

        return null;
    }
};

export const getAvailableTranslations = async (): Promise<TranslationEdition[]> => {
    try {
        const response = await fetchWithTimeout(`${BASE_URL}/edition?language=tr`);
        if (!response.ok) {
            throw new Error(`Translations request failed: HTTP ${response.status}`);
        }
        const data = await response.json() as { code: number; data: Array<{ identifier: string; name: string; language: string; type: string }> };

        const fallbackTurkishTranslation: TranslationEdition = {
            identifier: DEFAULT_TURKISH_TRANSLATION_ID,
            name: 'Diyanet Vakfı (Türkçe)',
            language: 'tr',
            type: 'translation'
        };

        let translations: TranslationEdition[] = [fallbackTurkishTranslation];

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

        const extraTranslations: TranslationEdition[] = [
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
            { identifier: 'en.sahih', name: 'Sahih International (English)', language: 'en', type: 'translation' },
            { identifier: 'ar.jalalayn', name: 'Tafsir Al-Jalalayn (العربية)', language: 'ar', type: 'tafsir' }
        ];
    }
};

export const getAudioUrl = async (surahNumber: number, reciterId = 'ar.alafasy'): Promise<string> => {
    try {
        const response = await fetchWithTimeout(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}`);
        if (!response.ok) {
            throw new Error(`Audio URL request failed: HTTP ${response.status}`);
        }
        const data = await response.json() as ApiResponse;

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

export const getAudioUrlSync = (surahNumber: number, reciterId = 'ar.alafasy'): string => {
    const surahNum = String(surahNumber).padStart(3, '0');

    const urlFormats: Record<string, string> = {
        'ar.alafasy': `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`,
        'ar.abdulbasitmurattal': `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${surahNumber}.mp3`,
        'ar.husary': `https://server7.mp3quran.net/husary/${surahNum}.mp3`,
        'ar.minshawi': `https://server7.mp3quran.net/minshawi/${surahNum}.mp3`,
        'ar.abdurrahmaansudais': `https://server7.mp3quran.net/sudais/${surahNum}.mp3`
    };

    return urlFormats[reciterId] || `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`;
};

export const getAyahAudioUrl = (surahNumber: number, ayahNumber: number, reciterId = 'ar.alafasy'): string => {
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

export const getReciters = (): Reciter[] => {
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

export default {
    getSurahArabic,
    getSurahWithTranslation,
    getSurahComplete,
    getAvailableTranslations,
    getAudioUrl,
    getAudioUrlSync,
    getAyahAudioUrl,
    getReciters
};
