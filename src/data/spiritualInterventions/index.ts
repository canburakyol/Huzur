interface SpiritualSource {
  coreMessage: string;
  confidence: 'high' | 'medium';
  reference: string;
  sourceId: string;
  sourceType: 'daily_dua' | 'daily_content' | 'hadith';
  sourceUrl: string;
}

interface TriggerCondition {
  dayOfWeek: 'any' | 'friday';
  timeOfDay: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'late_night';
  userState: 'low_iman_streak' | 'steady' | 'stressed';
}

interface SpiritualIntervention {
  confidence: 'high' | 'medium';
  content: {
    coreMessage: string;
    greeting: string;
    reflection: string;
    reference: string;
  };
  id: string;
  reviewStatus: 'reviewed';
  sourceId: string;
  sourceType: 'daily_dua' | 'daily_content' | 'hadith';
  sourceUrl: string;
  suggestedAction: 'open_quran' | 'play_huzur_audio' | 'do_zikir';
  trigger_condition: TriggerCondition;
}

const SOURCE_LIBRARY: Record<string, SpiritualSource> = {
  ali_imran_3_8: {
    coreMessage: 'Rabbimiz, bizi hidayete erdirdikten sonra kalplerimizi egip bukme; bize katindan rahmet ver.',
    confidence: 'high',
    reference: "Ali 'Imran 3:8",
    sourceId: 'ali_imran_3_8',
    sourceType: 'daily_dua',
    sourceUrl: 'https://quran.com/3/8'
  },
  ali_imran_3_139: {
    coreMessage: 'Gevsemeyin, uzulmeyin; imanla ayakta kalirsaniz ustun olan siz olursunuz.',
    confidence: 'high',
    reference: "Ali 'Imran 3:139",
    sourceId: 'ali_imran_3_139',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/3/139'
  },
  ahzab_33_56: {
    coreMessage: 'Allah ve melekleri Peygamber\'e salat eder; muminler de salat ve selam getirin.',
    confidence: 'high',
    reference: 'Al-Ahzab 33:56',
    sourceId: 'ahzab_33_56',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/33/56'
  },
  anfal_8_2: {
    coreMessage: 'Muminlerin kalpleri Allah anildiginda urperir ve ayetler onlara iman artisi verir.',
    confidence: 'high',
    reference: 'Al-Anfal 8:2',
    sourceId: 'anfal_8_2',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/8/2'
  },
  ankabut_29_45: {
    coreMessage: 'Namaz cirkinlikten ve taskinliktan alikoyar; Allah\'i anmak ise hepsinden buyuktur.',
    confidence: 'high',
    reference: "Al-'Ankabut 29:45",
    sourceId: 'ankabut_29_45',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/29/45'
  },
  baqarah_2_152: {
    coreMessage: 'Siz Beni anin ki Ben de sizi anayim; sukredin ve nankorluk etmeyin.',
    confidence: 'high',
    reference: 'Al-Baqarah 2:152',
    sourceId: 'baqarah_2_152',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/2/152'
  },
  baqarah_2_286: {
    coreMessage: 'Allah hicbir nefse gucunun yeteceginden fazlasini yuklemez.',
    confidence: 'high',
    reference: 'Al-Baqarah 2:286',
    sourceId: 'baqarah_2_286',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/2/286'
  },
  bukhari_1145: {
    coreMessage: 'Resulullah, gecenin son ucunun dua ve istiğfar icin rahmet kapilarinin acildigi bir vakit oldugunu haber verdi.',
    confidence: 'medium',
    reference: 'Sahih al-Bukhari 1145',
    sourceId: 'bukhari_1145',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/bukhari:1145'
  },
  bukhari_5641: {
    coreMessage: 'Muslumani yoran her yorgunluk, uzuntu ve sikinti Allah\'in izniyle gunahlara kefaret olur.',
    confidence: 'medium',
    reference: 'Sahih al-Bukhari 5641',
    sourceId: 'bukhari_5641',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/bukhari:5641'
  },
  bukhari_6464: {
    coreMessage: 'Allah\'a en sevimli amel, az da olsa devamli olandir.',
    confidence: 'medium',
    reference: 'Sahih al-Bukhari 6464',
    sourceId: 'bukhari_6464',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/bukhari:6464'
  },
  bukhari_935: {
    coreMessage: 'Cuma gununde, kulun dua ettiginde karsilik bulacagi ozel bir zaman vardir.',
    confidence: 'medium',
    reference: 'Sahih al-Bukhari 935',
    sourceId: 'bukhari_935',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/bukhari:935'
  },
  duha_93_5: {
    coreMessage: 'Rabbin sana lutfedecek ve sonunda gonlun hosnut olacak.',
    confidence: 'high',
    reference: 'Ad-Duha 93:5',
    sourceId: 'duha_93_5',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/93/5'
  },
  dhariyat_51_55: {
    coreMessage: 'Hatirlat; cunku hatirlatma muminlere fayda verir.',
    confidence: 'high',
    reference: 'Adh-Dhariyat 51:55',
    sourceId: 'dhariyat_51_55',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/51/55'
  },
  furqan_25_74: {
    coreMessage: 'Rabbimiz, eslerimizi ve nesillerimizi goz aydinligi kil; bizi takva sahiplerine ornek yap.',
    confidence: 'high',
    reference: 'Al-Furqan 25:74',
    sourceId: 'furqan_25_74',
    sourceType: 'daily_dua',
    sourceUrl: 'https://quran.com/25/74'
  },
  ghafir_40_60: {
    coreMessage: 'Rabbiniz, Bana dua edin ki size karsilik vereyim, buyurur.',
    confidence: 'high',
    reference: 'Ghafir 40:60',
    sourceId: 'ghafir_40_60',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/40/60'
  },
  isra_17_79: {
    coreMessage: 'Gecenin bir kisminda ilave namazla Rabbine yonel.',
    confidence: 'high',
    reference: 'Al-Isra 17:79',
    sourceId: 'isra_17_79',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/17/79'
  },
  jumuah_62_9: {
    coreMessage: 'Cuma ezani okundugunda Allah\'i anmaya kosun ve alisverisi birakin.',
    confidence: 'high',
    reference: "Al-Jumu'ah 62:9",
    sourceId: 'jumuah_62_9',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/62/9'
  },
  kahf_18_10: {
    coreMessage: 'Rabbimiz, bize katindan rahmet ver ve isimizde dogru yolu kolaylastir.',
    confidence: 'high',
    reference: 'Al-Kahf 18:10',
    sourceId: 'kahf_18_10',
    sourceType: 'daily_dua',
    sourceUrl: 'https://quran.com/18/10'
  },
  muslim_2664: {
    coreMessage: 'Guclu mumin Allah katinda daha sevimlidir; faydali olana saril, Allah\'tan yardim iste ve gevseme.',
    confidence: 'medium',
    reference: 'Sahih Muslim 2664',
    sourceId: 'muslim_2664',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/muslim:2664'
  },
  muslim_2999: {
    coreMessage: 'Muminin isi hayirdir; nimet gelirse sukreder, sikinti gelirse sabreder.',
    confidence: 'medium',
    reference: 'Sahih Muslim 2999',
    sourceId: 'muslim_2999',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/muslim:2999'
  },
  muslim_854b: {
    coreMessage: 'Resulullah, gunesin dogdugu en hayirli gunun cuma oldugunu bildirdi.',
    confidence: 'medium',
    reference: 'Sahih Muslim 854b',
    sourceId: 'muslim_854b',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/muslim:854b'
  },
  muzzammil_73_6: {
    coreMessage: 'Gece ibadeti, kalbi daha derinden etkileyen ve sozu daha berrak kilan bir vakittir.',
    confidence: 'high',
    reference: 'Al-Muzzammil 73:6',
    sourceId: 'muzzammil_73_6',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/73/6'
  },
  nahl_16_97: {
    coreMessage: 'Imanla salih amel isleyene Allah temiz ve guzel bir hayat vaad eder.',
    confidence: 'high',
    reference: 'An-Nahl 16:97',
    sourceId: 'nahl_16_97',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/16/97'
  },
  qaf_50_16: {
    coreMessage: 'Allah insana sah damarindan daha yakindir.',
    confidence: 'high',
    reference: 'Qaf 50:16',
    sourceId: 'qaf_50_16',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/50/16'
  },
  rad_13_28: {
    coreMessage: 'Kalpler ancak Allah\'i anmakla huzur bulur.',
    confidence: 'high',
    reference: "Ar-Ra'd 13:28",
    sourceId: 'rad_13_28',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/13/28'
  },
  sharh_94_5_6: {
    coreMessage: 'Suphesiz zorlugun yaninda kolaylik vardir; evet, zorlugun yaninda kolaylik vardir.',
    confidence: 'high',
    reference: 'Ash-Sharh 94:5-6',
    sourceId: 'sharh_94_5_6',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/94/5-6'
  },
  taha_20_25_28: {
    coreMessage: 'Rabbim, gogsumu genislet, isimi kolaylastir ve dilimdeki dugumu cozumle.',
    confidence: 'high',
    reference: 'Ta-Ha 20:25-28',
    sourceId: 'taha_20_25_28',
    sourceType: 'daily_dua',
    sourceUrl: 'https://quran.com/20/25-28'
  },
  taha_20_46: {
    coreMessage: 'Korkmayin; Ben sizinle birlikteyim, isitir ve gorurum.',
    confidence: 'high',
    reference: 'Ta-Ha 20:46',
    sourceId: 'taha_20_46',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/20/46'
  },
  tawbah_9_51: {
    coreMessage: 'Bize ancak Allah\'in bizim icin yazdigi sey isabet eder; O bizim Mevlamizdir.',
    confidence: 'high',
    reference: 'At-Tawbah 9:51',
    sourceId: 'tawbah_9_51',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/9/51'
  },
  yunus_10_57: {
    coreMessage: 'Kur\'an, kalplerde olana sifa, hidayet ve rahmet olarak gelmistir.',
    confidence: 'high',
    reference: 'Yunus 10:57',
    sourceId: 'yunus_10_57',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/10/57'
  },
  yusuf_12_86: {
    coreMessage: 'Yakup aleyhisselam, uzuntusunu ve tasasi yalniz Allah\'a arz ettigini soyledi.',
    confidence: 'high',
    reference: 'Yusuf 12:86',
    sourceId: 'yusuf_12_86',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/12/86'
  },
  zumar_39_53: {
    coreMessage: 'Kendi nefisleri aleyhine giden kullar bile Allah\'in rahmetinden umit kesmesin.',
    confidence: 'high',
    reference: 'Az-Zumar 39:53',
    sourceId: 'zumar_39_53',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/39/53'
  }
};

