const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const lang = 'ar';

const newKeys = {
  community: {
    title: "المجتمع",
    tabs: {
      duas: "أخوة الدعاء",
      hatims: "الختمة أونلاين"
    },
    buttons: {
      cancel: "إلغاء",
      requestDua: "طلب دعاء / ترك ملاحظة",
      share: "مشاركة",
      amin: "آمين"
    },
    placeholders: {
      writeDua: "اكتب دعاءك هنا..."
    },
    messages: {
      loading: "جاري التحميل...",
      noDuas: "لا توجد طلبات دعاء بعد. كن الأول!",
      errorSending: "حدث خطأ أثناء إرسال الدعاء."
    }
  }
};

const filePath = path.join(localesDir, lang, 'translation.json');
if (fs.existsSync(filePath)) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    if (!data.community) {
      data.community = newKeys.community;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Updated ${lang}/translation.json with community keys.`);
    } else {
      console.log(`${lang}/translation.json already has community keys.`);
    }
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e.message);
  }
}
