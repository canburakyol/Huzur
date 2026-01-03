/**
 * Mood Data - Ruh hallerine göre statik ayet ve mealleri
 * Ücretsiz kullanıcılar için AI yerine bu veri seti kullanılacaktır.
 */

export const MOODS = {
  HAPPY: {
    id: 'happy',
    label: 'Mutlu / Şükür Dolu',
    emoji: '😊',
    color: '#f1c40f',
    ayahs: [
      {
        surah: 'İbrahim',
        ayah: 7,
        text: 'لَئِنْ شَكَرْتُمْ لَاَز۪يدَنَّكُمْ',
        translation: 'Eğer şükrederseniz, elbette size (nimetimi) artırırım.'
      },
      {
        surah: 'Duha',
        ayah: 11,
        text: 'وَاَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ',
        translation: 'Rabbinin nimetine gelince; işte onu anlat da anlat.'
      }
    ]
  },
  SAD: {
    id: 'sad',
    label: 'Üzgün / Dertli',
    emoji: '😔',
    color: '#3498db',
    ayahs: [
      {
        surah: 'İnşirah',
        ayah: 5,
        text: 'فَاِنَّ مَعَ الْعُسْرِ يُسْرًا',
        translation: 'Şüphesiz güçlükle beraber bir kolaylık vardır.'
      },
      {
        surah: 'Bakara',
        ayah: 286,
        text: 'لَا يُكَلِّفُ اللّٰهُ نَفْسًا اِلَّا وُسْعَهَا',
        translation: 'Allah hiçbir kimseye gücünün yeteceğinden başkasını yüklemez.'
      },
      {
        surah: 'Tevbe',
        ayah: 40,
        text: 'لَا تَحْزَنْ اِنَّ اللّٰهَ مَعَنَا',
        translation: 'Üzülme, çünkü Allah bizimle beraberdir.'
      }
    ]
  },
  ANXIOUS: {
    id: 'anxious',
    label: 'Endişeli / Huzursuz',
    emoji: '😰',
    color: '#95a5a6',
    ayahs: [
      {
        surah: 'Rad',
        ayah: 28,
        text: 'اَلَا بِذِكْرِ اللّٰهِ تَطْمَئِنُّ الْقُلُوبُ',
        translation: 'Bilesiniz ki, kalpler ancak Allah’ı anmakla huzur bulur.'
      },
      {
        surah: 'Talak',
        ayah: 3,
        text: 'وَمَنْ يَتَوَكَّلْ عَلَى اللّٰهِ فَهُوَ حَسْبُهُ',
        translation: 'Kim Allah’a tevekkül ederse, O kendisine yeter.'
      }
    ]
  },
  ANGRY: {
    id: 'angry',
    label: 'Öfkeli',
    emoji: '😠',
    color: '#e74c3c',
    ayahs: [
      {
        surah: 'Al-i İmran',
        ayah: 134,
        text: 'وَالْكَاظِم۪ينَ الْغَيْظَ وَالْعَاف۪ينَ عَنِ النَّاسِ',
        translation: 'Onlar öfkelerini yenerler ve insanları affederler.'
      },
      {
        surah: 'Araf',
        ayah: 199,
        text: 'خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ وَاَعْرِضْ عَنِ الْجَاهِل۪ينَ',
        translation: 'Sen affı tut, iyiliği emret ve cahillerden yüz çevir.'
      }
    ]
  },
  WEAK: {
    id: 'weak',
    label: 'Yorgun / Zayıf',
    emoji: '😫',
    color: '#8e44ad',
    ayahs: [
      {
        surah: 'Bakara',
        ayah: 153,
        text: 'اِنَّ اللّٰهَ مَعَ الصَّابِر۪ينَ',
        translation: 'Şüphesiz Allah sabredenlerle beraberdir.'
      },
      {
        surah: 'Nisa',
        ayah: 28,
        text: 'وَخُلِقَ الْاِنْسَانُ ضَع۪يفًا',
        translation: 'Çünkü insan zayıf yaratılmıştır.'
      }
    ]
  }
};
