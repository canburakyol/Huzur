// Tespihat (Namaz Sonrası Zikirler) Data
// Post-prayer supplications and recitations

export const TESPIHAT_SECTIONS = [
    {
        id: 'istigfar',
        title: 'İstiğfar',
        subtitle: '3 defa',
        icon: '🤲',
        count: 3,
        arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ',
        latin: 'Estağfirullah el-azîm',
        meaning: 'Yüce Allah\'tan bağışlanma dilerim.',
        longArabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الْكَرِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
        longLatin: 'Estağfirullahel azîm el-kerîm ellezî lâ ilâhe illâ hû el-hayyul kayyûmu ve etûbu ileyh',
        longMeaning: 'Azîm ve Kerîm olan Allah\'tan bağışlanma dilerim ki, O\'ndan başka ilâh yoktur. O Hayy (diri) ve Kayyûm (her şeyi ayakta tutan) olandır. O\'na tövbe ederim.'
    },
    {
        id: 'entes-selam',
        title: 'Allâhümme Entes-Selâm',
        subtitle: 'Namaz sonrası dua',
        icon: '✨',
        count: 1,
        arabic: 'اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ',
        latin: 'Allâhümme entes-selâmu ve minkes-selâm. Tebârekte yâ zel-celâli vel-ikrâm.',
        meaning: 'Allah\'ım! Sen Selâm\'sın (esenlik verensin). Selâmet ve esenlik sendendir. Ey celâl ve ikram sahibi! Sen mübarek ve yücesin.'
    },
    {
        id: 'salavat',
        title: 'Salâvat-ı Şerîfe',
        subtitle: 'Peygamberimize salât',
        icon: '🌙',
        count: 1,
        arabic: 'اللّٰهُمَّ صَلِّ عَلٰى سَيِّدِنَا مُحَمَّدٍ وَعَلٰى اٰلِ سَيِّدِنَا مُحَمَّدٍ',
        latin: 'Allâhümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed.',
        meaning: 'Allah\'ım! Efendimiz Hz. Muhammed\'e ve O\'nun ailesine salât eyle (rahmet et, şerefini yücelt).'
    },
    {
        id: 'subhanallahi',
        title: 'Sübhânallâhi vel-Hamdülillâh',
        subtitle: 'Tesbih, hamd ve tekbir',
        icon: '📿',
        count: 1,
        arabic: 'سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا اِلٰهَ اِلَّا اللّٰهُ وَاللّٰهُ اَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ اِلَّا بِاللّٰهِ الْعَلِىِّ الْعَظٖيمِ',
        latin: 'Sübhanallâhi vel-hamdülillâhi ve lâ ilâhe illallâhu vallâhu ekber. Ve lâ havle ve lâ kuvvete illâ billâhil aliyyil azîm.',
        meaning: 'Allah\'ı tesbih ederim. Hamd Allah\'a mahsustur. Allah\'tan başka ilâh yoktur. Allah en büyüktür. Güç ve kuvvet ancak yüce Allah\'ın yardımıyladır.'
    },
    {
        id: 'ayetel-kursi',
        title: 'Âyetü\'l-Kürsî',
        subtitle: 'Bakara 255',
        icon: '📖',
        count: 1,
        arabic: `بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ
اَللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ`,
        latin: 'Bismillâhirrahmânirrahîm. Allâhü lâ ilâhe illâ hüvel hayyül kayyûm. Lâ te\'huzühû sinetün ve lâ nevm. Lehû mâ fis-semâvâti vemâ fil-ard. Men zellezî yeşfeu indehû illâ biiznih. Ya\'lemü mâ beyne eydîhim vemâ halfehüm. Velâ yuhîtûne bişey\'in min ilmihî illâ bimâ şâe. Vesia kürsiyyühüs-semâvâti vel arda. Velâ yeûduhû hıfzuhumâ. Ve hüvel aliyyül azîm.',
        meaning: 'Rahman ve Rahim olan Allah\'ın adıyla. Allah ki, O\'ndan başka ilâh yoktur. Diridir, her şeyi ayakta tutandır. O\'nu ne uyuklama tutar ne de uyku. Göklerde ve yerde ne varsa hepsi O\'nundur. İzni olmadan O\'nun katında şefaat edecek kimdir? Kullarının önlerini ve arkalarını bilir. Onlar O\'nun ilminden dilediği kadarından başka bir şey kavrayamazlar. O\'nun kürsüsü gökleri ve yeri kuşatmıştır. Onları korumak O\'na ağır gelmez. O, çok yücedir, çok büyüktür.'
    }
];