const ACTION_FALLBACK_BY_STATE: Record<string, 'open_quran' | 'play_huzur_audio' | 'do_zikir'> = {
  low_iman_streak: 'open_quran',
  steady: 'play_huzur_audio',
  stressed: 'do_zikir'
};

const ACTION_COPY: Record<string, string> = {
  do_zikir: 'kisa bir zikir',
  open_quran: "Kur'an ile birkac dakikalik temas",
  play_huzur_audio: 'sakin bir Huzur sesi'
};

const TIME_GREETING_VARIANTS: Record<string, Record<string, string[]>> = {
  any: {
    afternoon: [
      'Ikindiye dogru kalbini bir nebze hafifletmeye ne dersin?',
      'Gunun ikinci yarisi baslarken ic ritmini toparlayalim.',
      'Ogleden sonraki akis hizlandiysa once kalbine yer ac.'
    ],
    evening: [
      'Aksam inerken gunun yukunu biraz birak.',
      'Gunun sonuna gelirken kalbini yumusatacak bir durak var.',
      'Aksam vakti, icindeki sesi daha net duymak icin guzel bir esik.'
    ],
    late_night: [
      'Gecenin derinliginde kurulan temas daha sahici olabilir.',
      'Bu sessiz vakitte kalbinle Rabbine daha yakin olabilirsin.',
      'Teheccud saatleri kalbi toplamaya cok musaittir.'
    ],
    morning: [
      'Sabah yeni acilirken kalbine yumusak bir baslangic ver.',
      'Gun daha yeni baslarken aceleyi biraz yavaslatalim.',
      'Bugunun ilk saatlerinde kalbine nefes alacak alan ac.'
    ],
    night: [
      'Gece sakinliginde kalbini toplamak daha kolay olabilir.',
      'Gun kapanirken icindeki agirligi Rabbine birak.',
      'Gece, dis gurultunun azaldigi ve kalbin duyuldugu bir vakit.'
    ],
    noon: [
      'Ogle saatleri yogunlastiysa once nefesini duzelt.',
      'Gun ortasinda kisa bir manevi mola ritmi toparlayabilir.',
      'Ogle akisi hizliysa kalbine bir durak acmak iyi gelir.'
    ]
  },
  friday: {
    afternoon: [
      'Cuma ikindisi, kalbi toparlayan nadir vakitlerden biridir.',
      'Cuma ikindisinin sükuneti bugunu daha derli toplu bitirebilir.'
    ],
    evening: [
      'Cuma aksami, haftayi yumusak bir bicimde kapatmak icin guzel bir esik.',
      'Mubarek gunun sonuna gelirken kalbine biraz daha huzur ver.'
    ],
    late_night: [
      'Cuma gecesinin sessizligi, duayi daha derin hissettirebilir.',
      'Bu mubarek gecede kalbinle Rabbine donmek daha kolay olabilir.'
    ],
    morning: [
      'Cuma sabahi aceleyi azaltip niyetini tazele.',
      'Mubarek cuma sabahi kalbine sakin bir baslangic ver.'
    ],
    night: [
      'Cuma gecesi kalbi yumusatmak icin guzel bir vakittir.',
      'Mubarek gecede kucuk bir hatirlatma bile ic ritmi toparlayabilir.'
    ],
    noon: [
      'Cuma oglesi, zikrin ve duanin agirlik kazandigi bir esik.',
      'Cuma namazina yaklasan saatlerde kalbini toplayacak kisa bir durak var.'
    ]
  }
};

