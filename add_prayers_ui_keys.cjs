const fs = require('fs');
const path = require('path');

const prayersUI = {
    tr: {
        prayers: {
            title: "Dua Kitabı",
            categories: "Kategori",
            prayer: "Dua",
            quote: "Dua müminin silahıdır.",
            quoteAuthor: "Hz. Muhammed (s.a.v.)",
            prayerDetail: "Dua Detayı",
            pronunciation: "Okunuşu",
            meaning: "Anlamı"
        }
    },
    en: {
        prayers: {
            title: "Prayer Book",
            categories: "Categories",
            prayer: "Prayers",
            quote: "Prayer is the weapon of the believer.",
            quoteAuthor: "Prophet Muhammad (pbuh)",
            prayerDetail: "Prayer Detail",
            pronunciation: "Pronunciation",
            meaning: "Meaning"
        }
    },
    ar: {
        prayers: {
            title: "كتاب الدعاء",
            categories: "الفئات",
            prayer: "الأدعية",
            quote: "الدعاء سلاح المؤمن.",
            quoteAuthor: "النبي محمد ﷺ",
            prayerDetail: "تفاصيل الدعاء",
            pronunciation: "النطق",
            meaning: "المعنى"
        }
    }
};

['tr', 'en', 'ar'].forEach(lang => {
    const filePath = path.join(__dirname, 'public', 'locales', lang, 'translation.json');
    
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Add prayers object if it doesn't exist
        if (!data.prayers) {
            data.prayers = prayersUI[lang].prayers;
            console.log(`Added prayers object to ${lang}/translation.json`);
        } else {
            // Merge with existing
            data.prayers = { ...data.prayers, ...prayersUI[lang].prayers };
            console.log(`Merged prayers keys in ${lang}/translation.json`);
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
});

console.log('Done!');