// 33'lük Tesbihler
export const TESBIHLER = [
    {
        id: 'subhanallah',
        title: 'Sübhanallah',
        arabic: 'سُبْحَانَ اللّٰهِ',
        latin: 'Sübhanallah',
        meaning: 'Allah\'ı noksan sıfatlardan tenzih ederim.',
        count: 33,
        color: '#4CAF50' // Green
    },
    {
        id: 'elhamdulillah',
        title: 'Elhamdülillah',
        arabic: 'اَلْحَمْدُ لِلّٰهِ',
        latin: 'Elhamdülillah',
        meaning: 'Her türlü övgü Allah\'a mahsustur.',
        count: 33,
        color: '#2196F3' // Blue
    },
    {
        id: 'allahuekber',
        title: 'Allahu Ekber',
        arabic: 'اَللّٰهُ اَكْبَرُ',
        latin: 'Allâhu Ekber',
        meaning: 'Allah en büyüktür.',
        count: 33,
        color: '#FF9800' // Orange
    }
];

// Tevhid
export const TEVHID = {
    id: 'tevhid',
    title: 'Tevhid',
    subtitle: 'Tesbihlerin ardından',
    icon: '🌟',
    arabic: 'لَا اِلٰهَ اِلَّا اللّٰهُ وَحْدَهُ لَا شَرٖيكَ لَهُ الْمُلْكُ وَ لَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    latin: 'Lâ ilâhe illallâhu vahdehû lâ şerike leh. Lehü\'l-mülkü ve lehü\'l-hamdü ve hüve alâ külli şey\'in kadîr.',
    meaning: 'Allah\'tan başka ilâh yoktur; O tektir, ortağı yoktur. Mülk O\'nundur, hamd O\'na mahsustur. O\'nun her şeye gücü yeter.'
};

// Namaz Sonrası Dualar
export const NAMAZSONRASI_DUALAR = [
    {
        id: 'rabbena1',
        title: 'Rabbenâ Âtinâ',
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        latin: 'Rabbenâ âtinâ fid-dünyâ haseneten ve fil-âhireti haseneten ve kınâ azâben-nâr.',
        meaning: 'Rabbimiz! Bize dünyada da ahirette de güzellik ver ve bizi ateş azabından koru.'
    },
    {
        id: 'rabbena2',
        title: 'Rabbenağfirlî',
        arabic: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
        latin: 'Rabbenağfirlî ve li-vâlideyye ve lil-mü\'minîne yevme yekûmül-hisâb.',
        meaning: 'Rabbimiz! Hesap gününde beni, anne-babamı ve müminleri bağışla.'
    },
    {
        id: 'rabbi-inni',
        title: 'Rabbi İnnî',
        arabic: 'رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
        latin: 'Rabbi innî limâ enzelte ileyye min hayrin fekîr.',
        meaning: 'Rabbim! Bana indireceğin her hayra muhtacım.'
    },
    {
        id: 'rabbi-habli',
        title: 'Rabbi Hablî',
        arabic: 'رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ',
        latin: 'Rabbi hablî min ledünke zürriyyeten tayyibeh. İnneke semîud-duâ.',
        meaning: 'Rabbim! Bana katından temiz bir nesil bağışla. Şüphesiz sen duaları işitensin.'
    }
];

// Tespihat sırası (tam versiyon)
export const TESPIHAT_ORDER = [
    'istigfar',
    'entes-selam',
    'salavat',
    'subhanallahi',
    'ayetel-kursi',
    'tesbih-subhanallah',
    'tesbih-elhamdulillah',
    'tesbih-allahuekber',
    'tevhid',
    'dua'
];