const TIME_REFLECTION_VARIANTS: Record<string, Record<string, string[]>> = {
  any: {
    afternoon: [
      'Ikindiye yaklasan saatler, gunun yorgunlugunu fark edip yon duzeltmek icin iyi bir esiktir.',
      'Ogleden sonraki akis, zihnin dagildigi ama niyetin yeniden toparlanabildigi bir zamandir.',
      'Gunun ikinci yarisi, baskiyi buyutmeden ritmi duzeltmek icin kucuk adimlara cok aciktir.'
    ],
    evening: [
      'Aksam vakti, gun boyu biriken duygularin yavas yavas gorunur oldugu bir esiktir.',
      'Gun kapanirken kurulan kucuk manevi temas, ic huzuru geceye tasiyabilir.',
      'Aksam saatleri, gunun agirligini Rabbine emanet etmek icin dogal bir davettir.'
    ],
    late_night: [
      'Gecenin bu vakti, gosteristen uzak bir samimiyetle Rabbine yonelmek icin cok elverislidir.',
      'Teheccud saatleri, kalbin daha duru duyuldugu ve duanin daha derinden kuruldugu anlardandir.',
      'Derin gece, dunyanin sesi kisilirken kalbin hakikate daha acik hale geldigi bir zaman olur.'
    ],
    morning: [
      'Sabah, niyetin gunun ritmini belirledigi en hassas esiklerden biridir.',
      'Gun baslarken kalbe verilen yon, kalan saatlerin tonunu buyuk olcude belirler.',
      'Sabah saatleri, ic ritmi zorlamadan yeniden duzene alma firsati verir.'
    ],
    night: [
      'Gece, dis kosusturmanin azaldigi ve kalbin kendi sesini daha net duydugu bir vakittir.',
      'Gun sona ererken kurulan manevi temas, zihni yumusatip kalbi guvende hissettirebilir.',
      'Gece vakti, hesaplasmak yerine teslimiyetle sakinlesmeyi ogrenmek icin guzel bir alandir.'
    ],
    noon: [
      'Gun ortasi, yogunlukla niyet arasindaki mesafenin kolayca acildigi bir zamandir.',
      'Ogle saatleri, hem bedeni hem zihni yeniden merkezlemek icin dogal bir durak sunar.',
      'Gunun tam ortasinda verilen kisa bir manevi mola, dagilan dikkati toparlamaya yardim eder.'
    ]
  },
  friday: {
    afternoon: [
      'Cuma ikindisi, dua ve tefekkure diger gunlere gore daha toplayici bir iklim tasir.',
      'Bu saatler, cuma bereketini haftanin geri kalanina tasimak icin guzel bir kapidir.'
    ],
    evening: [
      'Cuma aksami, haftanin yorgunlugunu merhamet ve sukru merkeze alarak kapatma firsati verir.',
      'Mubarek gunun son saatleri, kalbi yumusatan kucuk amelleri daha anlamli kilabilir.'
    ],
    late_night: [
      'Cuma gecesinin sessizligi, duaya ve ic hesaplasmaya baska gecelerden daha yumusak bir zemin sunar.',
      'Bu mubarek vakit, kalbi yormadan toparlayan samimi bir yonelis icin cok kiymetlidir.'
    ],
    morning: [
      'Cuma sabahi, haftalik kosusturmaya ragmen kalbi toparlayan ozel bir ferahlik tasir.',
      'Mubarek gunun basi, niyeti tazelemek ve haftaya anlam vermek icin essiz bir esiktir.'
    ],
    night: [
      'Cuma gecesi, haftanin geri kalanindan daha derli toplu bir teslimiyet duygusu uyandirabilir.',
      'Mubarek gecede kurulan kisa manevi temas, kalbi tahmin edilenden daha hizli toparlayabilir.'
    ],
    noon: [
      'Cuma oglesi, zikrin ve duanin gunluk akisa daha kolay yerlestigi bir vakittir.',
      'Bu esik, cuma namazinin bereketiyle niyeti yeniden merkeze almak icin cok elverislidir.'
    ]
  }
};

