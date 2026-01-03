import { ESMA_UL_HUSNA } from '../data/esmaUlHusnaData';
import { hadiths, hadithCategories } from '../data/hadiths';
import { prayers } from '../data/prayers';

// API Endpoints
const ASMA_AL_HUSNA_API = 'http://api.aladhan.com/v1/asmaAlHusna';
const HADITH_API_EN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-nawawi.min.json';

// Daily Verses Data (Fallback/Local)
const DAILY_VERSES = [
    { reference: 'Bakara, 153', arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', translation: 'Allah sabredenlerle beraberdir.', image: '/stories/quran-1.jpg' },
    { reference: 'Ra\'d, 28', arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', translation: 'Kalpler ancak Allah\'ı anmakla huzur bulur.', image: '/stories/quran-2.jpg' },
    { reference: 'İnşirah, 5-6', arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: 'Şüphesiz güçlükle beraber bir kolaylık vardır.', image: '/stories/quran.png' },
    { reference: 'Taha, 114', arabic: 'رَّبِّ زِدْنِي عِلْمًا', translation: 'Rabbim! İlmimi artır.', image: '/stories/quran-1.jpg' },
    { reference: 'Talak, 3', arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', translation: 'Kim Allah\'a tevekkül ederse O, ona yeter.', image: '/stories/quran-2.jpg' }
];

// Daily Quotes Data
const DAILY_QUOTES = [
    { text: 'Kendini bilen Rabbini bilir.', author: 'Hz. Ali (r.a.)', image: '/stories/mosque-1.jpg' },
    { text: 'Sabır, imanın yarısıdır.', author: 'Abdullah ibn Mesud (r.a.)', image: '/stories/mosque-2.jpg' },
    { text: 'Gel, ne olursan ol yine gel.', author: 'Mevlana', image: '/stories/mosque-3.jpg' },
    { text: 'Yaratılmışı Yaratan\'dan ötürü sev.', author: 'Yunus Emre', image: '/stories/nature.png' },
    { text: 'Her şey zıddıyla kaimdir.', author: 'Mevlana', image: '/stories/pattern.png' }
];

/**
 * Get Daily Content (Esma, Dua, Verse, Hadith, Quote, DailyDua)
 * Returns content structure expected by Stories.jsx and DailyContentGrid.jsx
 */
export const getDailyContent = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    // Daily Esma
    const dailyEsma = ESMA_UL_HUSNA[dayOfYear % ESMA_UL_HUSNA.length];

    // Daily Dua (Daily category from prayers)
    const dailyPrayers = prayers.filter(p => p.category === 'daily');
    const dailyDuaItem = dailyPrayers[dayOfYear % dailyPrayers.length] || prayers[0];

    // Daily Verse
    const dailyVerse = DAILY_VERSES[dayOfYear % DAILY_VERSES.length];

    // Daily Hadith (from hadiths data)
    const dailyHadith = hadiths[dayOfYear % hadiths.length];

    // Daily Quote
    const dailyQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

    return {
        // For DailyContentGrid.jsx
        esma: {
            name: dailyEsma.latin,
            arabic: dailyEsma.arabic,
            meaning: dailyEsma.meaning
        },
        dua: {
            text: dailyDuaItem.meaning,
            arabic: dailyDuaItem.arabic,
            source: dailyDuaItem.title
        },
        // For Stories.jsx
        verse: {
            reference: dailyVerse.reference,
            arabic: dailyVerse.arabic,
            translation: dailyVerse.translation,
            text: dailyVerse.translation,
            image: dailyVerse.image
        },
        hadith: {
            text: dailyHadith.text,
            arabic: dailyHadith.arabic || '',
            source: dailyHadith.source || 'Hadis-i Şerif',
            image: '/stories/pattern-2.jpg'
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
            image: '/stories/mosque.png'
        }
    };
};

export const contentService = {
    /**
     * Get Esma-ül Hüsna based on language
     * @param {string} language - 'tr', 'en', etc.
     */
    getEsmaUlHusna: async (language) => {
        if (language === 'tr') {
            return ESMA_UL_HUSNA;
        }

        try {
            const response = await fetch(ASMA_AL_HUSNA_API);
            const data = await response.json();
            
            if (data.code === 200) {
                return data.data.map(item => ({
                    id: item.number,
                    arabic: item.name,
                    latin: item.transliteration,
                    meaning: item.en.meaning,
                    detail: item.en.meaning // English API doesn't have detailed description, using meaning as fallback
                }));
            }
            return ESMA_UL_HUSNA; // Fallback to TR if API fails
        } catch (error) {
            console.error('EsmaUlHusna fetch error:', error);
            return ESMA_UL_HUSNA; // Fallback
        }
    },

    /**
     * Get Hadiths based on language
     * @param {string} language 
     */
    getHadiths: async (language) => {
        if (language === 'tr') {
            return {
                categories: hadithCategories,
                hadiths: hadiths,
                isCategorized: true
            };
        }

        try {
            const response = await fetch(HADITH_API_EN);
            const data = await response.json();
            
            if (data.hadiths) {
                // Map 40 Hadith Nawawi to our structure
                const mappedHadiths = data.hadiths.map(h => ({
                    id: h.hadithnumber,
                    category: 'general', // English hadiths are not categorized in this API
                    arabic: '', // API doesn't provide full Arabic text in this endpoint usually, or it's separate
                    text: h.text,
                    source: '40 Hadith Nawawi',
                    narrator: 'Unknown' // API might not have narrator parsed easily
                }));

                return {
                    categories: [{ id: 'general', name: 'Forty Hadith Nawawi', icon: '📚', color: '#3498db' }],
                    hadiths: mappedHadiths,
                    isCategorized: false // Flag to tell UI to show list directly or single category
                };
            }
            return { categories: hadithCategories, hadiths: hadiths, isCategorized: true };
        } catch (error) {
            console.error('Hadith fetch error:', error);
            return { categories: hadithCategories, hadiths: hadiths, isCategorized: true };
        }
    },
    
    getDailyContent
};
