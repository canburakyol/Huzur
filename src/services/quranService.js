// Quran API Service - Açık Kuran API (Turkish Transliteration Support)
import { surahList } from '../data/surahList';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';

const BASE_URL = 'https://api.alquran.cloud/v1';
const ACIK_KURAN_URL = 'https://api.acikkuran.com';

// Sure içeriğini getir (Arapça)
export const getSurahArabic = async (surahNumber) => {
    try {
        const response = await fetch(`${BASE_URL}/surah/${surahNumber}`);
        const data = await response.json();
        if (data.code === 200) {
            return data.data;
        }
        throw new Error('Sure yüklenemedi');
    } catch (error) {
        console.error('Surah fetch error:', error);
        return null;
    }
};

// Sure içeriğini Türkçe meal ile getir
export const getSurahWithTranslation = async (surahNumber) => {
    try {
        const response = await fetch(`${BASE_URL}/surah/${surahNumber}/tr.vakfi`);
        const data = await response.json();
        if (data.code === 200) {
            return data.data;
        }
        throw new Error('Meal yüklenemedi');
    } catch (error) {
        console.error('Translation fetch error:', error);
        return null;
    }
};

// Cache constants
const SURAH_CACHE_PREFIX = 'quran_surah_v2_'; // v2 for new API
const SURAH_CACHE_MAX_AGE_DAYS = 7; // Cache valid for 7 days

// Helper: Get cached surah
const getCachedSurah = (surahNumber) => {
    try {
        const cacheKey = `${SURAH_CACHE_PREFIX}${surahNumber}`;
        const cached = storageService.getItem(cacheKey);
        if (!cached) return null;

        const { data, timestamp } = cached;
        const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        
        if (ageInDays > SURAH_CACHE_MAX_AGE_DAYS) {
            storageService.removeItem(cacheKey);
            return null;
        }
        
        console.log(`[Quran] Using cached surah ${surahNumber}`);
        return data;
    } catch (e) {
        console.warn('[Quran] Cache read error:', e);
        return null;
    }
};

// Helper: Save surah to cache
const cacheSurah = (surahNumber, data) => {
    try {
        const cacheKey = `${SURAH_CACHE_PREFIX}${surahNumber}`;
        const cacheData = {
            data,
            timestamp: Date.now()
        };
        storageService.setItem(cacheKey, cacheData);
        console.log(`[Quran] Cached surah ${surahNumber}`);
    } catch (e) {
        // storage full or other error - fail silently
        console.warn('[Quran] Cache write error:', e);
    }
};

