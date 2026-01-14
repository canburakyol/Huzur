const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const languages = ['tr', 'en', 'ar'];

languages.forEach(lang => {
  const filePath = path.join(localesDir, lang, 'prayers.json');
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      if (!data.prayerBook) {
        console.log(`Wrapping ${lang}/prayers.json...`);
        const newData = { prayerBook: data };
        fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
      } else {
        console.log(`${lang}/prayers.json already wrapped.`);
      }
    } catch (e) {
      console.error(`Error processing ${filePath}:`, e.message);
    }
  } else {
    console.warn(`Missing file: ${filePath}`);
  }
});
