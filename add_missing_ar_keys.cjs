const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const lang = 'ar';

const newKeys = {
  esma: {
    title: "أسماء الله الحسنى",
    subtitle: "99 اسماً لله",
    daily: "اسم اليوم",
    search_placeholder: "بحث عن اسم...",
    count_suffix: "اسم"
  },
  hikmet: {
    daily: "حكمة اليوم",
    favorite: "مفضل",
    share: "مشاركة",
    new: "جديد",
    categoriesTitle: "التصنيفات",
    favorites: "المفضلة",
    copied: "تم نسخ الحكمة!",
    shareText: "\"{{text}}\"\n\n— {{source}}{{ref}}\n\n📜 {{appName}}",
    title: "كتاب الحكمة"
  }
};

const filePath = path.join(localesDir, lang, 'translation.json');
if (fs.existsSync(filePath)) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // Add esma
    if (!data.esma) {
      data.esma = newKeys.esma;
      console.log(`Added esma to ${lang}/translation.json`);
    }

    // Add hikmet (top-level)
    if (!data.hikmet) {
      data.hikmet = newKeys.hikmet;
      console.log(`Added hikmet to ${lang}/translation.json`);
    } else {
        // Merge if exists but missing keys
        Object.assign(data.hikmet, newKeys.hikmet);
        console.log(`Merged hikmet in ${lang}/translation.json`);
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e.message);
  }
}