const STATE_SECOND_SENTENCE_VARIANTS: Record<string, string[]> = {
  low_iman_streak: [
    'Kendini uzak hissettigin anlarda bile kisa ama duzenli bir donus, kalbin tekrar isinmasina yardim eder; bugun bunun icin {action} yeterli olabilir.',
    'Iman ritmi dustugunde buyuk adimlar yerine samimi bir donus daha kalici olur; istersen bunu {action} ile baslatabilirsin.',
    'Bugun kalbin tamamen toparlanmasa bile yonunu yeniden cevirmek cok degerli; {action} bu donusu yumusaklastirabilir.'
  ],
  steady: [
    'Dengedeyken kurulan bu kucuk temas, sevat duygusunu korur ve sukru derinlestirir; istersen bunu {action} ile pekistirebilirsin.',
    'Kalbin sakin oldugunda kucuk ameller daha kolay kok salar; {action} bu istikrari gunun icine yaymana yardim edebilir.',
    'Ritmin yerindeyken bu tarz hatirlatmalar, dagilmadan devam etmeni saglar; {action} ile bunu nazikce surdurebilirsin.'
  ],
  stressed: [
    'Bu hatirlatmayi, kontrol etme baskisini bir anligina Rabbine birakman icin yumusak bir durak gibi dusun; ardindan {action} ile devam edebilirsin.',
    'Zihnin hizlandiginda kalbin daha kisa ve daha sade bir temasa ihtiyac duyar; bugun bunu {action} ile desteklemek iyi gelebilir.',
    'Baskinin buyudugu anlarda derin ve uzun bir plan gerekmeyebilir; sadece {action} ile ic ritmini biraz toparlaman yeterli olabilir.'
  ]
};

