// Comprehensive Dhikr/Zikir Data
// Includes morning/evening adhkar, protection duas, post-prayer dhikr, and common dhikrs

export const DHIKR_CATEGORIES = [
    { id: 'daily', title: 'Günlük Zikirler', icon: '📿', color: '#27ae60' },
    { id: 'morning', title: 'Sabah Adhkarları', icon: '🌅', color: '#f39c12' },
    { id: 'evening', title: 'Akşam Adhkarları', icon: '🌙', color: '#9b59b6' },
    { id: 'protection', title: 'Koruma Duaları', icon: '🛡️', color: '#3498db' },
    { id: 'postPrayer', title: 'Namaz Sonrası', icon: '🤲', color: '#e74c3c' },
    { id: 'sleep', title: 'Uyku Öncesi', icon: '😴', color: '#1abc9c' }
];

// Main dhikr collection
export const DHIKR_LIST = [
    // ===== GÜNLÜK ZİKİRLER (Daily Dhikrs) =====
    {
        id: 1,
        category: 'daily',
        arabic: 'سُبْحَانَ اللهِ',
        latin: 'Sübhanallah',
        meaning: 'Allah\'ı tüm eksikliklerden tenzih ederim',
        virtue: 'Bir ağaç cennete dikilir',
        count: 33,
        icon: '🌳',
        color: '#27ae60'
    },
    {
        id: 2,
        category: 'daily',
        arabic: 'الْحَمْدُ لِلهِ',
        latin: 'Elhamdülillah',
        meaning: 'Hamd Allah\'a mahsustur',
        virtue: 'Mizanı doldurur',
        count: 33,
        icon: '⚖️',
        color: '#f39c12'
    },
    {
        id: 3,
        category: 'daily',
        arabic: 'اللهُ أَكْبَرُ',
        latin: 'Allahu Ekber',
        meaning: 'Allah en büyüktür',
        virtue: 'Yerle gök arası sevap kazandırır',
        count: 33,
        icon: '🌟',
        color: '#9b59b6'
    },
    {
        id: 4,
        category: 'daily',
        arabic: 'لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
        latin: 'Lâ ilâhe illallahu vahdehû lâ şerîke leh',
        meaning: 'Allah\'tan başka ilah yoktur, O tektir, ortağı yoktur',
        virtue: '100 köle azat etmiş gibi sevap',
        count: 100,
        icon: '💎',
        color: '#3498db'
    },
    {
        id: 5,
        category: 'daily',
        arabic: 'أَسْتَغْفِرُ اللهَ الْعَظِيمَ',
        latin: 'Estağfirullahel azîm',
        meaning: 'Yüce Allah\'tan bağışlanma dilerim',
        virtue: 'Günahlar bağışlanır, rızık genişler',
        count: 100,
        icon: '💧',
        color: '#1abc9c'
    },
    {
        id: 6,
        category: 'daily',
        arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ',
        latin: 'Allahümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed',
        meaning: 'Allah\'ım, Efendimiz Muhammed\'e ve ailesine salat eyle',
        virtue: '10 kat sevap, 10 günah silinir, 10 derece yükselir',
        count: 100,
        icon: '🌹',
        color: '#e74c3c'
    },
    {
        id: 7,
        category: 'daily',
        arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
        latin: 'Sübhanallahi ve bihamdih',
        meaning: 'Allah\'ı hamd ile tesbih ederim',
        virtue: 'Deniz köpükleri kadar günahlar bağışlanır',
        count: 100,
        icon: '🌊',
        color: '#00bcd4'
    },
    {
        id: 8,
        category: 'daily',
        arabic: 'سُبْحَانَ اللهِ الْعَظِيمِ وَبِحَمْدِهِ',
        latin: 'Sübhanallahil azîm ve bihamdih',
        meaning: 'Yüce Allah\'ı hamd ile tesbih ederim',
        virtue: 'Dile hafif, mizanda ağır iki kelime',
        count: 100,
        icon: '⚡',
        color: '#ff5722'
    },
    {
        id: 9,
        category: 'daily',
        arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
        latin: 'Lâ havle ve lâ kuvvete illâ billah',
        meaning: 'Güç ve kuvvet ancak Allah\'tandır',
        virtue: 'Cennet hazinelerinden bir hazine',
        count: 100,
        icon: '💪',
        color: '#795548'
    },

    // ===== SABAH ADHKARLARI (Morning Adhkar) =====
    {
        id: 10,
        category: 'morning',
        arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        latin: 'Asbahnâ ve asbahal mulku lillâh, vel hamdulillâh, lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehul mulku ve lehul hamd, ve huve alâ kulli şey\'in kadîr',
        meaning: 'Sabaha erdik, mülk de Allah\'ın sabahına erdi. Hamd Allah\'a mahsustur.',
        virtue: 'Sabahın ilk zikridir',
        count: 1,
        icon: '☀️',
        color: '#ff9800'
    },
    {
        id: 11,
        category: 'morning',
        arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
        latin: 'Allahümme bike asbahnâ, ve bike emseynâ, ve bike nahyâ, ve bike nemût, ve ileyken-nuşûr',
        meaning: 'Allah\'ım! Seninle sabahladık, seninle akşamladık. Seninle yaşar, seninle ölürüz. Dönüş sanadır.',
        virtue: 'Günü Allah\'a emanet etmek',
        count: 1,
        icon: '🌄',
        color: '#ffc107'
    },
    {
        id: 12,
        category: 'morning',
        arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
        latin: 'Allahümme ente rabbî lâ ilâhe illâ ente, halaktenî ve ene abduke, ve ene alâ ahdike ve va\'dike mestata\'t, eûzu bike min şerri mâ sana\'tu, ebûu leke bi ni\'metike aleyye, ve ebûu bi zenbî fağfir lî feinnehû lâ yağfiruz zunûbe illâ ente',
        meaning: 'Seyyidül İstiğfar - İstiğfarın Efendisi',
        virtue: 'Akşam ölünce veya sabah ölünce cennet garantisi',
        count: 1,
        icon: '👑',
        color: '#d4af37'
    },
    {
        id: 13,
        category: 'morning',
        arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
        latin: 'Radîtu billâhi rabben, ve bil-islâmi dînen, ve bi Muhammedin sallallahu aleyhi ve selleme nebiyyâ',
        meaning: 'Allah\'ı Rab, İslam\'ı din, Muhammed\'i (s.a.v.) peygamber olarak kabul ettim',
        virtue: 'Cennet vacip olur',
        count: 3,
        icon: '✨',
        color: '#e91e63'
    },
    {
        id: 14,
        category: 'morning',
        arabic: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        latin: 'Bismillahillezî lâ yedurru mea ismihî şey\'un fil ardi ve lâ fis-semâi ve huves-semîul alîm',
        meaning: 'Allah\'ın adıyla ki, O\'nun adıyla birlikte yerde ve gökte hiçbir şey zarar veremez',
        virtue: 'O gün hiçbir şey zarar veremez',
        count: 3,
        icon: '🛡️',
        color: '#2196f3'
    },
    {
        id: 15,
        category: 'morning',
        arabic: 'حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
        latin: 'Hasbiyallahu lâ ilâhe illâ huve, aleyhi tevekkeltü ve huve rabbul arşil azîm',
        meaning: 'Allah bana yeter, O\'ndan başka ilah yoktur. O\'na tevekkül ettim.',
        virtue: 'Dünya ve ahiret işlerinde Allah yeter',
        count: 7,
        icon: '🏛️',
        color: '#673ab7'
    },

    // ===== AKŞAM ADHKARLARI (Evening Adhkar) =====
    {
        id: 16,
        category: 'evening',
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
        latin: 'Emseynâ ve emsel mulku lillâh, vel hamdulillâh',
        meaning: 'Akşama erdik, mülk de Allah\'ın akşamına erdi. Hamd Allah\'a mahsustur.',
        virtue: 'Akşamın ilk zikridir',
        count: 1,
        icon: '🌆',
        color: '#673ab7'
    },
    {
        id: 17,
        category: 'evening',
        arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
        latin: 'Allahümme bike emseynâ, ve bike asbahnâ, ve bike nahyâ, ve bike nemût, ve ileykel masîr',
        meaning: 'Allah\'ım! Seninle akşamladık, seninle sabahladık. Seninle yaşar, seninle ölürüz. Dönüş sanadır.',
        virtue: 'Geceyi Allah\'a emanet etmek',
        count: 1,
        icon: '🌙',
        color: '#3f51b5'
    },
    {
        id: 18,
        category: 'evening',
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        latin: 'Eûzu bikelimâtillahit-tâmmâti min şerri mâ halak',
        meaning: 'Allah\'ın eksiksiz kelimelerine, yarattıklarının şerrinden sığınırım',
        virtue: 'O gece hiçbir şey zarar veremez',
        count: 3,
        icon: '🌠',
        color: '#009688'
    },

    // ===== KORUMA DUALARI (Protection Duas) =====
    {
        id: 19,
        category: 'protection',
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
        latin: 'Eûzu bikelimâtillahit-tâmmâti min kulli şeytânin ve hâmmetin ve min kulli aynin lâmmeh',
        meaning: 'Allah\'ın eksiksiz kelimelerine, şeytanlardan, zararlı yaratıklardan ve kem gözden sığınırım',
        virtue: 'Nazar ve sihirden korunma',
        count: 3,
        icon: '👁️',
        color: '#607d8b'
    },
    {
        id: 20,
        category: 'protection',
        arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ',
        latin: 'Allahümme âfinî fî bedenî, Allahümme âfinî fî sem\'î, Allahümme âfinî fî basarî, lâ ilâhe illâ ent',
        meaning: 'Allah\'ım bedenime, kulağıma, gözüme afiyet ver',
        virtue: 'Beden sağlığı için',
        count: 3,
        icon: '💪',
        color: '#4caf50'
    },
    {
        id: 21,
        category: 'protection',
        arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالْفَقْرِ، وَعَذَابِ الْقَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ',
        latin: 'Allahümme innî eûzu bike minel kufri vel fakri ve min azâbil kabri, lâ ilâhe illâ ent',
        meaning: 'Allah\'ım küfürden, fakirlikten ve kabir azabından sana sığınırım',
        virtue: 'Küfür, fakirlik ve kabir azabından korunma',
        count: 3,
        icon: '🏰',
        color: '#795548'
    },
    {
        id: 22,
        category: 'protection',
        arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ أَبَدًا',
        latin: 'Yâ Hayyu yâ Kayyûm birahmetike esteğîs, aslih lî şe\'nî kulleh, ve lâ tekilnî ilâ nefsî tarfete aynin ebedâ',
        meaning: 'Ey Diri ve her şeyi ayakta tutan! Rahmetinle yardım istiyorum, beni bir an bile nefsime bırakma',
        virtue: 'Her türlü zorluktan kurtulmak için',
        count: 3,
        icon: '🆘',
        color: '#f44336'
    },
    {
        id: 23,
        category: 'protection',
        arabic: 'اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
        latin: 'Allahummahfaznî min beyni yedeyye ve min halfî ve an yemînî ve an şimâlî ve min fevkî ve eûzu bi azametike en uğtâle min tahtî',
        meaning: 'Allah\'ım beni önümden, arkamdan, sağımdan, solumdan, üstümden koru. Azametinle altımdan gelecek tehlikeden sığınırım',
        virtue: 'Her yönden korunma',
        count: 1,
        icon: '⬜',
        color: '#9c27b0'
    },

    // ===== NAMAZ SONRASI (Post-Prayer Dhikr) =====
    {
        id: 24,
        category: 'postPrayer',
        arabic: 'أَسْتَغْفِرُ اللَّهَ',
        latin: 'Estağfirullah',
        meaning: 'Allah\'tan bağışlanma dilerim',
        virtue: 'Namaz sonrası günahların bağışlanması',
        count: 3,
        icon: '🔄',
        color: '#00bcd4'
    },
    {
        id: 25,
        category: 'postPrayer',
        arabic: 'اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ',
        latin: 'Allahümme entes-selâmu ve minkes-selâm. Tebârekte yâ zel-celâli vel-ikrâm',
        meaning: 'Allah\'ım! Sen Selam\'sın, selâmet sendendir. Ey celal ve ikram sahibi!',
        virtue: 'Namazı tamamlama duası',
        count: 1,
        icon: '✅',
        color: '#8bc34a'
    },
    {
        id: 26,
        category: 'postPrayer',
        arabic: 'آيَةُ الْكُرْسِيّ',
        latin: 'Ayetel Kürsi',
        meaning: 'Bakara Suresi 255. Ayet',
        virtue: 'Her namazdan sonra okuyan cennete girer',
        count: 1,
        icon: '📖',
        color: '#ffc107'
    },

    // ===== UYKU ÖNCESİ (Before Sleep) =====
    {
        id: 27,
        category: 'sleep',
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        latin: 'Bismikallahümme emûtu ve ahyâ',
        meaning: 'Allah\'ım! Senin isminle ölür ve dirilirim',
        virtue: 'Uyku duası',
        count: 1,
        icon: '🌙',
        color: '#3f51b5'
    },
    {
        id: 28,
        category: 'sleep',
        arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
        latin: 'Allahümme kınî azâbeke yevme teb\'asü ibâdek',
        meaning: 'Allah\'ım! Kullarını dirilttiğin gün beni azabından koru',
        virtue: 'Azaptan korunma duası',
        count: 3,
        icon: '🛏️',
        color: '#673ab7'
    },
    {
        id: 29,
        category: 'sleep',
        arabic: 'سُبْحَانَ اللهِ (33) الْحَمْدُ لِلهِ (33) اللهُ أَكْبَرُ (34)',
        latin: 'Sübhanallah 33, Elhamdülillah 33, Allahu Ekber 34',
        meaning: 'Hz. Fatıma\'ya öğretilen tesbih',
        virtue: 'Hizmetçiden hayırlıdır',
        count: 1,
        icon: '📿',
        color: '#e91e63'
    }
];

// Get dhikr by category
export const getDhikrByCategory = (categoryId) => {
    return DHIKR_LIST.filter(d => d.category === categoryId);
};

// Get all dhikr categories with counts
export const getCategoriesWithCounts = () => {
    return DHIKR_CATEGORIES.map(cat => ({
        ...cat,
        count: DHIKR_LIST.filter(d => d.category === cat.id).length
    }));
};

// Get daily recommended dhikrs
export const getDailyRecommended = () => {
    const dailyIds = [1, 2, 3, 5, 6, 7]; // Basic daily dhikrs
    return DHIKR_LIST.filter(d => dailyIds.includes(d.id));
};
