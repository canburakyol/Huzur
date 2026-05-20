import { logger } from '../utils/logger';
import { hadiths, hadithCategories } from '../data/hadiths';
import { prayers } from '../data/prayers';
import { ESMA_UL_HUSNA } from '../data/esmaUlHusnaData';
import { createReviewedSourceMeta } from '../data/reviewedSourceRegistry';
import { getActiveCampaign } from './campaignService';

const ASMA_AL_HUSNA_API = 'https://api.aladhan.com/v1/asmaAlHusna';
const HADITH_API_EN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-nawawi.min.json';

const DAILY_VERSES = [
    { reference: 'Bakara, 153', arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', translation: 'Allah sabredenlerle beraberdir.', image: '/stories/quran-1.jpg' },
    { reference: 'Ra\'d, 28', arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', translation: 'Kalpler ancak Allah\'ı anmakla huzur bulur.', image: '/stories/quran-2.jpg' },
    { reference: 'İnşirah, 5-6', arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'Şüphesiz güçlükle beraber bir kolaylık vardır.', image: '/stories/quran.png' },
    { reference: 'Taha, 114', arabic: 'رَّبِّ زِدْنِي عِلْمًا', translation: 'Rabbim! İlmimi artır.', image: '/stories/quran-1.jpg' },
    { reference: 'Talak, 3', arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', translation: 'Kim Allah\'a tevekkül ederse O, ona yeter.', image: '/stories/quran-2.jpg' }
];

const DAILY_QUOTES = [
    { text: 'Kendini bilen Rabbini bilir.', author: 'Hz. Ali (r.a.)', image: '/stories/mosque-1.jpg' },
    { text: 'Sabır, imanın yarısıdır.', author: 'Abdullah ibn Mesud (r.a.)', image: '/stories/mosque-2.jpg' },
    { text: 'Gel, ne olursan ol yine gel.', author: 'Mevlana', image: '/stories/mosque-3.jpg' },
    { text: 'Yaratılmışı Yaratan\'dan ötürü sev.', author: 'Yunus Emre', image: '/stories/nature.png' },
    { text: 'Her şey zıddıyla kaimdir.', author: 'Mevlana', image: '/stories/pattern.png' }
];

type DailyContent = {
    campaign: { id: string; region: string; variant: string; timezone: string; date: string };
    esma: { name: string; arabic: string; meaning: string; sourceMeta: unknown };
    dua: { text: string; arabic: string; source: string; sourceMeta: unknown };
    verse: { reference: string; arabic: string; translation: string; text: string; image: string; sourceMeta: unknown };
    hadith: { text: string; arabic: string; source: string; image: string; sourceMeta: unknown };
    quote: { text: string; author: string; image: string };
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

export const getDailyContent = (): DailyContent => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const campaign = getActiveCampaign(today);

    const dailyEsma = ESMA_UL_HUSNA[dayOfYear % ESMA_UL_HUSNA.length] as EsmaEntry;

    const dailyPrayers = prayers.filter((p: PrayerEntry) => p.category === 'daily');
    const dailyDuaItem = dailyPrayers[dayOfYear % dailyPrayers.length] || prayers[0] as PrayerEntry;

    const dailyVerse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];

    const dailyHadith = hadiths[dayOfYear % hadiths.length] as HadithEntry;

    const dailyQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

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
            reference: dailyVerse.reference,
            arabic: dailyVerse.arabic,
            translation: dailyVerse.translation,
            text: dailyVerse.translation,
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
            source: dailyHadith.source || 'Hadis-i Şerif',
            image: '/stories/pattern-2.jpg',
            sourceMeta: createReviewedSourceMeta({
                namespace: 'hadith',
                id: dailyHadith.id || dayOfYear,
                label: dailyHadith.source || 'Hadis-i Serif',
                type: 'hadith'
            })
        },
        quote: {
            text: dailyQuote.text,
            author: dailyQuote.author,
            image: dailyQuote.image
        },
        dailyDua: {
            text: dailyDuaItem.meaning,
            arabic: dailyDuaItem.arabic,
            title: dailyDuaItem.title,
            image: '/stories/mosque.png',
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