const ANY_ASSIGNMENTS: Record<string, Record<string, string[]>> = {
  afternoon: {
    low_iman_streak: ['zumar_39_53', 'ankabut_29_45', 'bukhari_6464'],
    steady: ['muslim_2999', 'baqarah_2_152', 'nahl_16_97'],
    stressed: ['sharh_94_5_6', 'ali_imran_3_139', 'yusuf_12_86']
  },
  evening: {
    low_iman_streak: ['ghafir_40_60', 'ali_imran_3_8', 'dhariyat_51_55'],
    steady: ['furqan_25_74', 'nahl_16_97', 'sharh_94_5_6'],
    stressed: ['rad_13_28', 'baqarah_2_286', 'bukhari_5641']
  },
  late_night: {
    low_iman_streak: ['ali_imran_3_8', 'kahf_18_10', 'bukhari_6464'],
    steady: ['isra_17_79', 'muslim_2999', 'muzzammil_73_6'],
    stressed: ['isra_17_79', 'taha_20_25_28', 'bukhari_1145']
  },
  morning: {
    low_iman_streak: ['zumar_39_53', 'ali_imran_3_8', 'bukhari_6464'],
    steady: ['baqarah_2_152', 'nahl_16_97', 'muslim_2999'],
    stressed: ['taha_20_25_28', 'duha_93_5', 'taha_20_46']
  },
  night: {
    low_iman_streak: ['zumar_39_53', 'yunus_10_57', 'ghafir_40_60'],
    steady: ['muslim_2999', 'baqarah_2_152', 'furqan_25_74'],
    stressed: ['qaf_50_16', 'rad_13_28', 'baqarah_2_286']
  },
  noon: {
    low_iman_streak: ['yunus_10_57', 'ghafir_40_60', 'muslim_2664'],
    steady: ['nahl_16_97', 'dhariyat_51_55', 'baqarah_2_152'],
    stressed: ['rad_13_28', 'baqarah_2_286', 'bukhari_5641']
  }
};

