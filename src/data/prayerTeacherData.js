// Prayer Teacher Data - Namaz Hocası İçerikleri

// 1. Namaz Adımları (Step by Step)
export const PRAYER_STEPS = [
    {
        id: 1,
        name: 'Niyet',
        icon: '🤲',
        description: 'Hangi namazı kılacağınıza kalben niyet edin.',
        detail: 'Niyet kalp ile yapılır. Dil ile söylemek sünnettir. Örnek: "Niyet ettim Allah rızası için bugünkü öğle namazının farzını kılmaya."'
    },
    {
        id: 2,
        name: 'İftitah Tekbiri',
        icon: '🙌',
        description: 'Elleri kulaklara kaldırarak "Allahu Ekber" deyin.',
        detail: 'Erkekler ellerini kulak hizasına, kadınlar omuz hizasına kaldırır. Baş parmaklar kulak memesine değebilir.'
    },
    {
        id: 3,
        name: 'Kıyam',
        icon: '🧍',
        description: 'Ayakta duruş. Sağ el sol elin üzerine konur.',
        detail: 'Sübhaneke, Euzü-Besmele, Fatiha ve zamm-ı sure okunur. Gözler secde yerine bakar.'
    },
    {
        id: 4,
        name: 'Rükû',
        icon: '🙇',
        description: 'Eğilerek "Allahu Ekber" deyip rükûya varın.',
        detail: 'Eller dizleri kavrar, sırt düz olur. 3 kere "Sübhane Rabbiyel Azim" denir. Doğrulurken "Semiallahu limen hamideh" denir.'
    },
    {
        id: 5,
        name: 'Kavme',
        icon: '🧍',
        description: 'Rükûdan doğrulup "Rabbena lekel hamd" deyin.',
        detail: 'Tam dik durun, eller yanlara serbest bırakılır. Bir an bekleyip secdeye inin.'
    },
    {
        id: 6,
        name: 'Secde',
        icon: '🙏',
        description: '"Allahu Ekber" diyerek secdeye varın.',
        detail: 'Önce dizler, sonra eller, sonra alın ve burun yere konur. 3 kere "Sübhane Rabbiyel Ala" denir.'
    },
    {
        id: 7,
        name: 'Celse',
        icon: '🧎',
        description: 'İki secde arasında dik oturun.',
        detail: '"Rabbigfirli" denir. Eller dizlerin üzerinde durur.'
    },
    {
        id: 8,
        name: 'Ka\'de (Oturuş)',
        icon: '🧎',
        description: 'Son rekatta oturarak Ettehiyyatü okuyun.',
        detail: 'Ettehiyyatü, Salli-Barik ve Rabbena duaları okunur. Şahadet parmağı kaldırılır.'
    },
    {
        id: 9,
        name: 'Selam',
        icon: '👋',
        description: 'Sağa ve sola selam vererek namazı bitirin.',
        detail: '"Esselamü aleyküm ve rahmetullah" diyerek önce sağa, sonra sola selam verilir.'
    }
];

