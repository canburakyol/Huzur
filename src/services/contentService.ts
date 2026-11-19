import { logger } from '../utils/logger';
import { hadiths, hadithCategories } from '../data/hadiths';
import { prayers } from '../data/prayers';
import { ESMA_UL_HUSNA } from '../data/esmaUlHusnaData';
import { createReviewedSourceMeta } from '../data/reviewedSourceRegistry';
import { getActiveCampaign } from './campaignService';
import i18n from '../i18n';
import { SURAH_NAMES_LATIN } from '../data/surahList';
import { getEsmaTranslation } from '../data/esmaUlHusnaTranslations';
import { HADITH_CATEGORY_NAMES, hadithLangColumn, localizeHadith } from '../data/hadithTranslations';

const ASMA_AL_HUSNA_API = 'https://api.aladhan.com/v1/asmaAlHusna';
const HADITH_API_EN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-nawawi.min.json';

type Localized = { en: string; de: string; id: string };

// Excerpts; non-Turkish texts are from Sahih International, Bubenheim & Elyas and Kemenag RI.
const DAILY_VERSES: Array<{ surah: number; ayah: number; reference: string; arabic: string; translation: string; translations: Localized; image: string }> = [
    { surah: 2, ayah: 153, reference: 'Bakara, 153', arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', translation: 'Allah sabredenlerle beraberdir.', translations: { en: 'Indeed, Allah is with the patient.', de: 'Allah ist mit den Standhaften.', id: 'Sesungguhnya Allah beserta orang-orang yang sabar.' }, image: '/stories/quran-1.webp' },
    { surah: 13, ayah: 28, reference: 'Ra\'d, 28', arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', translation: 'Kalpler ancak Allah\'ı anmakla huzur bulur.', translations: { en: 'Unquestionably, by the remembrance of Allah hearts are assured.', de: 'Sicherlich, im Gedenken Allahs finden die Herzen Ruhe!', id: 'Ingatlah, hanya dengan mengingati Allah-lah hati menjadi tenteram.' }, image: '/stories/quran-2.webp' },
    { surah: 94, ayah: 5, reference: 'İnşirah, 5', arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'Şüphesiz güçlükle beraber bir kolaylık vardır.', translations: { en: 'For indeed, with hardship [will be] ease.', de: 'Also gewiß, mit der Erschwernis ist Erleichterung.', id: 'Karena sesungguhnya sesudah kesulitan itu ada kemudahan.' }, image: '/stories/quran.webp' },
    { surah: 20, ayah: 114, reference: 'Taha, 114', arabic: 'رَّبِّ زِدْنِي عِلْمًا', translation: 'Rabbim! İlmimi artır.', translations: { en: 'My Lord, increase me in knowledge.', de: 'Mein Herr, lasse mich an Wissen zunehmen.', id: 'Ya Tuhanku, tambahkanlah kepadaku ilmu pengetahuan.' }, image: '/stories/quran-1.webp' },
    { surah: 65, ayah: 3, reference: 'Talak, 3', arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', translation: 'Kim Allah\'a tevekkül ederse O, ona yeter.', translations: { en: 'And whoever relies upon Allah – then He is sufficient for him.', de: 'Und wer sich auf Allah verläßt, dem ist Er seine Genüge.', id: 'Dan barangsiapa yang bertawakkal kepada Allah niscaya Allah akan mencukupkan (keperluan)nya.' }, image: '/stories/quran-2.webp' }
];

// shortcut: the last two attributions are popular but unverified in the authors' works; replace with sourced sayings on the next content review.
const DAILY_QUOTES: Array<{ text: string; author: string; translations: Localized; authorLatin: string; image: string }> = [
    { text: 'Kendini bilen Rabbini bilir.', author: 'Hz. Ali (r.a.)', translations: { en: 'Whoever knows himself knows his Lord.', de: 'Wer sich selbst erkennt, erkennt seinen Herrn.', id: 'Siapa yang mengenal dirinya, mengenal Tuhannya.' }, authorLatin: 'Ali ibn Abi Talib (r.a.)', image: '/stories/mosque-1.webp' },
    { text: 'Sabır, imanın yarısıdır.', author: 'Abdullah ibn Mesud (r.a.)', translations: { en: 'Patience is half of faith.', de: 'Geduld ist die Hälfte des Glaubens.', id: 'Sabar adalah separuh iman.' }, authorLatin: "Abdullah ibn Mas'ud (r.a.)", image: '/stories/mosque-2.webp' },
    { text: 'Güzel söz sadakadır.', author: 'Buhârî, Müslim', translations: { en: 'A good word is charity.', de: 'Ein gutes Wort ist eine Wohltat.', id: 'Kata-kata yang baik adalah sedekah.' }, authorLatin: 'Bukhari, Muslim', image: '/stories/mosque-3.webp' },
    { text: 'Yaratılmışı Yaratan\'dan ötürü sev.', author: 'Yunus Emre', translations: { en: 'Love the created for the sake of the Creator.', de: 'Liebe das Geschöpf um des Schöpfers willen.', id: 'Cintailah makhluk karena Sang Pencipta.' }, authorLatin: 'Yunus Emre', image: '/stories/nature.webp' },
    { text: 'Her şey zıddıyla kaimdir.', author: 'Mevlana', translations: { en: 'Everything is known through its opposite.', de: 'Alles besteht durch sein Gegenteil.', id: 'Segala sesuatu dikenal melalui lawannya.' }, authorLatin: 'Rumi', image: '/stories/pattern.webp' }
];

type DailyContent = {
    campaign: { id: string; region: string; variant: string; timezone: string; date: string };
    esma: { name: string; arabic: string; meaning: string; sourceMeta: unknown };
    dua: { text: string; arabic: string; source: string; sourceMeta: unknown };
    verse: { reference: string; arabic: string; translation: string; text: string; image: string; sourceMeta: unknown };
    hadith: { text: string; arabic: string; source: string; image: string; sourceMeta: unknown };
    quote: { text: string; author: string; image: string };
    insight: { text: string };
    dailyDua: { text: string; arabic: string; title: string; image: string; sourceMeta: unknown };
};

type EsmaEntry = {
    latin: string;
    arabic: string;
    meaning: string;
    detail?: string;
};

type PrayerEntry = {
    category: string;
    meaning: string;
    arabic: string;
    title: string;
};

type HadithEntry = {
    text: string;
    arabic?: string;
    source?: string;
    id?: string | number;
};

export const getDailyContent = (language: string = i18n.language || 'tr'): DailyContent => {
    const lang = language.slice(0, 2);
    const isTr = !['en', 'de', 'id'].includes(lang);
    const loc = (value: Localized) => value[lang as keyof Localized];
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const campaign = getActiveCampaign(today);

    const baseEsma = ESMA_UL_HUSNA[dayOfYear % ESMA_UL_HUSNA.length];
    const esmaTranslation = getEsmaTranslation(baseEsma.id, language);
    const dailyEsma: EsmaEntry = esmaTranslation ? { ...baseEsma, ...esmaTranslation } : baseEsma;

    const dailyPrayers = prayers.filter((p: PrayerEntry) => p.category === 'daily');
    const dailyDuaItem = dailyPrayers[dayOfYear % dailyPrayers.length] || prayers[0] as PrayerEntry;

    const dailyVerse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];

    const dailyHadith = localizeHadith(hadiths[dayOfYear % hadiths.length] as HadithEntry, language);

    const dailyQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
    const verseText = isTr ? dailyVerse.translation : loc(dailyVerse.translations);
    const verseReference = isTr ? dailyVerse.reference : `${SURAH_NAMES_LATIN[dailyVerse.surah - 1]} ${dailyVerse.surah}:${dailyVerse.ayah}`;
    const quoteText = isTr ? dailyQuote.text : loc(dailyQuote.translations);
    const quoteAuthor = isTr ? dailyQuote.author : dailyQuote.authorLatin;

    return {
        campaign,
        esma: {
            name: dailyEsma.latin,
            arabic: dailyEsma.arabic,
            meaning: dailyEsma.meaning,
            sourceMeta: createReviewedSourceMeta({
                namespace: 'esma',
                id: dailyEsma.latin,
                label: `Esma-ul Husna: ${dailyEsma.latin}`,
                type: 'esma_ul_husna',
                confidence: 'high'
            })
        },
        dua: {
            text: dailyDuaItem.meaning,
            arabic: dailyDuaItem.arabic,
            source: dailyDuaItem.title,
            sourceMeta: createReviewedSourceMeta({
                namespace: 'dua',
                id: dailyDuaItem.title,
                label: dailyDuaItem.title,
                type: 'daily_dua'
            })
        },
        verse: {
            reference: verseReference,
            arabic: dailyVerse.arabic,
            translation: verseText,
            text: verseText,
            image: dailyVerse.image,
            sourceMeta: createReviewedSourceMeta({
                namespace: 'verse',
                id: dailyVerse.reference,
                label: dailyVerse.reference,
                type: 'daily_content',
                confidence: 'high'
            })
        },
        hadith: {
            text: dailyHadith.text,
            arabic: dailyHadith.arabic || '',
            source: dailyHadith.source || (isTr ? 'Hadis-i Şerif' : 'Hadith'),
            image: '/stories/pattern-2.webp',
            sourceMeta: createReviewedSourceMeta({
                namespace: 'hadith',
                id: String(dailyHadith.id || dayOfYear),
                label: dailyHadith.source || 'Hadis-i Serif',
                type: 'hadith'
            })
        },
        quote: {
            text: quoteText,
            author: quoteAuthor,
            image: dailyQuote.image
        },
        insight: { text: `"${quoteText}" (${quoteAuthor})` },
        dailyDua: {
            text: dailyDuaItem.meaning,
            arabic: dailyDuaItem.arabic,
            title: dailyDuaItem.title,
            image: '/stories/mosque.webp',
            sourceMeta: createReviewedSourceMeta({
                namespace: 'daily_dua',
                id: dailyDuaItem.title,
                label: dailyDuaItem.title,
                type: 'daily_dua'
            })
        }
    };
};