const FRIDAY_ASSIGNMENTS: Record<string, Record<string, string[]>> = {
  afternoon: {
    low_iman_streak: ['bukhari_935', 'zumar_39_53'],
    steady: ['muslim_854b', 'muslim_2999'],
    stressed: ['bukhari_935', 'rad_13_28']
  },
  evening: {
    low_iman_streak: ['zumar_39_53', 'ghafir_40_60'],
    steady: ['ahzab_33_56', 'baqarah_2_152'],
    stressed: ['bukhari_935', 'rad_13_28']
  },
  late_night: {
    low_iman_streak: ['bukhari_1145', 'ali_imran_3_8'],
    steady: ['isra_17_79', 'ahzab_33_56'],
    stressed: ['bukhari_1145', 'isra_17_79']
  },
  morning: {
    low_iman_streak: ['jumuah_62_9', 'zumar_39_53'],
    steady: ['muslim_854b', 'ahzab_33_56'],
    stressed: ['jumuah_62_9', 'muslim_854b']
  },
  night: {
    low_iman_streak: ['ghafir_40_60', 'ahzab_33_56'],
    steady: ['ahzab_33_56', 'muslim_854b'],
    stressed: ['bukhari_1145', 'rad_13_28']
  },
  noon: {
    low_iman_streak: ['jumuah_62_9', 'ali_imran_3_8'],
    steady: ['jumuah_62_9', 'ahzab_33_56'],
    stressed: ['jumuah_62_9', 'bukhari_935']
  }
};

interface ExtraEntry {
  dayOfWeek: 'any' | 'friday';
  sourceId: string;
  timeOfDay: string;
  userState: string;
}

const EXTRA_ENTRIES: ExtraEntry[] = [
  { dayOfWeek: 'any', sourceId: 'duha_93_5', timeOfDay: 'morning', userState: 'stressed' },
  { dayOfWeek: 'any', sourceId: 'yunus_10_57', timeOfDay: 'morning', userState: 'low_iman_streak' },
  { dayOfWeek: 'any', sourceId: 'tawbah_9_51', timeOfDay: 'noon', userState: 'stressed' },
  { dayOfWeek: 'any', sourceId: 'ankabut_29_45', timeOfDay: 'afternoon', userState: 'low_iman_streak' },
  { dayOfWeek: 'any', sourceId: 'furqan_25_74', timeOfDay: 'evening', userState: 'steady' },
  { dayOfWeek: 'any', sourceId: 'qaf_50_16', timeOfDay: 'night', userState: 'stressed' },
  { dayOfWeek: 'any', sourceId: 'bukhari_1145', timeOfDay: 'late_night', userState: 'stressed' },
  { dayOfWeek: 'any', sourceId: 'kahf_18_10', timeOfDay: 'late_night', userState: 'low_iman_streak' },
  { dayOfWeek: 'friday', sourceId: 'bukhari_935', timeOfDay: 'noon', userState: 'stressed' },
  { dayOfWeek: 'friday', sourceId: 'ahzab_33_56', timeOfDay: 'evening', userState: 'steady' }
];

const TIME_ORDER = ['morning', 'noon', 'afternoon', 'evening', 'night', 'late_night'] as const;
const USER_STATE_ORDER = ['stressed', 'steady', 'low_iman_streak'] as const;

const resolveSuggestedAction = ({ source, timeOfDay, userState }: { source: SpiritualSource; timeOfDay: string; userState: string }): 'open_quran' | 'play_huzur_audio' | 'do_zikir' => {
  if (source.sourceType === 'daily_dua') {
    return timeOfDay === 'late_night' ? 'do_zikir' : 'open_quran';
  }

  if (source.sourceType === 'hadith' && userState === 'steady') {
    return 'play_huzur_audio';
  }

  if (timeOfDay === 'late_night' || timeOfDay === 'night') {
    return userState === 'steady' ? 'play_huzur_audio' : 'do_zikir';
  }

  return ACTION_FALLBACK_BY_STATE[userState] || 'do_zikir';
};

const formatTemplate = (template: string, values: { action: string }): string => (
  template.replaceAll('{action}', values.action)
);

