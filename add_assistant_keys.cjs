const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const languages = ['tr', 'en', 'ar'];

const newKeys = {
  tr: {
    welcomeMessage: "Selamun Aleyküm! Ben İslami Asistanınızım. Size nasıl yardımcı olabilirim?",
    errorMessage: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
    found: "ayet bulundu",
    placeholder: "Bir soru sorun...",
    limitReached: "Günlük soru limitine ulaştınız. Sınırsız erişim için Pro'ya geçin.",
    proSoon: "Pro sürüm çok yakında!",
    upgradePro: "Pro'ya Yükselt",
    questions: {
      q1: "Namaz nasıl kılınır?",
      q2: "Orucu bozan şeyler nelerdir?",
      q3: "Zekat kimlere verilir?",
      q4: "Abdest nasıl alınır?",
      q5: "Kuran okumanın fazileti",
      q6: "Peygamberimizin hayatı"
    }
  },
  en: {
    welcomeMessage: "As-salamu alaykum! I am your Islamic Assistant. How can I help you?",
    errorMessage: "Sorry, an error occurred. Please try again.",
    found: "verses found",
    placeholder: "Ask a question...",
    limitReached: "You have reached your daily question limit. Upgrade to Pro for unlimited access.",
    proSoon: "Pro version coming soon!",
    upgradePro: "Upgrade to Pro",
    questions: {
      q1: "How to perform Salah?",
      q2: "What invalidates fasting?",
      q3: "Who is eligible for Zakat?",
      q4: "How to perform Wudu?",
      q5: "Virtues of reading Quran",
      q6: "Life of the Prophet"
    }
  },
  ar: {
    welcomeMessage: "السلام عليكم! أنا مساعدك الإسلامي. كيف يمكنني مساعدتك؟",
    errorMessage: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.",
    found: "آيات وجدت",
    placeholder: "اطرح سؤالاً...",
    limitReached: "لقد وصلت إلى الحد اليومي للأسئلة. قم بالترقية إلى برو للوصول غير المحدود.",
    proSoon: "نسخة برو قريباً!",
    upgradePro: "الترقية إلى برو",
    questions: {
      q1: "كيفية الصلاة؟",
      q2: "مفسدات الصيام",
      q3: "لمن تعطى الزكاة؟",
      q4: "كيفية الوضوء؟",
      q5: "فضل قراءة القرآن",
      q6: "حياة النبي"
    }
  }
};

languages.forEach(lang => {
  const filePath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      if (!data.assistant) {
        data.assistant = {};
      }

      // Merge new keys
      Object.assign(data.assistant, newKeys[lang]);

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Updated ${lang}/translation.json with assistant keys.`);
    } catch (e) {
      console.error(`Error processing ${filePath}:`, e.message);
    }
  }
});
