type SpiritualSource = {
  coreMessage: string;
  confidence: 'high' | 'medium';
  reference: string;
  sourceId: string;
  sourceType: 'daily_dua' | 'daily_content' | 'hadith';
  sourceUrl: string;
}

type TriggerCondition = {
  dayOfWeek: 'any' | 'friday';
  timeOfDay: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'late_night';
  userState: 'low_iman_streak' | 'steady' | 'stressed';
}

type SpiritualIntervention = {
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
    coreMessage: 'Rabbimiz, bizi hidayete erdirdikten sonra kalplerimizi eğip bükme; bize katından rahmet ver.',
    confidence: 'high',
    reference: "Ali 'Imran 3:8",
    sourceId: 'ali_imran_3_8',
    sourceType: 'daily_dua',
    sourceUrl: 'https://quran.com/3/8'
  },
  ali_imran_3_139: {
    coreMessage: 'Gevşemeyin, üzülmeyin; imanla ayakta kalırsanız üstün olan siz olursunuz.',
    confidence: 'high',
    reference: "Ali 'Imran 3:139",
    sourceId: 'ali_imran_3_139',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/3/139'
  },
  ahzab_33_56: {
    coreMessage: 'Allah ve melekleri Peygamber\'e salat eder; müminler de salat ve selam getirin.',
    confidence: 'high',
    reference: 'Al-Ahzab 33:56',
    sourceId: 'ahzab_33_56',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/33/56'
  },
  anfal_8_2: {
    coreMessage: 'Müminlerin kalpleri Allah anıldığında ürperir ve ayetler onlara iman artışı verir.',
    confidence: 'high',
    reference: 'Al-Anfal 8:2',
    sourceId: 'anfal_8_2',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/8/2'
  },
  ankabut_29_45: {
    coreMessage: 'Namaz çirkinlikten ve taşkınlıktan alıkoyar; Allah\'ı anmak ise hepsinden büyüktür.',
    confidence: 'high',
    reference: "Al-'Ankabut 29:45",
    sourceId: 'ankabut_29_45',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/29/45'
  },
  baqarah_2_152: {
    coreMessage: 'Siz Beni anın ki Ben de sizi anayım; şükredin ve nankörlük etmeyin.',
    confidence: 'high',
    reference: 'Al-Baqarah 2:152',
    sourceId: 'baqarah_2_152',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/2/152'
  },
  baqarah_2_286: {
    coreMessage: 'Allah hiçbir nefse gücünün yeteceğinden fazlasını yüklemez.',
    confidence: 'high',
    reference: 'Al-Baqarah 2:286',
    sourceId: 'baqarah_2_286',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/2/286'
  },
  bukhari_1145: {
    coreMessage: 'Resulullah, gecenin son üçte birinin dua ve istiğfar için rahmet kapılarının açıldığı bir vakit olduğunu haber verdi.',
    confidence: 'medium',
    reference: 'Sahih al-Bukhari 1145',
    sourceId: 'bukhari_1145',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/bukhari:1145'
  },
  bukhari_5641: {
    coreMessage: 'Müslümanı yoran her yorgunluk, üzüntü ve sıkıntı Allah\'ın izniyle günahlara kefaret olur.',
    confidence: 'medium',
    reference: 'Sahih al-Bukhari 5641',
    sourceId: 'bukhari_5641',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/bukhari:5641'
  },
  bukhari_6464: {
    coreMessage: 'Allah\'a en sevimli amel, az da olsa devamlı olandır.',
    confidence: 'medium',
    reference: 'Sahih al-Bukhari 6464',
    sourceId: 'bukhari_6464',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/bukhari:6464'
  },
  bukhari_935: {
    coreMessage: 'Cuma gününde, kulun dua ettiğinde karşılık bulacağı özel bir zaman vardır.',
    confidence: 'medium',
    reference: 'Sahih al-Bukhari 935',
    sourceId: 'bukhari_935',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/bukhari:935'
  },
  duha_93_5: {
    coreMessage: 'Rabbin sana lütfedecek ve sonunda gönlün hoşnut olacak.',
    confidence: 'high',
    reference: 'Ad-Duha 93:5',
    sourceId: 'duha_93_5',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/93/5'
  },
  dhariyat_51_55: {
    coreMessage: 'Hatırlat; çünkü hatırlatma müminlere fayda verir.',
    confidence: 'high',
    reference: 'Adh-Dhariyat 51:55',
    sourceId: 'dhariyat_51_55',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/51/55'
  },
  furqan_25_74: {
    coreMessage: 'Rabbimiz, eşlerimizi ve nesillerimizi göz aydınlığı kıl; bizi takva sahiplerine örnek yap.',
    confidence: 'high',
    reference: 'Al-Furqan 25:74',
    sourceId: 'furqan_25_74',
    sourceType: 'daily_dua',
    sourceUrl: 'https://quran.com/25/74'
  },
  ghafir_40_60: {
    coreMessage: 'Rabbiniz, Bana dua edin ki size karşılık vereyim, buyurur.',
    confidence: 'high',
    reference: 'Ghafir 40:60',
    sourceId: 'ghafir_40_60',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/40/60'
  },
  isra_17_79: {
    coreMessage: 'Gecenin bir kısmında ilave namazla Rabbine yönel.',
    confidence: 'high',
    reference: 'Al-Isra 17:79',
    sourceId: 'isra_17_79',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/17/79'
  },
  jumuah_62_9: {
    coreMessage: 'Cuma ezanı okunduğunda Allah\'ı anmaya koşun ve alışverişi bırakın.',
    confidence: 'high',
    reference: "Al-Jumu'ah 62:9",
    sourceId: 'jumuah_62_9',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/62/9'
  },
  kahf_18_10: {
    coreMessage: 'Rabbimiz, bize katından rahmet ver ve işimizde doğru yolu kolaylaştır.',
    confidence: 'high',
    reference: 'Al-Kahf 18:10',
    sourceId: 'kahf_18_10',
    sourceType: 'daily_dua',
    sourceUrl: 'https://quran.com/18/10'
  },
  muslim_2664: {
    coreMessage: 'Güçlü mümin Allah katında daha sevimlidir; faydalı olana sarıl, Allah\'tan yardım iste ve gevşeme.',
    confidence: 'medium',
    reference: 'Sahih Muslim 2664',
    sourceId: 'muslim_2664',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/muslim:2664'
  },
  muslim_2999: {
    coreMessage: 'Müminin işi hayırdır; nimet gelirse şükreder, sıkıntı gelirse sabreder.',
    confidence: 'medium',
    reference: 'Sahih Muslim 2999',
    sourceId: 'muslim_2999',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/muslim:2999'
  },
  muslim_854b: {
    coreMessage: 'Resulullah, güneşin doğduğu en hayırlı günün cuma olduğunu bildirdi.',
    confidence: 'medium',
    reference: 'Sahih Muslim 854b',
    sourceId: 'muslim_854b',
    sourceType: 'hadith',
    sourceUrl: 'https://sunnah.com/muslim:854b'
  },
  muzzammil_73_6: {
    coreMessage: 'Gece ibadeti, kalbi daha derinden etkileyen ve sözü daha berrak kılan bir vakittir.',
    confidence: 'high',
    reference: 'Al-Muzzammil 73:6',
    sourceId: 'muzzammil_73_6',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/73/6'
  },
  nahl_16_97: {
    coreMessage: 'İmanla salih amel işleyene Allah temiz ve güzel bir hayat vaat eder.',
    confidence: 'high',
    reference: 'An-Nahl 16:97',
    sourceId: 'nahl_16_97',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/16/97'
  },
  qaf_50_16: {
    coreMessage: 'Allah insana şah damarından daha yakındır.',
    confidence: 'high',
    reference: 'Qaf 50:16',
    sourceId: 'qaf_50_16',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/50/16'
  },
  rad_13_28: {
    coreMessage: 'Kalpler ancak Allah\'ı anmakla huzur bulur.',
    confidence: 'high',
    reference: "Ar-Ra'd 13:28",
    sourceId: 'rad_13_28',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/13/28'
  },
  sharh_94_5_6: {
    coreMessage: 'Şüphesiz zorluğun yanında kolaylık vardır; evet, zorluğun yanında kolaylık vardır.',
    confidence: 'high',
    reference: 'Ash-Sharh 94:5-6',
    sourceId: 'sharh_94_5_6',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/94/5-6'
  },
  taha_20_25_28: {
    coreMessage: 'Rabbim, göğsümü genişlet, işimi kolaylaştır ve dilimdeki düğümü çözümle.',
    confidence: 'high',
    reference: 'Ta-Ha 20:25-28',
    sourceId: 'taha_20_25_28',
    sourceType: 'daily_dua',
    sourceUrl: 'https://quran.com/20/25-28'
  },
  taha_20_46: {
    coreMessage: 'Korkmayın; Ben sizinle birlikteyim, işitir ve görürüm.',
    confidence: 'high',
    reference: 'Ta-Ha 20:46',
    sourceId: 'taha_20_46',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/20/46'
  },
  tawbah_9_51: {
    coreMessage: 'Bize ancak Allah\'ın bizim için yazdığı şey isabet eder; O bizim Mevlâmızdır.',
    confidence: 'high',
    reference: 'At-Tawbah 9:51',
    sourceId: 'tawbah_9_51',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/9/51'
  },
  yunus_10_57: {
    coreMessage: 'Kur\'an, kalplerde olana şifa, hidayet ve rahmet olarak gelmiştir.',
    confidence: 'high',
    reference: 'Yunus 10:57',
    sourceId: 'yunus_10_57',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/10/57'
  },
  yusuf_12_86: {
    coreMessage: 'Yakup aleyhisselam, üzüntüsünü ve tasasını yalnız Allah\'a arz ettiğini söyledi.',
    confidence: 'high',
    reference: 'Yusuf 12:86',
    sourceId: 'yusuf_12_86',
    sourceType: 'daily_content',
    sourceUrl: 'https://quran.com/12/86'
  },
  zumar_39_53: {
    coreMessage: 'Kendi nefisleri aleyhine giden kullar bile Allah\'ın rahmetinden ümit kesmesin.',
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
  do_zikir: 'kısa bir zikir',
  open_quran: "Kur'an ile birkaç dakikalık temas",
  play_huzur_audio: 'sakin bir Huzur sesi'
};

