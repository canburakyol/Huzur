const fs = require('fs');
const path = require('path');

const languages = ['tr', 'en', 'ar'];

languages.forEach(lang => {
    const prayersPath = path.join(__dirname, 'public', 'locales', lang, 'prayers.json');
    const translationPath = path.join(__dirname, 'public', 'locales', lang, 'translation.json');

    if (fs.existsSync(prayersPath) && fs.existsSync(translationPath)) {
        try {
            const prayersData = JSON.parse(fs.readFileSync(prayersPath, 'utf8'));
            const translationData = JSON.parse(fs.readFileSync(translationPath, 'utf8'));

            // Check if prayerBook exists in prayers.json
            if (prayersData.prayerBook) {
                console.log(`Merging prayerBook from ${lang}/prayers.json to translation.json`);
                translationData.prayerBook = prayersData.prayerBook;
                
                fs.writeFileSync(translationPath, JSON.stringify(translationData, null, 2));
                console.log(`Updated ${lang}/translation.json`);
            } else {
                console.log(`prayerBook not found in ${lang}/prayers.json`);
            }
        } catch (error) {
            console.error(`Error processing ${lang}:`, error);
        }
    } else {
        console.log(`Files not found for ${lang}`);
    }
});
