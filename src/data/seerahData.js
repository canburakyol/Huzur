// İnteraktif Siyer Haritası Verileri - Comprehensive Historical Timeline
export const SEERAH_PERIODS = [
  { id: 'mecca_early', name: 'Mekke Dönemi (Erken)', color: '#f39c12' },
  { id: 'mecca_late', name: 'Mekke Dönemi (Geç)', color: '#e74c3c' },
  { id: 'hijra', name: 'Hicret', color: '#9b59b6' },
  { id: 'medina', name: 'Medine Dönemi', color: '#2ecc71' }
];

export const SEERAH_EVENTS = [
  // ====================
  // MEKKE DÖNEMİ (ERKEN)
  // ====================
  {
    id: 1,
    period: 'mecca_early',
    year: 570,
    title: 'Hz. Muhammed\'in Doğumu',
    location: 'Mekke',
    description: 'Peygamberimiz (s.a.v.) Fil Yılı\'nda, Rebiülevvel ayının 12\'sinde Mekke\'de, Hâşimoğulları ailesine mensup Abdullah ve Âmine\'nin oğlu olarak dünyaya geldi. Babası doğumundan önce vefat etmişti. Doğumunda birçok mucize gerçekleştiği rivayet edilir.',
    icon: '👶',
    importance: 'critical'
  },
  {
    id: 2,
    period: 'mecca_early',
    year: 575,
    title: 'Annesinin Vefatı',
    location: 'Ebva (Medine yakınları)',
    description: 'Hz. Muhammed 6 yaşındayken annesi Âmine vefat etti. Bu dönemi "yetim" olarak geçirdi. Daha sonra önce dedesi Abdülmuttalib, sonra amcası Ebu Talip tarafından himaye edildi.',
    icon: '😢',
    importance: 'high'
  },
  {
    id: 3,
    period: 'mecca_early',
    year: 578,
    title: 'Dedesinin Himayesinde',
    location: 'Mekke',
    description: 'Dedesi Abdülmuttalib, Mekke\'nin saygın liderleri arasında idi ve torunu Muhammed\'e çok özen gösterdi. 8 yaşına geldiğinde dedesi de vefat etti.',
    icon: '👴',
    importance: 'medium'
  },
  {
    id: 4,
    period: 'mecca_early',
   year: 580,
    title: 'Amcası Ebu Talip\'in Himayesinde',
    location: 'Mekke',
    description: 'Ebu Talip, yeğeni Muhammed\'i evlat edinir gibi yanına aldı. Ticaret yolculuklarına götürdü ve onun yetişmesinde önemli rol oynadı.',
    icon: '🤝',
    importance: 'medium'
  },
  {
    id: 5,
    period: 'mecca_early',
    year: 583,
    title: 'Rahip Bahira ile Karşılaşma',
    location: 'Busra (Şam)',
    description: 'Ebu Talip ile Şam\'a ticaret yolculuğunda giderken, Hıristiyan rahip Bahira, genç Muhammed\'in gelecekteki peygamberlik alametlerini fark etti ve Ebu Talip\'e onu korumalarını öğütledi.',
    icon: '⛪',
    importance: 'medium'
  },
  {
    id: 6,
    period: 'mecca_early',
    year: 590,
    title: 'Ficar Savaşları',
    location: 'Mekke ve çevresi',
    description: 'Arap kabileleri arasındaki bu savaşlarda Hz. Muhammed amcalarına ok toplamakla yardımcı oldu. Savaşın anlamsızlığına şahit oldu.',
    icon: '⚔️',
    importance: 'low'
  },
  {
    id: 7,
    period: 'mecca_early',
    year: 595,
    title: 'Hz. Hatice ile Evliliği',
    location: 'Mekke',
    description: 'Zengin tüccar Hz. Hatice, genç Muhammed\'in dürüstlüğünden etkilenerek kendisini ona teklif etti. 25 yaşındaki Hz. Muhammed, 40 yaşındaki Hz. Hatice ile evlendi. Bu evlilik 25 yıl sürdü ve Hz. Hatice hayatta olduğu sürece başka evlilik yapmadı.',
    icon: '💍',
    importance: 'critical'
  },
  {
    id: 8,
    period: 'mecca_early',
    year: 605,
    title: 'Kabe\'nin Yenilenmesi ve Hacerülesved',
    location: 'Kabe, Mekke',
    description: 'Kabe\'nin tamiri sırasında Hacerülesved\'in yerine konulması meselesi büyük ihtilafa yol açtı. Hz. Muhammed\'in bulduğu çözümle (taşı bir örtü üzerine koyup her kabilenin tutması) sorun barışçıl şekilde çözüldü. Bu olay O\'nun "el-Emin" (güvenilir) unvanını pekiştirdi.',
    icon: '🕋',
    importance: 'high'
  },
  {
    id: 9,
    period: 'mecca_early',
    year: 610,
    title: 'İlk Vahiy - Hira Mağarası',
    location: 'Hira Mağarası, Mekke',
    description: 'Ramazan ayının 21. gecesi (Kadir Gecesi), Cebrail (a.s.) ilk vahyi getirdi: "İkra!" (Oku!). Alak Suresi\'nin ilk 5 ayeti indi. Bu, peygamberliğin başlangıcıdır. Hz. Muhammed 40 yaşındaydı.',
    icon: '📖',
    importance: 'critical'
  },

  // ====================
  // MEKKE DÖNEMİ (GEÇ)
  // ====================
  {
    id: 10,
    period: 'mecca_late',
    year: 613,
    title: 'Açık Davet - Safa Tepesi',
    location: 'Safa Tepesi, Mekke',
    description: 'Üç yıllık gizli davet döneminden sonra, "Yakın akrabalarını uyar" ayeti ile Hz. Muhammed Safa Tepesi\'ne çıkarak bütün Kureyş kabilesini İslam\'a davet etti. Bu açık davetle Mekke müşriklerinin sert tepkisi başladı.',
    icon: '📢',
    importance: 'critical'
  },
  {
    id: 11,
    period: 'mecca_late',
    year: 614,
    title: 'İlk Müslümanların Zulüm Görmesi',
    location: 'Mekke',
    description: 'Hz. Bilal, Ammar, Sümeyye ve Yasir gibi köle ve zayıf Müslümanlar ağır işkencelere maruz kaldı. Hz. Sümeyye, İslam uğruna şehit olan ilk kadın oldu. Hz. Ebubekir birçok köle Müslüman\'ı satın alarak özgürleştirdi.',
    icon: '⛓️',
    importance: 'high'
  },
  {
    id: 12,
    period: 'mecca_late',
    year: 615,
    title: 'Habeşistan\'a İlk Hicret',
    location: 'Habeşistan',
    description: 'Zulmün artması üzerine Hz. Osman ve eşi Hz. Rukiye\'nin de aralarında bulunduğu 11 erkek ve 4 kadın, Habeşistan\'ın adil Hristiyan Kralı Necaşi\'nin ülkesine hicret etti. Bu, İslam tarihinin ilk hicreti ve dini özgürlük arayışıdır.',
    icon: '⛵',
    importance: 'high'
  },
  {
    id: 13,
    period: 'mecca_late',
    year: 616,
    title: 'Hz. Ömer ve Hz. Hamza\'nın Müslüman Olması',
    location: 'Mekke',
    description: 'Kureyş\'in en güçlü savaşçıları Hz. Hamza ve Hz. Ömer\'in İslam\'ı kabul etmesi, Müslümanların moralini artırdı ve Kureyş\'e büyük darbe oldu. Hz. Ömer\'in Müslüman olmasıyla açıkça namaz kılınmaya başlandı.',
    icon: '💪',
    importance: 'critical'
  },
  {
    id: 14,
    period: 'mecca_late',
    year: 617,
    title: 'Boykot ve Şib-i Ebu Talip',
    location: 'Mekke',
    description: 'Kureyş müşrikleri, Hâşimoğulları ve Müslümanlara 3 yıl sürecek tam bir boykot uyguladı. Şib-i Ebu Talip denilen vadide izole edildiler. Aç, susuz ve çok zor şartlarda yaşadılar. Boykot belgesi, kurtlar tarafından yenerek hükümsüz kaldı.',
    icon: '⛔',
    importance: 'high'
  },
  {
    id: 15,
    period: 'mecca_late',
    year: 619,
    title: 'Hüzün Yılı - İki Büyük Kayıp',
    location: 'Mekke',
    description: 'Aynı yıl içinde önce en büyük destekçisi amcası Ebu Talip, ardından en sevgili eşi Hz. Hatice vefat etti. Peygamberimiz için duygusal açıdan en zor dönem. Bu yıla "Hüzün Yılı" (Amü\'l Hüzn) denildi.',
    icon: '😢',
    importance: 'critical'
  },
  {
    id: 16,
    period: 'mecca_late',
    year: 620,
    title: 'Taif Yolculuğu',
    location: 'Taif',
    description: 'Mekke\'deki zulmün artması üzerine Hz. Muhammed Taif\'e gitti. Ancak Taif halkı O\'nu taşlayarak şehirden kovdu. Kan ter içinde kalan Peygamberimiz meşhur Taif duasını okudu. Bu, en acı tecrübelerden biri oldu.',
    icon: '🏃',
    importance: 'high'
  },
  {
    id: 17,
    period: 'mecca_late',
    year: 621,
    title: 'İsra ve Miraç Mucizesi',
    location: 'Mekke - Kudüs - Yedi Gök',
    description: 'Recep ayının 27. gecesi, Allah\'ın izniyle Cebrail (a.s.) eşliğinde gece vakti Mescid-i Haram\'dan Mescid-i Aksa\'ya (İsra), oradan da göklere (Miraç) yükseldi. Peygamberlerle namaz kıldı, cenneti ve cehennemi gördü. Beş vakit namaz bu gece farz kılındı.',
    icon: '🌙',
    importance: 'critical'
  },
  {
    id: 18,
    period: 'mecca_late',
    year: 621,
    title: 'Birinci Akabe Biatı',
    location: 'Akabe, Mina',
    description: 'Medine\'den gelen 12 kişi gizlice Hz. Muhammed ile buluşarak ona biat etti. İslam\'ı kabul ettiklerini ve koruyacaklarını söz verdiler. Bu, Medine\'ye hicretin ilk adımıydı.',
    icon: '🤝',
    importance: 'high'
  },
  {
    id: 19,
    period: 'mecca_late',
    year: 622,
    title: 'İkinci Akabe Biatı',
    location: 'Akabe, Mina',
    description: '73 erkek ve 2 kadın, Hz. Muhammed\'e biat ederek O\'nu Medine\'ye davet etti ve koruyacaklarına söz verdi. Hz. Mus\'ab ibn Umeyr ilk İslam öğretmeni olarak Medine\'ye gönderildi. Hicret için zemin hazırlandı.',
    icon: '✋',
    importance: 'critical'
  },

  // ====================
  // HİCRET DÖNEMİ
  // ====================
  {
    id: 20,
    period: 'hijra',
    year: 622,
    title: 'Hicret - Mekke\'den Medine\'ye',
    location: 'Mekke - Medine',
    description: 'Kureyş\'in suikast planından haberdar olan Hz. Muhammed, Hz. Ali\'yi yatağında bırakarak Hz. Ebubekir ile birlikte gece vakti Mekke\'den ayrıldı. Bu tarihi yolculuk, İslam takviminin (Hicri takvim) başlangıcıdır.',
    icon: '🐫',
    importance: 'critical'
  },
  {
    id: 21,
    period: 'hijra',
    year: 622,
    title: 'Sevr Mağarası',
    location: 'Mekke yakınları',
    description: 'Hicret yolculuğunda takipçilerden saklanmak için Sevr Mağarası\'nda 3 gün kaldılar. Kureyş takipçileri mağaranın tam önüne kadar geldi ancak girişte örümcek ağı ve güvercin yuvası görünce içeri bakmadılar. Hz. Ebubekir endişelenince "Hüzne kapılma, Allah bizimle" ayeti indi.',
    icon: '🕳️',
    importance: 'high'
  },
  {
    id: 22,
    period: 'hijra',
    year: 622,
    title: 'Kuba\'da Mola ve İlk Mescid',
    location: 'Kuba, Medine yakınları',
    description: 'Medine\'ye varmadan önce Kuba\'da 14 gün kaldı ve İslam\'ın ilk mescidi olan Mescid-i Kuba\'nın temellerini attı. Bu mescit hala ayakta ve ziyaretçi kabul ediyor.',
    icon: '🕌',
    importance: 'high'
  },

  // ====================
  // MEDİNE DÖNEMİ
  // ====================
  {
    id: 23,
    period: 'medina',
    year: 622,
    title: 'Medine\'ye Varış',
    location: 'Medine',
    description: 'Peygamberimiz Medine\'ye ulaştığında coşkulu karşılandı. Devesi Kasva\'nın çöktüğü yer Mescid-i Nebevi\'nin yeri olarak belirlendi. Medine\'de Müslümanlar için yeni bir dönem başladı.',
    icon: '🎉',
    importance: 'critical'
  },
  {
    id: 24,
    period: 'medina',
    year: 622,
    title: 'Mescid-i Nebevi\'nin İnşası',
    location: 'Medine',
    description: 'Hz. Muhammed bizzat taş ve çamur taşıyarak inşaata katıldı. Mescid aynı zamanda eğitim merkezi ve idari merkez olarak kullanıldı. Mescide bitişik evleri de yapıldı.',
    icon: '🏗️',
    importance: 'high'
  },
  {
    id: 25,
    period: 'medina',
    year: 622,
    title: 'Medine Sözleşmesi (Anayasa)',
    location: 'Medine',
    description: 'Müslümanlar, Yahudiler ve diğer gruplar arasında bir sosyal anlaşma yapıldı. Bu, tarihteki ilk yazılı anayasalardan biri olarak kabul edilir. Farklı dinlere mensup insanların bir arada yaşama hak ve sorumluluklarını belirledi.',
    icon: '📜',
    importance: 'critical'
  },
  {
    id: 26,
    period: 'medina',
    year: 623,
    title: 'Kıble\'nin Değişmesi',
    location: 'Medine',
    description: 'İlk başta Kudüs yönüne dönülerek namaz kılınırken, 16-17 ay sonra Kabe yönüne (Mekke) dönülmesi emredildi. Bu değişiklik Müslümanların kendi kimliklerini pekiştirdi.',
    icon: '🧭',
    importance: 'high'
  },
  {
    id: 27,
    period: 'medina',
    year: 624,
    title: 'Bedir Savaşı - İlk Büyük Zafer',
    location: 'Bedir',
    description: '313 Müslüman, 1000 kişilik Mekke ordusunu yendi. Allah\'ın melekleriyle yardımı ve stratejik deha sayesinde kazanılan zafer, Müslümanların moralini yükseltti. Ebu Cehil gibi İslam düşmanları öldü.',
    icon: '⚔️',
    importance: 'critical'
  },
  {
    id: 28,
    period: 'medina',
    year: 625,
    title: 'Uhud Savaşı',
    location: 'Uhud Dağı',
    description: 'Bedir\'den sonra intikam için gelen 3000 kişilik Kureyş ordusuna karşı savaşıldı. Başta üstünlük sağlansa da okçuların yerlerini terk etmesi nedeniyle kayıplar verildi. Hz. Hamza şehit oldu, Peygamberimiz yaralandı. Sabır ve sebat dersi.',
    icon: '🏔️',
    importance: 'critical'
  },
  {
    id: 29,
    period: 'medina',
    year: 627,
    title: 'Hendek Savaşı',
    location: 'Medine',
    description: '10.000 kişilik düşman koalisyonuna karşı Selman-ı Farisi\'nin önerisiyle Medine çevresine hendek kazıldı. Düşman bir ay kuşatma yaptı ama aşamadı. Soğuk ve fırtına ile dağıldılar. İslam\'ın stra tejik zekası ortaya çıktı.',
    icon: '🛡️',
    importance: 'critical'
  },
  {
    id: 30,
    period: 'medina',
    year: 628,
    title: 'Hudeybiye Antlaşması',
    location: 'Hudeybiye',
    description: 'Umre için Mekke\'ye giden Müslümanlar durduruldu. 10 yıllık barış antlaşması imzalandı. Görünüşte Müslümanlar aleyhine gibi görünse de, barış ortamı İslam\'ın yayılmasını hızlandırdı. "Apaçık bir fetih" olarak nitelendi.',
    icon: '🤝',
    importance: 'critical'
  },
  {
    id: 31,
    period: 'medina',
    year: 628,
    title: 'Hayber Fethi',
    location: 'Hayber',
    description: 'Müslümanlara sürekli düşmanlık eden Hayber Yahudileri\'nin kalesi fethedildi. Hz. Ali\'nin kahramanlığı öne çıktı. Bu fetih Müslümanların ekonomik durumunu güçlendirdi.',
    icon: '🏰',
    importance: 'high'
  },
  {
    id: 32,
    period: 'medina',
    year: 629,
    title: 'Mute Savaşı',
    location: 'Mute (Şam sınırları)',
    description: 'Bizans\'ın 100.000 kişilik ordusuna karşı 3000 Müslüman savaştı. Hz. Zeyd, Hz. Cafer ve Abdullah bin Revaha şehit düştü. Hz. Halid bin Velid "Kılıç" stratejisiyle ordunun çekilmesini sağladı ve "Seyfullah" unvanını aldı.',
    icon: '🗡️',
    importance: 'high'
  },
  {
    id: 33,
    period: 'medina',
    year: 630,
    title: 'Mekke\'nin Fethi - Zafer',
    location: 'Mekke',
    description: '10.000 kişilik orduyla Mekke barışçıl şekilde fethedildi. Genel af ilan edildi, putlar kırıldı. Kabe temizlendi. "Bugün size kınama yok" sözüyle af ve hoşgörü örneği gösterildi. İslam\'ın en büyük zaferlerinden.',
    icon: '🏆',
    importance: 'critical'
  },
  {
    id: 34,
    period: 'medina',
    year: 630,
    title: 'Huneyn Savaşı',
    location: 'Huneyn Vadisi',
    description: 'Mekke\'nin fethinden hemen sonra Hevazin ve Sakif kabilelerine karşı yapıldı. Başta pusuya düşülse de toparlanarak zafer kazanıldı. Ganimetler adaletli dağıtıldı.',
    icon: '⚔️',
    importance: 'medium'
  },
  {
    id: 35,
    period: 'medina',
    year: 630,
    title: 'Tebük Seferi',
    location: 'Tebük (Şam sınırı)',
    description: 'Bizans tehdidine karşı yapılan en uzak sefer. 30.000 kişilik ordu en sıcak yaz aylarında bu zor yolculuğa katıldı. Bizans savaşmadan çekildi. Müslümanların gücü kanıtlandı.',
    icon: '🏜️',
    importance: 'high'
  },
  {
    id: 36,
    period: 'medina',
    year: 631,
    title: 'Heyet Yılı',
    location: 'Medine',
    description: 'Arap yarımadasının dört bir yanından kabileler İslam\'ı kabul etmek için heyetler gönderdi. Yemen, Bahreyn, Uman gibi bölgeler İslam\'a girdi. Barışçıl yolla hızlı yayılma dönemi.',
    icon: '🤝',
    importance: 'high'
  },
  {
    id: 37,
    period: 'medina',
    year: 632,
    title: 'Veda Haccı ve Hutbesi',
    location: 'Arafat, Mekke',
    description: 'Hz. Muhammed son haccını yaptı. 100.000\'den fazla Müslüman katıldı. Arafat\'ta okunan Veda Hutbesi, insan hakları beyannamesi niteliğinde, evrensel prensipleri içeren tarihi bir konuşmadır. "Bugün dininizi ikmal ettim" ayeti indi.',
    icon: '👐',
    importance: 'critical'
  },
  {
    id: 38,
    period: 'medina',
    year: 632,
    title: 'Vefat',
    location: 'Medine',
    description: 'Peygamberimiz 63 yaşında, Rebiulevvel ayının 12\'sinde Pazartesi günü Hz. Aişe\'nin evinde vefat etti. Hz. Ebubekir "Kim Muhammed\'e tapıyorsa bilsin ki O öldü, kim Allah\'a tapıyorsa O daima diridirin dedi. Mescid-i Nebevi\'ye defnedildi.',
    icon: '🕌',
    importance: 'critical'
  }
];