const TIME_GREETING_VARIANTS: Record<string, Record<string, string[]>> = {
  any: {
    afternoon: [
      'İkindiye doğru kalbini bir nebze hafifletmeye ne dersin?',
      'Günün ikinci yarısı başlarken iç ritmini toparlayalım.',
      'Öğleden sonraki akış hızlandıysa önce kalbine yer aç.'
    ],
    evening: [
      'Akşam inerken günün yükünü biraz bırak.',
      'Günün sonuna gelirken kalbini yumuşatacak bir durak var.',
      'Akşam vakti, içindeki sesi daha net duymak için güzel bir eşik.'
    ],
    late_night: [
      'Gecenin derinliğinde kurulan temas daha sahici olabilir.',
      'Bu sessiz vakitte kalbinle Rabbine daha yakın olabilirsin.',
      'Teheccüd saatleri kalbi toplamaya çok müsaittir.'
    ],
    morning: [
      'Sabah yeni açılırken kalbine yumuşak bir başlangıç ver.',
      'Gün daha yeni başlarken aceleyi biraz yavaşlatalım.',
      'Bugünün ilk saatlerinde kalbine nefes alacak alan aç.'
    ],
    night: [
      'Gece sakinliğinde kalbini toplamak daha kolay olabilir.',
      'Gün kapanırken içindeki ağırlığı Rabbine bırak.',
      'Gece, dış gürültünün azaldığı ve kalbin duyulduğu bir vakit.'
    ],
    noon: [
      'Öğle saatleri yoğunlaştıysa önce nefesini düzelt.',
      'Gün ortasında kısa bir manevi mola ritmi toparlayabilir.',
      'Öğle akışı hızlıysa kalbine bir durak açmak iyi gelir.'
    ]
  },
  friday: {
    afternoon: [
      'Cuma ikindisi, kalbi toparlayan nadir vakitlerden biridir.',
      'Cuma ikindisinin sükuneti bugünü daha derli toplu bitirebilir.'
    ],
    evening: [
      'Cuma akşamı, haftayı yumuşak bir biçimde kapatmak için güzel bir eşik.',
      'Mübarek günün sonuna gelirken kalbine biraz daha huzur ver.'
    ],
    late_night: [
      'Cuma gecesinin sessizliği, duayı daha derin hissettirebilir.',
      'Bu mübarek gecede kalbinle Rabbine dönmek daha kolay olabilir.'
    ],
    morning: [
      'Cuma sabahı aceleyi azaltıp niyetini tazele.',
      'Mübarek cuma sabahı kalbine sakin bir başlangıç ver.'
    ],
    night: [
      'Cuma gecesi kalbi yumuşatmak için güzel bir vakittir.',
      'Mübarek gecede küçük bir hatırlatma bile iç ritmi toparlayabilir.'
    ],
    noon: [
      'Cuma öğlesi, zikrin ve duanın ağırlık kazandığı bir eşik.',
      'Cuma namazına yaklaşan saatlerde kalbini toplayacak kısa bir durak var.'
    ]
  }
};

