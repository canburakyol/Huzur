/**
 * Word-by-Word (Kelime Kelime) Veri Yapısı
 * Kısa sureler için kelime kelime Türkçe anlam
 * 
 * Ücretsiz Sureler: Fatiha (1), İhlas (112), Felak (113), Nas (114)
 */

export const wordByWordData = {
  // Fatiha Suresi (7 ayet)
  1: {
    name: "Fatiha",
    arabicName: "الفاتحة",
    meaning: "Açılış",
    ayahCount: 7,
    verses: [
      {
        number: 1,
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        words: [
          { arabic: "بِسْمِ", transliteration: "Bismi", meaning: "adıyla" },
          { arabic: "اللَّهِ", transliteration: "Allahi", meaning: "Allah'ın" },
          { arabic: "الرَّحْمَٰنِ", transliteration: "er-Rahmani", meaning: "Rahman olan" },
          { arabic: "الرَّحِيمِ", transliteration: "er-Rahimi", meaning: "Rahim olan" }
        ]
      },
      {
        number: 2,
        arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        words: [
          { arabic: "الْحَمْدُ", transliteration: "el-Hamdü", meaning: "Hamd" },
          { arabic: "لِلَّهِ", transliteration: "lillahi", meaning: "Allah'a aittir" },
          { arabic: "رَبِّ", transliteration: "Rabbi", meaning: "Rabbi" },
          { arabic: "الْعَالَمِينَ", transliteration: "el-alemin", meaning: "âlemlerin" }
        ]
      },
      {
        number: 3,
        arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
        words: [
          { arabic: "الرَّحْمَٰنِ", transliteration: "er-Rahmani", meaning: "Rahman" },
          { arabic: "الرَّحِيمِ", transliteration: "er-Rahimi", meaning: "Rahim" }
        ]
      },
      {
        number: 4,
        arabic: "مَالِكِ يَوْمِ الدِّينِ",
        words: [
          { arabic: "مَالِكِ", transliteration: "Maliki", meaning: "Sahibi" },
          { arabic: "يَوْمِ", transliteration: "yevmi", meaning: "günün" },
          { arabic: "الدِّينِ", transliteration: "ed-din", meaning: "hesap/din" }
        ]
      },
      {
        number: 5,
        arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        words: [
          { arabic: "إِيَّاكَ", transliteration: "İyyake", meaning: "Yalnız Sana" },
          { arabic: "نَعْبُدُ", transliteration: "na'budü", meaning: "ibadet ederiz" },
          { arabic: "وَإِيَّاكَ", transliteration: "ve iyyake", meaning: "ve yalnız Senden" },
          { arabic: "نَسْتَعِينُ", transliteration: "neste'in", meaning: "yardım dileriz" }
        ]
      },
      {
        number: 6,
        arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        words: [
          { arabic: "اهْدِنَا", transliteration: "İhdina", meaning: "Bizi hidayet et" },
          { arabic: "الصِّرَاطَ", transliteration: "es-sırata", meaning: "yola" },
          { arabic: "الْمُسْتَقِيمَ", transliteration: "el-müstakim", meaning: "dosdoğru" }
        ]
      },
      {
        number: 7,
        arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        words: [
          { arabic: "صِرَاطَ", transliteration: "Sırata", meaning: "Yoluna" },
          { arabic: "الَّذِينَ", transliteration: "ellezine", meaning: "o kimselerin" },
          { arabic: "أَنْعَمْتَ", transliteration: "en'amte", meaning: "nimet verdiğin" },
          { arabic: "عَلَيْهِمْ", transliteration: "aleyhim", meaning: "onlara" },
          { arabic: "غَيْرِ", transliteration: "ğayri", meaning: "değil" },
          { arabic: "الْمَغْضُوبِ", transliteration: "el-mağdubi", meaning: "gazaba uğramışların" },
          { arabic: "عَلَيْهِمْ", transliteration: "aleyhim", meaning: "onların" },
          { arabic: "وَلَا", transliteration: "ve la", meaning: "ve değil" },
          { arabic: "الضَّالِّينَ", transliteration: "ed-dallin", meaning: "sapıtmışların" }
        ]
      }
    ]
  },

  // İhlas Suresi (4 ayet)
  112: {
    name: "İhlas",
    arabicName: "الإخلاص",
    meaning: "Samimiyet/Arınma",
    ayahCount: 4,
    verses: [
      {
        number: 1,
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        words: [
          { arabic: "قُلْ", transliteration: "Kul", meaning: "De ki" },
          { arabic: "هُوَ", transliteration: "huve", meaning: "O" },
          { arabic: "اللَّهُ", transliteration: "Allahu", meaning: "Allah" },
          { arabic: "أَحَدٌ", transliteration: "ehad", meaning: "birdir" }
        ]
      },
      {
        number: 2,
        arabic: "اللَّهُ الصَّمَدُ",
        words: [
          { arabic: "اللَّهُ", transliteration: "Allahu", meaning: "Allah" },
          { arabic: "الصَّمَدُ", transliteration: "es-Samed", meaning: "Samed'dir (her şey O'na muhtaç)" }
        ]
      },
      {
        number: 3,
        arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        words: [
          { arabic: "لَمْ", transliteration: "Lem", meaning: "-medi" },
          { arabic: "يَلِدْ", transliteration: "yelid", meaning: "doğurmadı" },
          { arabic: "وَلَمْ", transliteration: "ve lem", meaning: "ve -medi" },
          { arabic: "يُولَدْ", transliteration: "yuled", meaning: "doğurulmadı" }
        ]
      },
      {
        number: 4,
        arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        words: [
          { arabic: "وَلَمْ", transliteration: "Ve lem", meaning: "Ve olmadı" },
          { arabic: "يَكُن", transliteration: "yekun", meaning: "olmak" },
          { arabic: "لَّهُ", transliteration: "lehu", meaning: "O'nun" },
          { arabic: "كُفُوًا", transliteration: "küfuven", meaning: "dengi" },
          { arabic: "أَحَدٌ", transliteration: "ehad", meaning: "hiçbiri" }
        ]
      }
    ]
  },

  // Felak Suresi (5 ayet)
  113: {
    name: "Felak",
    arabicName: "الفلق",
    meaning: "Sabah Aydınlığı",
    ayahCount: 5,
    verses: [
      {
        number: 1,
        arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
        words: [
          { arabic: "قُلْ", transliteration: "Kul", meaning: "De ki" },
          { arabic: "أَعُوذُ", transliteration: "e'uzü", meaning: "sığınırım" },
          { arabic: "بِرَبِّ", transliteration: "bi-Rabbi", meaning: "Rabbine" },
          { arabic: "الْفَلَقِ", transliteration: "el-felek", meaning: "sabahın" }
        ]
      },
      {
        number: 2,
        arabic: "مِن شَرِّ مَا خَلَقَ",
        words: [
          { arabic: "مِن", transliteration: "Min", meaning: "-dan/-den" },
          { arabic: "شَرِّ", transliteration: "şerri", meaning: "şerrinden" },
          { arabic: "مَا", transliteration: "ma", meaning: "şeylerin" },
          { arabic: "خَلَقَ", transliteration: "haleka", meaning: "yarattığı" }
        ]
      },
      {
        number: 3,
        arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        words: [
          { arabic: "وَمِن", transliteration: "Ve min", meaning: "Ve -dan" },
          { arabic: "شَرِّ", transliteration: "şerri", meaning: "şerrinden" },
          { arabic: "غَاسِقٍ", transliteration: "ğasikın", meaning: "karanlığın" },
          { arabic: "إِذَا", transliteration: "iza", meaning: "zaman" },
          { arabic: "وَقَبَ", transliteration: "vekab", meaning: "çöktüğü" }
        ]
      },
      {
        number: 4,
        arabic: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
        words: [
          { arabic: "وَمِن", transliteration: "Ve min", meaning: "Ve -dan" },
          { arabic: "شَرِّ", transliteration: "şerri", meaning: "şerrinden" },
          { arabic: "النَّفَّاثَاتِ", transliteration: "en-neffasati", meaning: "üfürükçülerin" },
          { arabic: "فِي", transliteration: "fi", meaning: "içinde" },
          { arabic: "الْعُقَدِ", transliteration: "el-ukad", meaning: "düğümlere" }
        ]
      },
      {
        number: 5,
        arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        words: [
          { arabic: "وَمِن", transliteration: "Ve min", meaning: "Ve -dan" },
          { arabic: "شَرِّ", transliteration: "şerri", meaning: "şerrinden" },
          { arabic: "حَاسِدٍ", transliteration: "hasidin", meaning: "hasetçinin" },
          { arabic: "إِذَا", transliteration: "iza", meaning: "zaman" },
          { arabic: "حَسَدَ", transliteration: "hased", meaning: "haset ettiği" }
        ]
      }
    ]
  },

  // Nas Suresi (6 ayet)
  114: {
    name: "Nas",
    arabicName: "الناس",
    meaning: "İnsanlar",
    ayahCount: 6,
    verses: [
      {
        number: 1,
        arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        words: [
          { arabic: "قُلْ", transliteration: "Kul", meaning: "De ki" },
          { arabic: "أَعُوذُ", transliteration: "e'uzü", meaning: "sığınırım" },
          { arabic: "بِرَبِّ", transliteration: "bi-Rabbi", meaning: "Rabbine" },
          { arabic: "النَّاسِ", transliteration: "en-nas", meaning: "insanların" }
        ]
      },
      {
        number: 2,
        arabic: "مَلِكِ النَّاسِ",
        words: [
          { arabic: "مَلِكِ", transliteration: "Meliki", meaning: "Melik'ine (Hükümdarına)" },
          { arabic: "النَّاسِ", transliteration: "en-nas", meaning: "insanların" }
        ]
      },
      {
        number: 3,
        arabic: "إِلَٰهِ النَّاسِ",
        words: [
          { arabic: "إِلَٰهِ", transliteration: "İlahi", meaning: "İlahına" },
          { arabic: "النَّاسِ", transliteration: "en-nas", meaning: "insanların" }
        ]
      },
      {
        number: 4,
        arabic: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
        words: [
          { arabic: "مِن", transliteration: "Min", meaning: "-dan" },
          { arabic: "شَرِّ", transliteration: "şerri", meaning: "şerrinden" },
          { arabic: "الْوَسْوَاسِ", transliteration: "el-vesvasi", meaning: "vesvesecinin" },
          { arabic: "الْخَنَّاسِ", transliteration: "el-hannas", meaning: "sinsi sinsi geri çekilenin" }
        ]
      },
      {
        number: 5,
        arabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
        words: [
          { arabic: "الَّذِي", transliteration: "Ellezi", meaning: "Ki o" },
          { arabic: "يُوَسْوِسُ", transliteration: "yüvesvisü", meaning: "vesvese verir" },
          { arabic: "فِي", transliteration: "fi", meaning: "içinde" },
          { arabic: "صُدُورِ", transliteration: "suduri", meaning: "göğüslerinin" },
          { arabic: "النَّاسِ", transliteration: "en-nas", meaning: "insanların" }
        ]
      },
      {
        number: 6,
        arabic: "مِنَ الْجِنَّةِ وَالنَّاسِ",
        words: [
          { arabic: "مِنَ", transliteration: "Mine", meaning: "-dan" },
          { arabic: "الْجِنَّةِ", transliteration: "el-cinneti", meaning: "cinlerden" },
          { arabic: "وَالنَّاسِ", transliteration: "ve en-nas", meaning: "ve insanlardan" }
        ]
      }
    ]
  }
};

/**
 * Belirli bir surenin word-by-word verisini getir
 */
export const getWordByWordData = (surahNumber) => {
  return wordByWordData[surahNumber] || null;
};

/**
 * Ücretsiz kullanılabilir sure listesi
 */
export const getFreeSurahs = () => {
  return Object.keys(wordByWordData).map(Number);
};

/**
 * Sure verisi var mı kontrol et
 */
export const hasWordByWordData = (surahNumber) => {
  return surahNumber in wordByWordData;
};

export default wordByWordData;