// 2. Okunuşlar (Recitations)
export const RECITATIONS = [
    {
        id: 'subhaneke',
        name: 'Sübhaneke',
        arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ',
        latin: 'Sübhânekellâhümme ve bi hamdik ve tebârekesmük ve teâlâ ceddük ve lâ ilâhe ğayrük.',
        meaning: 'Allah\'ım! Sen eksik sıfatlardan pak ve uzaksın. Sana hamd ederim. Senin adın mübarektir. Azametin yücedir. Senden başka ilah yoktur.'
    },
    {
        id: 'fatiha',
        name: 'Fatiha Suresi',
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        latin: 'Bismillâhirrahmânirrahîm. Elhamdü lillâhi rabbil âlemîn. Errahmânirrahîm. Mâliki yevmiddîn. İyyâke na\'büdü ve iyyâke nestaîn. İhdinessırâtel müstakîm. Sırâtellezîne en\'amte aleyhim ğayril mağdûbi aleyhim ve leddâllîn.',
        meaning: 'Rahman ve Rahim olan Allah\'ın adıyla. Hamd, âlemlerin Rabbi Allah\'a mahsustur. O, Rahman\'dır, Rahim\'dir. Din gününün sahibidir. Yalnız sana ibadet eder, yalnız senden yardım dileriz. Bizi doğru yola ilet. Nimet verdiklerinin yoluna; gazaba uğrayanların ve sapıkların yoluna değil.'
    },
    {
        id: 'ihlas',
        name: 'İhlas Suresi',
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        latin: 'Kul hüvallâhü ehad. Allâhüssamed. Lem yelid ve lem yûled. Ve lem yekün lehû küfüven ehad.',
        meaning: 'De ki: O Allah birdir. Allah sameddir (her şey O\'na muhtaç, O hiçbir şeye muhtaç değil). O doğurmamış ve doğurulmamıştır. Hiçbir şey O\'na denk değildir.'
    },
    {
        id: 'ruku',
        name: 'Rükû Tesbihi',
        arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
        latin: 'Sübhâne Rabbiyel Azîm',
        meaning: 'Yüce Rabbimi tüm noksanlıklardan tenzih ederim.'
    },
    {
        id: 'secde',
        name: 'Secde Tesbihi',
        arabic: 'سُبْحَانَ رَبِّيَ الأَعْلَى',
        latin: 'Sübhâne Rabbiyel A\'lâ',
        meaning: 'En yüce Rabbimi tüm noksanlıklardan tenzih ederim.'
    },
    {
        id: 'ettehiyyatu',
        name: 'Ettehiyyatü',
        arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
        latin: 'Ettehiyyâtü lillâhi vessalevâtü vettayyibât. Esselâmü aleyke eyyühennebiyyü ve rahmetullâhi ve berekâtüh. Esselâmü aleynâ ve alâ ibâdillâhissâlihîn. Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve resûlüh.',
        meaning: 'Dil ile, beden ile ve mal ile yapılan bütün ibadetler Allah\'a mahsustur. Ey Peygamber! Selam, Allah\'ın rahmeti ve bereketleri senin üzerine olsun. Selam bizim ve Allah\'ın salih kullarının üzerine olsun. Şehadet ederim ki Allah\'tan başka ilah yoktur ve yine şehadet ederim ki Muhammed O\'nun kulu ve elçisidir.'
    },
    {
        id: 'salli',
        name: 'Allahümme Salli',
        arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
        latin: 'Allâhümme salli alâ Muhammedin ve alâ âli Muhammed. Kemâ salleyte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.',
        meaning: 'Allah\'ım! Muhammed\'e ve Muhammed\'in ailesine rahmet et. İbrahim\'e ve İbrahim\'in ailesine rahmet ettiğin gibi. Şüphesiz sen övülmeye layık ve yücesin.'
    },
    {
        id: 'barik',
        name: 'Allahümme Barik',
        arabic: 'اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
        latin: 'Allâhümme bârik alâ Muhammedin ve alâ âli Muhammed. Kemâ bârekte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.',
        meaning: 'Allah\'ım! Muhammed\'e ve Muhammed\'in ailesine bereket ver. İbrahim\'e ve İbrahim\'in ailesine bereket verdiğin gibi. Şüphesiz sen övülmeye layık ve yücesin.'
    },
    {
        id: 'rabbena',
        name: 'Rabbenâ Duaları',
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        latin: 'Rabbenâ âtinâ fiddünyâ haseneten ve fil âhireti haseneten ve kınâ azâbennâr.',
        meaning: 'Rabbimiz! Bize dünyada iyilik ver, ahirette de iyilik ver ve bizi cehennem azabından koru.'
    }
];