const TIME_REFLECTION_VARIANTS: Record<string, Record<string, string[]>> = {
  any: {
    afternoon: [
      'İkindiye yaklaşan saatler, günün yorgunluğunu fark edip yön düzeltmek için iyi bir eşiktir.',
      'Öğleden sonraki akış, zihnin dağıldığı ama niyetin yeniden toparlanabildiği bir zamandır.',
      'Günün ikinci yarısı, baskıyı büyütmeden ritmi düzeltmek için küçük adımlara çok açıktır.'
    ],
    evening: [
      'Akşam vakti, gün boyu biriken duyguların yavaş yavaş görünür olduğu bir eşiktir.',
      'Gün kapanırken kurulan küçük manevi temas, iç huzuru geceye taşıyabilir.',
      'Akşam saatleri, günün ağırlığını Rabbine emanet etmek için doğal bir davettir.'
    ],
    late_night: [
      'Gecenin bu vakti, gösterişten uzak bir samimiyetle Rabbine yönelmek için çok elverişlidir.',
      'Teheccüd saatleri, kalbin daha duru duyulduğu ve duanın daha derinden kurulduğu anlardandır.',
      'Derin gece, dünyanın sesi kısılırken kalbin hakikate daha açık hale geldiği bir zaman olur.'
    ],
    morning: [
      'Sabah, niyetin günün ritmini belirlediği en hassas eşiklerden biridir.',
      'Gün başlarken kalbe verilen yön, kalan saatlerin tonunu büyük ölçüde belirler.',
      'Sabah saatleri, iç ritmi zorlamadan yeniden düzene alma fırsatı verir.'
    ],
    night: [
      'Gece, dış koşuşturmanın azaldığı ve kalbin kendi sesini daha net duyduğu bir vakittir.',
      'Gün sona ererken kurulan manevi temas, zihni yumuşatıp kalbi güvende hissettirebilir.',
      'Gece vakti, hesaplaşmak yerine teslimiyetle sakinleşmeyi öğrenmek için güzel bir alandır.'
    ],
    noon: [
      'Gün ortası, yoğunlukla niyet arasındaki mesafenin kolayca açıldığı bir zamandır.',
      'Öğle saatleri, hem bedeni hem zihni yeniden merkezlemek için doğal bir durak sunar.',
      'Günün tam ortasında verilen kısa bir manevi mola, dağılan dikkati toparlamaya yardım eder.'
    ]
  },
  friday: {
    afternoon: [
      'Cuma ikindisi, dua ve tefekküre diğer günlere göre daha toplayıcı bir iklim taşır.',
      'Bu saatler, cuma bereketini haftanın geri kalanına taşımak için güzel bir kapıdır.'
    ],
    evening: [
      'Cuma akşamı, haftanın yorgunluğunu merhamet ve şükrü merkeze alarak kapatma fırsatı verir.',
      'Mübarek günün son saatleri, kalbi yumuşatan küçük amelleri daha anlamlı kılabilir.'
    ],
    late_night: [
      'Cuma gecesinin sessizliği, duaya ve iç hesaplaşmaya başka gecelerden daha yumuşak bir zemin sunar.',
      'Bu mübarek vakit, kalbi yormadan toparlayan samimi bir yöneliş için çok kıymetlidir.'
    ],
    morning: [
      'Cuma sabahı, haftalık koşuşturmaya rağmen kalbi toparlayan özel bir ferahlık taşır.',
      'Mübarek günün başı, niyeti tazelemek ve haftaya anlam vermek için eşsiz bir eşiktir.'
    ],
    night: [
      'Cuma gecesi, haftanın geri kalanından daha derli toplu bir teslimiyet duygusu uyandırabilir.',
      'Mübarek gecede kurulan kısa manevi temas, kalbi tahmin edilenden daha hızlı toparlayabilir.'
    ],
    noon: [
      'Cuma öğlesi, zikrin ve duanın günlük akışa daha kolay yerleştiği bir vakittir.',
      'Bu eşik, cuma namazının bereketiyle niyeti yeniden merkeze almak için çok elverişlidir.'
    ]
  }
};