// Açık Kuran API - Türkçe Okunuş Destekli - WITH CACHING
// Açık Kuran API - Türkçe Okunuş Destekli - WITH CACHING
export const getSurahComplete = async (surahNumber, translationId = 'tr.vakfi') => {
    // Step 1: Check cache first
    // Cache key should include translationId to avoid showing Turkish for English users
    const cacheKey = `${surahNumber}_${translationId}`;
    const cached = getCachedSurah(cacheKey);
    if (cached) {
        return cached;
    }

    // Determine if we should use Acik Kuran (Only for Turkish default/Vakfi)
    // Acik Kuran API primarily serves Turkish content with transliteration
    const useAcikKuran = translationId === 'tr.vakfi' || translationId === 'tr.diyanet';

    try {
        if (useAcikKuran) {
            // Step 2: Fetch from Açık Kuran API (has Turkish transliteration)
            const response = await fetch(`${ACIK_KURAN_URL}/surah/${surahNumber}`);
            
            if (!response.ok) {
                throw new Error('Sure yüklenemedi');
            }

            const result = await response.json();
            const apiData = result.data;

            if (apiData && apiData.verses) {
                const ayahs = apiData.verses.map((verse) => ({
                    number: verse.verse_number,
                    arabic: verse.verse || verse.verse_simplified,
                    transliteration: verse.transcription || '', // Turkish transliteration!
                    translation: verse.translation?.text || ''
                }));

                const surahData = {
                    number: apiData.id,
                    name: apiData.name_original,
                    englishName: apiData.name_en,
                    turkishName: apiData.name,
                    meaning: apiData.name_translation_tr,
                    revelationType: null, // Açık Kuran doesn't provide this
                    numberOfAyahs: apiData.verse_count,
                    ayahs
                };

                // Step 3: Cache the result
                cacheSurah(cacheKey, surahData);

                return surahData;
            }
        }

        // Step 4: Al Quran Cloud API (For English, Arabic, or fallback)
        console.log(`[Quran] Fetching from Al Quran Cloud API for ${translationId}...`);
        
        // We need 3 things: Arabic text, Translation, and Transliteration (if available/needed)
        // For non-Turkish, we might not have good transliteration, but we can try 'en.transliteration' for English
        
        const fetchUrls = [
            fetch(`${BASE_URL}/surah/${surahNumber}`), // 0: Arabic
            fetch(`${BASE_URL}/surah/${surahNumber}/${translationId}`) // 1: Translation
        ];

        // Add transliteration if it's Turkish (fallback case) or English
        // Note: Al Quran Cloud might not have 'tr.transliteration' reliably, but let's keep logic generic
        // For this implementation, we will skip transliteration for non-Turkish to save bandwidth/complexity unless requested,
        // but the UI expects it. Let's try to get it.
        // actually 'en.transliteration' exists.
        
        if (translationId.startsWith('tr')) {
             fetchUrls.push(fetch(`${BASE_URL}/surah/${surahNumber}/tr.transliteration`));
        } else {
             // For English/others, maybe fetch en.transliteration? 
             // Let's just fetch it.
             fetchUrls.push(fetch(`${BASE_URL}/surah/${surahNumber}/en.transliteration`));
        }

        const results = await Promise.allSettled(fetchUrls);

        const arabicRes = results[0].status === 'fulfilled' ? results[0].value : null;
        const translationRes = results[1].status === 'fulfilled' ? results[1].value : null;
        const transliterationRes = results[2] && results[2].status === 'fulfilled' ? results[2].value : null;

        if (!arabicRes || !translationRes) {
            throw new Error('Sure yüklenemedi - kritik veri eksik');
        }

        const arabicData = await arabicRes.json();
        const translationData = await translationRes.json();
        const transliterationData = transliterationRes ? await transliterationRes.json() : null;

        if (arabicData.code === 200 && translationData.code === 200) {
            const ayahs = arabicData.data.ayahs.map((ayah) => {
                const ayahNumber = ayah.numberInSurah;
                const translationAyah = translationData.data.ayahs.find(t => t.numberInSurah === ayahNumber);
                const transliterationAyah = transliterationData?.data?.ayahs?.find(t => t.numberInSurah === ayahNumber);

                return {
                    number: ayahNumber,
                    arabic: ayah.text,
                    transliteration: transliterationAyah?.text || '',
                    translation: translationAyah?.text || ''
                };
            });

            const surahData = {
                number: arabicData.data.number,
                name: arabicData.data.name,
                englishName: arabicData.data.englishName,
                turkishName: arabicData.data.englishNameTranslation, // Use English translation as name if Turkish not avail
                meaning: arabicData.data.englishNameTranslation,
                revelationType: arabicData.data.revelationType,
                numberOfAyahs: arabicData.data.numberOfAyahs,
                ayahs
            };

            cacheSurah(cacheKey, surahData);
            return surahData;
        }
        
        throw new Error('API yanıtı hatalı');

    } catch (error) {
        console.error('Quran API error:', error);
        
        // Try to return expired cache if available
        try {
            const cached = storageService.getItem(cacheKey);
            if (cached) {
                console.log(`[Quran] Using expired cache for surah ${surahNumber} (offline fallback)`);
                return cached.data;
            }
        } catch {
            // Ignore
        }
        
        return null;
    }
};

export const getAvailableTranslations = async () => {
    try {
        // Start with Turkish translations
        const response = await fetch(`${BASE_URL}/edition?language=tr`);
        const data = await response.json();
        
        let translations = [];
        
        if (data.code === 200) {
            translations = data.data.filter(edition => edition.type === 'translation');
            
            // Rename common Turkish ones
            translations = translations.map(t => {
                if (t.identifier === 'tr.vakfi') t.name = 'Diyanet Vakfı (Türkçe)';
                if (t.identifier === 'tr.diyanet') t.name = 'Diyanet İşleri (Türkçe)';
                return t;
            });
        }

        // Manually add English and Arabic options
        // We add them manually to ensure they are exactly what we want and to avoid fetching all languages
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
                type: 'tafsir' // It's technically a tafsir, but we treat it as translation text
            }
        ];

        const allTranslations = [...translations, ...extraTranslations];

        // Priority sorting
        const priorityIds = ['tr.vakfi', 'tr.diyanet', 'en.sahih', 'ar.jalalayn'];

        return allTranslations.sort((a, b) => {
            const aIndex = priorityIds.indexOf(a.identifier);
            const bIndex = priorityIds.indexOf(b.identifier);

            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.name.localeCompare(b.name);
        });

    } catch (error) {
        console.error('Translations fetch error:', error);
        // Fallback list if fetch fails
        return [
            { identifier: 'tr.vakfi', name: 'Diyanet Vakfı (Türkçe)', language: 'tr' },
            { identifier: 'en.sahih', name: 'Sahih International (English)', language: 'en' },
            { identifier: 'ar.jalalayn', name: 'Tafsir Al-Jalalayn (العربية)', language: 'ar' }
        ];
    }
};