// 3. Namaz Çeşitleri (Prayer Types)
export const PRAYER_TYPES = [
    {
        id: 'sabah',
        name: 'Sabah Namazı',
        icon: '🌅',
        totalRakat: 4,
        details: [
            { type: 'Sünnet', rakat: 2, description: 'İki rekat sünnet (kuvvetli sünnet)' },
            { type: 'Farz', rakat: 2, description: 'İki rekat farz' }
        ],
        note: 'Sabah namazının sünneti çok önemlidir, Hz. Peygamber hiç terk etmezdi.'
    },
    {
        id: 'ogle',
        name: 'Öğle Namazı',
        icon: '☀️',
        totalRakat: 10,
        details: [
            { type: 'İlk Sünnet', rakat: 4, description: 'Dört rekat sünnet' },
            { type: 'Farz', rakat: 4, description: 'Dört rekat farz' },
            { type: 'Son Sünnet', rakat: 2, description: 'İki rekat sünnet' }
        ],
        note: 'İlk sünnette her iki rekatta ayrı ayrı oturulur.'
    },
    {
        id: 'ikindi',
        name: 'İkindi Namazı',
        icon: '🌤️',
        totalRakat: 8,
        details: [
            { type: 'Sünnet', rakat: 4, description: 'Dört rekat sünnet (gayr-i müekked)' },
            { type: 'Farz', rakat: 4, description: 'Dört rekat farz' }
        ],
        note: 'İkindi namazının sünneti farzdan önce kılınır ve kuvvetli sünnet değildir.'
    },
    {
        id: 'aksam',
        name: 'Akşam Namazı',
        icon: '🌆',
        totalRakat: 5,
        details: [
            { type: 'Farz', rakat: 3, description: 'Üç rekat farz' },
            { type: 'Sünnet', rakat: 2, description: 'İki rekat sünnet' }
        ],
        note: 'Akşam namazının farzı üç rekattır ve tek sayıda rekatı olan tek farz namazdır.'
    },
    {
        id: 'yatsi',
        name: 'Yatsı Namazı',
        icon: '🌙',
        totalRakat: 13,
        details: [
            { type: 'İlk Sünnet', rakat: 4, description: 'Dört rekat sünnet (gayr-i müekked)' },
            { type: 'Farz', rakat: 4, description: 'Dört rekat farz' },
            { type: 'Son Sünnet', rakat: 2, description: 'İki rekat sünnet' },
            { type: 'Vitir', rakat: 3, description: 'Üç rekat vitir (vacip)' }
        ],
        note: 'Vitir namazı vaciptir ve yatsı namazından sonra kılınır.'
    }
];

// 4. Sünnet-Farz-Vacip
export const RELIGIOUS_TERMS = [
    {
        id: 'farz',
        name: 'Farz',
        icon: '⭐',
        description: 'Allah\'ın kesin olarak emrettiği ibadetlerdir. Terk edilmesi büyük günahtır.',
        examples: ['Beş vakit namazın farzları', 'Ramazan orucu', 'Zekat', 'Hac (imkânı olan için)', 'Abdest', 'Namaz için kıbleye dönmek']
    },
    {
        id: 'vacip',
        name: 'Vacip',
        icon: '🌟',
        description: 'Farz kadar kuvvetli delil ile sabit olmasa da, yapılması gereken ibadetlerdir.',
        examples: ['Vitir namazı', 'Bayram namazları', 'Fıtır sadakası', 'Kurban kesmek', 'Namazda Fatiha okumak', 'Secde-i sehiv']
    },
    {
        id: 'sunnet',
        name: 'Sünnet',
        icon: '✨',
        description: 'Hz. Peygamber\'in (s.a.v.) yaptığı ve yapmamızı istediği ibadetlerdir.',
        examples: ['Vakit namazlarının sünnetleri', 'Misvak kullanmak', 'Ezan ve kaamete icabet', 'Selama karşılık vermek']
    },
    {
        id: 'mustehap',
        name: 'Müstehap (Mendub)',
        icon: '💫',
        description: 'Yapılması sevap kazandıran, terk edilmesi günah olmayan amellerdir.',
        examples: ['Nafile namazlar', 'Sela okumak', 'Kuşluk namazı', 'Gece namazı (teheccüd)']
    },
    {
        id: 'mubah',
        name: 'Mübah',
        icon: '⚪',
        description: 'Yapılması veya yapılmaması serbest olan, dini hüküm taşımayan davranışlardır.',
        examples: ['Yemek yemek', 'Uyumak', 'Yürümek', 'Ticaret yapmak']
    }
];