const STATE_SECOND_SENTENCE_VARIANTS: Record<string, string[]> = {
  low_iman_streak: [
    'Kendini uzak hissettiğin anlarda bile kısa ama düzenli bir dönüş, kalbin tekrar ısınmasına yardım eder; bugün bunun için {action} yeterli olabilir.',
    'İman ritmi düştüğünde büyük adımlar yerine samimi bir dönüş daha kalıcı olur; istersen bunu {action} ile başlatabilirsin.',
    'Bugün kalbin tamamen toparlanmasa bile yönünü yeniden çevirmek çok değerli; {action} bu dönüşü yumuşaklaştırabilir.'
  ],
  steady: [
    'Dengedeyken kurulan bu küçük temas, sebat duygusunu korur ve şükrü derinleştirir; istersen bunu {action} ile pekiştirebilirsin.',
    'Kalbin sakin olduğunda küçük ameller daha kolay kök salar; {action} bu istikrarı günün içine yaymana yardım edebilir.',
    'Ritmin yerindeyken bu tarz hatırlatmalar, dağılmadan devam etmeni sağlar; {action} ile bunu nazikçe sürdürebilirsin.'
  ],
  stressed: [
    'Bu hatırlatmayı, kontrol etme baskısını bir anlığına Rabbine bırakman için yumuşak bir durak gibi düşün; ardından {action} ile devam edebilirsin.',
    'Zihnin hızlandığında kalbin daha kısa ve daha sade bir temasa ihtiyaç duyar; bugün bunu {action} ile desteklemek iyi gelebilir.',
    'Baskının büyüdüğü anlarda derin ve uzun bir plan gerekmeyebilir; sadece {action} ile iç ritmini biraz toparlaman yeterli olabilir.'
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

type ExtraEntry = {
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
      'Bugün yeniden yön bulmak için fazla büyük bir adım gerekmiyor.',
      'Kalbinin yeniden ısınması için küçük bir temas yeterli olabilir.',
      'Uzaklaştığını hissetsen de dönüş kapısı hâlâ açık.'
    ],
    steady: [
      'Bu dengeyi sessizce korumak da bir nimettir.',
      'Bugünkü sakinliğini şükrü büyüten bir alan olarak koru.',
      'Ritmin yerindeyken bunu daha da köklendirmek mümkün.'
    ],
    stressed: [
      'Bugün her şeyi bir anda çözmen gerekmiyor.',
      'Biraz yavaşlamak kalbine iyi gelebilir.',
      'İlk olarak içindeki gerginliği yumuşatmak yeterli.'
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