// Ses URL'i oluştur (sure bazlı) - Al Quran Cloud API kullanarak
export const getAudioUrl = async (surahNumber, reciterId = 'ar.alafasy') => {
    try {
        // Al Quran Cloud API'den audio URL'ini al
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciterId}`);
        const data = await response.json();

        if (data.code === 200 && data.data && data.data.ayahs && data.data.ayahs.length > 0) {
            // İlk ayetin audio URL'ini al ve sure bazlı URL'e çevir
            const firstAyahAudio = data.data.ayahs[0].audio;
            if (firstAyahAudio) {
                // Sure bazlı URL formatına çevir
                // Örnek: https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3 -> https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3
                return firstAyahAudio.replace('/audio/', '/audio-surah/').replace(/\/(\d+)\.mp3$/, `/${surahNumber}.mp3`);
            }
        }

        // Fallback: Direkt URL formatı (bazı hafızlar için çalışabilir)
        return `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`;
    } catch (error) {
        console.error('Audio URL fetch error:', error);
        // Fallback URL
        return `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahNumber}.mp3`;
    }
};

// Senkron versiyon (hızlı erişim için) - Al Quran Cloud API formatı
export const getAudioUrlSync = (surahNumber, reciterId = 'ar.alafasy') => {
    const surahNum = String(surahNumber).padStart(3, '0');

    // Her hafız için doğru URL formatları
    // Bazı hafızlar için farklı sunucular kullanılıyor
    const urlFormats = {
        'ar.alafasy': `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`,
        'ar.abdulbasitmurattal': `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${surahNumber}.mp3`,
        // Husary, Minshawi ve Sudais için alternatif URL formatları
        'ar.husary': `https://server7.mp3quran.net/husary/${surahNum}.mp3`,
        'ar.minshawi': `https://server7.mp3quran.net/minshawi/${surahNum}.mp3`,
        'ar.abdurrahmaansudais': `https://server7.mp3quran.net/sudais/${surahNum}.mp3`
    };

    const url = urlFormats[reciterId] || urlFormats['ar.alafasy'];


    return url;
};


// Ayet ayet ses URL'i
export const getAyahAudioUrl = (surahNumber, ayahNumber, reciterId = 'ar.alafasy') => {
    // Bazı hafızlar (özellikle Alafasy) global ayet numarası kullanıyor olabilir.
    // api.alquran.cloud/v1/ayah/1:1/ar.alafasy -> audio: .../1.mp3 (Global ID)

    // Global Ayet Numarasını Hesapla
    let globalAyahNumber = 0;
    for (let i = 1; i < surahNumber; i++) {
        const surah = surahList.find(s => s.number === i);
        if (surah) {
            globalAyahNumber += surah.ayahCount;
        }
    }
    globalAyahNumber += ayahNumber;

    // Alafasy ve diğerleri için global ID kullanımı
    // Diğer hafızlar için format farklı olabilir, ancak şimdilik bu yapıyı deniyoruz.
    // Eğer reciterId 'ar.alafasy' ise kesinlikle global ID kullanıyor.

    return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${globalAyahNumber}.mp3`;
};

// Hafız listesi
export const getReciters = () => {
    return [
        { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', country: '🇰🇼 Kuveyt' },
        { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', country: '🇪🇬 Mısır' },
        { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', country: '🇪🇬 Mısır' },
        { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi', country: '🇪🇬 Mısır' },
        { id: 'ar.abdurrahmaansudais', name: 'Abdurrahman As-Sudais', country: '🇸🇦 S. Arabistan' }
    ];
};