const buildGreeting = ({ dayOfWeek, timeOfDay, userState, variantIndex }: { dayOfWeek: string; timeOfDay: string; userState: string; variantIndex: number }): string => {
  const timePool = TIME_GREETING_VARIANTS[dayOfWeek][timeOfDay];
  const timeText = timePool[variantIndex % timePool.length];

  const stateTail: Record<string, string[]> = {
    low_iman_streak: [
      'Bugun yeniden yon bulmak icin fazla buyuk bir adim gerekmiyor.',
      'Kalbinin yeniden isinmasi icin kucuk bir temas yeterli olabilir.',
      'Uzaklastigini hissetsen de donus kapisi hala acik.'
    ],
    steady: [
      'Bu dengeyi sessizce korumak da bir nimettir.',
      'Bugunku sakinligini sukru buyuten bir alan olarak koru.',
      'Ritmin yerindeyken bunu daha da koklendirmek mumkun.'
    ],
    stressed: [
      'Bugun her seyi bir anda cozmen gerekmiyor.',
      'Biraz yavaslamak kalbine iyi gelebilir.',
      'Ilk olarak icindeki gerginligi yumusatmak yeterli.'
    ]
  };

  const tailPool = stateTail[userState];
  return `${timeText} ${tailPool[variantIndex % tailPool.length]}`;
};

const buildReflection = ({ dayOfWeek, timeOfDay, userState, variantIndex, suggestedAction }: { dayOfWeek: string; timeOfDay: string; userState: string; variantIndex: number; suggestedAction: string }): string => {
  const firstSentencePool = TIME_REFLECTION_VARIANTS[dayOfWeek][timeOfDay];
  const secondSentencePool = STATE_SECOND_SENTENCE_VARIANTS[userState];

  return `${firstSentencePool[variantIndex % firstSentencePool.length]} ${formatTemplate(secondSentencePool[variantIndex % secondSentencePool.length], {
    action: ACTION_COPY[suggestedAction]
  })}`;
};

const buildEntry = ({
  dayOfWeek,
  idNumber,
  sourceId,
  timeOfDay,
  userState,
  variantIndex
}: {
  dayOfWeek: string;
  idNumber: number;
  sourceId: string;
  timeOfDay: string;
  userState: string;
  variantIndex: number;
}): SpiritualIntervention => {
  const source = SOURCE_LIBRARY[sourceId];
  const suggestedAction = resolveSuggestedAction({ source, timeOfDay, userState });

  return {
    confidence: source.confidence,
    content: {
      coreMessage: source.coreMessage,
      greeting: buildGreeting({ dayOfWeek, timeOfDay, userState, variantIndex }),
      reflection: buildReflection({ dayOfWeek, timeOfDay, userState, variantIndex, suggestedAction }),
      reference: source.reference
    },
    id: `reviewed_spiritual_${String(idNumber).padStart(3, '0')}`,
    reviewStatus: 'reviewed',
    sourceId: source.sourceId,
    sourceType: source.sourceType,
    sourceUrl: source.sourceUrl,
    suggestedAction,
    trigger_condition: {
      dayOfWeek,
      timeOfDay,
      userState
    }
  };
};

const interventions: SpiritualIntervention[] = [];
let idCounter = 1;

for (const timeOfDay of TIME_ORDER) {
  for (const userState of USER_STATE_ORDER) {
    const sources = ANY_ASSIGNMENTS[timeOfDay][userState];
    sources.forEach((sourceId, variantIndex) => {
      interventions.push(buildEntry({
        dayOfWeek: 'any',
        idNumber: idCounter++,
        sourceId,
        timeOfDay,
        userState,
        variantIndex
      }));
    });
  }
}

for (const timeOfDay of TIME_ORDER) {
  for (const userState of USER_STATE_ORDER) {
    const sources = FRIDAY_ASSIGNMENTS[timeOfDay][userState];
    sources.forEach((sourceId, variantIndex) => {
      interventions.push(buildEntry({
        dayOfWeek: 'friday',
        idNumber: idCounter++,
        sourceId,
        timeOfDay,
        userState,
        variantIndex
      }));
    });
  }
}

EXTRA_ENTRIES.forEach((entry, index) => {
  interventions.push(buildEntry({
    dayOfWeek: entry.dayOfWeek,
    idNumber: idCounter++,
    sourceId: entry.sourceId,
    timeOfDay: entry.timeOfDay,
    userState: entry.userState,
    variantIndex: index + 3
  }));
});

if (interventions.length !== 100) {
  throw new Error(`Expected 100 reviewed spiritual interventions, received ${interventions.length}.`);
}

export default interventions;