// 5. Namazı Bozan Şeyler
export const PRAYER_INVALIDATORS = [
    { id: 1, text: 'Konuşmak (bilerek veya yanlışlıkla)', icon: '🗣️' },
    { id: 2, text: 'Gülmek (kahkaha atmak)', icon: '😂' },
    { id: 3, text: 'Yemek veya içmek', icon: '🍽️' },
    { id: 4, text: 'Kıbleden göğsü çevirmek', icon: '🧭' },
    { id: 5, text: 'Amel-i kesir (namaz dışı fazla hareket)', icon: '🤸' },
    { id: 6, text: 'Abdestin bozulması', icon: '💧' },
    { id: 7, text: 'Avret yerinin açılması', icon: '👔' },
    { id: 8, text: 'Ağlamak (dünya işi için)', icon: '😢' },
    { id: 9, text: 'Öksürüğü zorlamak (sebepsiz)', icon: '😷' },
    { id: 10, text: 'Üflemek (ağızla hava çıkarmak)', icon: '💨' },
    { id: 11, text: 'Kur\'an\'ı yanlış okumak (mana bozulacak şekilde)', icon: '📖' },
    { id: 12, text: 'Bayılmak veya delirmek', icon: '😵' }
];

// 6. Quiz Soruları
export const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: 'Namaza başlarken söylenen tekbirin adı nedir?',
        options: ['Sena', 'İftitah Tekbiri', 'Selamün Aleyküm', 'Tekbir-i Teşrik'],
        correctAnswer: 1
    },
    {
        id: 2,
        question: 'Rükûda kaç kere tesbih çekilir?',
        options: ['1', '3', '5', '7'],
        correctAnswer: 1
    },
    {
        id: 3,
        question: 'Sabah namazı toplam kaç rekattir?',
        options: ['2', '4', '6', '8'],
        correctAnswer: 1
    },
    {
        id: 4,
        question: 'Vitir namazı hangi hükümdedir?',
        options: ['Farz', 'Vacip', 'Sünnet', 'Müstehap'],
        correctAnswer: 1
    },
    {
        id: 5,
        question: 'Aşağıdakilerden hangisi namazı bozmaz?',
        options: ['Konuşmak', 'Gülmek', 'Ağlamak (Allah korkusuyla)', 'Yemek'],
        correctAnswer: 2
    },
    {
        id: 6,
        question: 'Namazda Fatiha suresi okumak hangi hükümdedir?',
        options: ['Farz', 'Vacip', 'Sünnet', 'Mübah'],
        correctAnswer: 1
    },
    {
        id: 7,
        question: 'Secde tesbihi hangisidir?',
        options: ['Sübhane Rabbiyel Azim', 'Sübhane Rabbiyel Ala', 'Semiallahu limen hamideh', 'Rabbena lekel hamd'],
        correctAnswer: 1
    },
    {
        id: 8,
        question: 'Yatsı namazının farzı kaç rekattir?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 2
    },
    {
        id: 9,
        question: 'İki secde arasındaki oturuşun adı nedir?',
        options: ['Ka\'de', 'Celse', 'Kavme', 'Kıyam'],
        correctAnswer: 1
    },
    {
        id: 10,
        question: 'Namazda ettehiyyatü ne zaman okunur?',
        options: ['İlk rekatta', 'Rükûda', 'Son oturuşta', 'Secdede'],
        correctAnswer: 2
    }
];