type HadithCategory = {
    id: string;
    name: string;
    icon: string;
    color: string;
};

export const contentService = {
    getEsmaUlHusna: async (language: string): Promise<EsmaEntry[]> => {
        if (language === 'tr') {
            return ESMA_UL_HUSNA as EsmaEntry[];
        }
        if (['en', 'de', 'id'].includes(language.slice(0, 2))) {
            return ESMA_UL_HUSNA.map((esma) => ({ ...esma, ...getEsmaTranslation(esma.id, language) }));
        }

        try {
            const response = await fetch(ASMA_AL_HUSNA_API);
            const data = await response.json();
            
            if (data.code === 200) {
                return data.data.map((item: { number: number; name: string; transliteration: string; en: { meaning: string } }) => ({
                    id: item.number,
                    arabic: item.name,
                    latin: item.transliteration,
                    meaning: item.en.meaning,
                    detail: item.en.meaning
                }));
            }
            return ESMA_UL_HUSNA as EsmaEntry[];
        } catch (error) {
            logger.error('EsmaUlHusna fetch error:', error);
            return ESMA_UL_HUSNA as EsmaEntry[];
        }
    },

    getHadiths: async (language: string): Promise<{ categories: HadithCategory[]; hadiths: typeof hadiths; isCategorized: boolean }> => {
        if (language === 'tr') {
            return {
                categories: hadithCategories as HadithCategory[],
                hadiths: hadiths,
                isCategorized: true
            };
        }
        const col = hadithLangColumn(language);
        if (col !== null) {
            return {
                categories: (hadithCategories as HadithCategory[]).map((c) => ({ ...c, name: HADITH_CATEGORY_NAMES[c.id]?.[col] ?? c.name })),
                hadiths: hadiths.map((h) => localizeHadith(h, language)),
                isCategorized: true
            };
        }

        try {
            const response = await fetch(HADITH_API_EN);
            const data = await response.json();
            
            if (data.hadiths) {
                const mappedHadiths = data.hadiths.map((h: { hadithnumber: string; text: string }) => ({
                    id: h.hadithnumber,
                    category: 'general',
                    arabic: '',
                    text: h.text,
                    source: '40 Hadith Nawawi',
                    narrator: 'Unknown'
                }));

                return {
                    categories: [{ id: 'general', name: 'Forty Hadith Nawawi', icon: '📚', color: '#3498db' }],
                    hadiths: mappedHadiths,
                    isCategorized: false
                };
            }
            return { categories: hadithCategories as HadithCategory[], hadiths: hadiths, isCategorized: true };
        } catch (error) {
            logger.error('Hadith fetch error:', error);
            return { categories: hadithCategories as HadithCategory[], hadiths: hadiths, isCategorized: true };
        }
    },
    
    getDailyContent
};
