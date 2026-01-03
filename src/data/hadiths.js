// Hadis-i Şerif Veritabanı
// Kategorilere göre düzenlenmiş hadisler

export const hadithCategories = [
    { id: 'iman', name: 'İman', icon: '💖', color: '#e74c3c' },
    { id: 'ibadet', name: 'İbadet', icon: '🕌', color: '#9b59b6' },
    { id: 'ahlak', name: 'Ahlak', icon: '🌟', color: '#f39c12' },
    { id: 'aile', name: 'Aile', icon: '👨‍👩‍👧‍👦', color: '#27ae60' },
    { id: 'ilim', name: 'İlim', icon: '📚', color: '#3498db' },
    { id: 'dua', name: 'Dua', icon: '🤲', color: '#1abc9c' },
    { id: 'sabir', name: 'Sabır', icon: '🌿', color: '#16a085' },
    { id: 'rizik', name: 'Rızık', icon: '💰', color: '#e67e22' },
];

export const hadiths = [
    // --- İMAN ---
    {
        id: 1,
        category: 'iman',
        arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
        text: 'Ameller niyetlere göredir. Herkesin niyet ettiği ne ise eline geçecek olan ancak odur.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ömer (r.a.)'
    },
    {
        id: 2,
        category: 'iman',
        arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
        text: 'Sizden biriniz, kendisi için istediğini kardeşi için de istemedikçe gerçek mümin olamaz.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Enes (r.a.)'
    },
    {
        id: 3,
        category: 'iman',
        arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
        text: 'Müslüman, dilinden ve elinden diğer Müslümanların güvende olduğu kimsedir.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Abdullah bin Amr (r.a.)'
    },
    {
        id: 101,
        category: 'iman',
        arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
        text: 'Allah\'a ve ahiret gününe iman eden kimse ya hayır söylesin ya da sussun.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 102,
        category: 'iman',
        arabic: 'ثَلَاثٌ مَنْ كُنَّ فِيهِ وَجَدَ حَلَاوَةَ الْإِيمَانِ',
        text: 'Üç özellik vardır ki, bunlar kimde bulunursa o kimse imanın tadını alır: Allah ve Resûlünü her şeyden çok sevmek, sevdiği kimseyi yalnızca Allah rızası için sevmek, Allah kendisini küfürden kurtardıktan sonra tekrar küfre dönmekten ateşe atılmaktan korktuğu gibi korkmak.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Enes (r.a.)'
    },
    {
        id: 103,
        category: 'iman',
        arabic: 'الدِّينُ النَّصِيحَةُ',
        text: 'Din samimiyettir.',
        source: 'Müslim',
        narrator: 'Hz. Temîm ed-Dârî (r.a.)'
    },
    {
        id: 104,
        category: 'iman',
        arabic: 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
        text: 'Müminlerin iman bakımından en mükemmeli, ahlakı en güzel olanıdır.',
        source: 'Tirmizî',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 105,
        category: 'iman',
        arabic: 'مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ',
        text: 'Sizden kim bir kötülük görürse onu eliyle düzeltsin. Buna gücü yetmezse diliyle düzeltsin. Buna da gücü yetmezse kalbiyle buğzetsin. Bu ise imanın en zayıf derecesidir.',
        source: 'Müslim',
        narrator: 'Hz. Ebû Saîd el-Hudrî (r.a.)'
    },
    {
        id: 106,
        category: 'iman',
        arabic: 'لَا يَدْخُلُ الْجَنَّةَ مَنْ كَانَ فِي قَلْبِهِ مِثْقَالُ ذَرَّةٍ مِنْ كِبْرٍ',
        text: 'Kalbinde zerre kadar kibir bulunan kimse cennete giremez.',
        source: 'Müslim',
        narrator: 'Hz. Abdullah bin Mes\'ud (r.a.)'
    },
    {
        id: 107,
        category: 'iman',
        arabic: 'الْحَيَاءُ مِنَ الْإِيمَانِ',
        text: 'Haya imandandır.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Abdullah bin Ömer (r.a.)'
    },
    {
        id: 108,
        category: 'iman',
        arabic: 'أَفْضَلُ الْأَعْمَالِ الْحُبُّ فِي اللَّهِ وَالْبُغْضُ فِي اللَّهِ',
        text: 'Amellerin en faziletlisi Allah için sevmek ve Allah için buğzetmektir.',
        source: 'Ebû Dâvûd',
        narrator: 'Hz. Ebû Zer (r.a.)'
    },
    {
        id: 109,
        category: 'iman',
        arabic: 'مَنْ مَاتَ وَهُوَ يَعْلَمُ أَنَّهُ لَا إِلَهَ إِلَّا اللَّهُ دَخَلَ الْجَنَّةَ',
        text: 'Kim Allah\'tan başka ilah olmadığını bilerek ölürse cennete girer.',
        source: 'Müslim',
        narrator: 'Hz. Osman (r.a.)'
    },
    {
        id: 110,
        category: 'iman',
        arabic: 'ذَاقَ طَعْمَ الْإِيمَانِ مَنْ رَضِيَ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ رَسُولًا',
        text: 'Rab olarak Allah\'tan, din olarak İslam\'dan, peygamber olarak Muhammed\'den razı olan kimse imanın tadını tatmıştır.',
        source: 'Müslim',
        narrator: 'Hz. Abbas (r.a.)'
    },

    // --- İBADET ---
    {
        id: 4,
        category: 'ibadet',
        arabic: 'الصَّلَاةُ عِمَادُ الدِّينِ',
        text: 'Namaz dinin direğidir.',
        source: 'Beyhakî',
        narrator: 'Hz. Ömer (r.a.)'
    },
    {
        id: 5,
        category: 'ibadet',
        arabic: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
        text: 'Kim inanarak ve sevabını Allah\'tan bekleyerek Ramazan orucunu tutarsa, geçmiş günahları bağışlanır.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 6,
        category: 'ibadet',
        arabic: 'الطُّهُورُ شَطْرُ الْإِيمَانِ',
        text: 'Temizlik imanın yarısıdır.',
        source: 'Müslim',
        narrator: 'Hz. Ebû Mâlik el-Eş\'arî (r.a.)'
    },
    {
        id: 201,
        category: 'ibadet',
        arabic: 'مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ',
        text: 'Kim iki serinlik namazını (sabah ve ikindi) kılarsa cennete girer.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Musa (r.a.)'
    },
    {
        id: 202,
        category: 'ibadet',
        arabic: 'الصَّلَوَاتُ الْخَمْسُ وَالْجُمُعَةُ إِلَى الْجُمُعَةِ كَفَّارَةٌ لِمَا بَيْنَهُنَّ',
        text: 'Beş vakit namaz ve Cuma namazı diğer Cuma\'ya kadar, büyük günahlardan kaçınıldığı takdirde, aralarında işlenen küçük günahlara kefarettir.',
        source: 'Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 203,
        category: 'ibadet',
        arabic: 'أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ',
        text: 'Kulun Rabbine en yakın olduğu an secde halidir. Öyleyse secdede çokça dua ediniz.',
        source: 'Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 204,
        category: 'ibadet',
        arabic: 'بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ',
        text: 'İslam beş temel üzerine kurulmuştur: Allah\'tan başka ilah olmadığına ve Muhammed\'in Allah\'ın Resulü olduğuna şahitlik etmek, namaz kılmak, zekat vermek, haccetmek ve Ramazan orucunu tutmak.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Abdullah bin Ömer (r.a.)'
    },
    {
        id: 205,
        category: 'ibadet',
        arabic: 'مَنْ قَامَ لَيْلَةَ الْقَدْرِ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
        text: 'Kim Kadir Gecesi\'ni, faziletine inanarak ve sevabını Allah\'tan bekleyerek ibadetle geçirirse, geçmiş günahları bağışlanır.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 206,
        category: 'ibadet',
        arabic: 'الْعُمْرَةُ إِلَى الْعُمْرَةِ كَفَّارَةٌ لِمَا بَيْنَهُمَا',
        text: 'Umre, diğer umreye kadar arada işlenen günahlara kefarettir. Kabul olunmuş Haccın karşılığı ise ancak cennettir.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 207,
        category: 'ibadet',
        arabic: 'مَنْ نَسِيَ وَهُوَ صَائِمٌ فَأَكَلَ أَوْ شَرِبَ فَلْيُتِمَّ صَوْمَهُ',
        text: 'Oruçlu iken unutarak yiyip içen kimse orucunu tamamlasın. Çünkü ona Allah yedirmiş ve içirmiştir.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 208,
        category: 'ibadet',
        arabic: 'مَنْ تَوَضَّأَ فَأَحْسَنَ الْوُضُوءَ خَرَجَتْ خَطَايَاهُ مِنْ جَسَدِهِ',
        text: 'Kim güzelce abdest alırsa, günahları tırnaklarının altına varıncaya kadar bütün vücudundan çıkar.',
        source: 'Müslim',
        narrator: 'Hz. Osman (r.a.)'
    },
    {
        id: 209,
        category: 'ibadet',
        arabic: 'لَوْ يَعْلَمُ النَّاسُ مَا فِي النِّدَاءِ وَالصَّفِّ الْأَوَّلِ لَاسْتَهَمُوا عَلَيْهِ',
        text: 'İnsanlar ezan okumanın ve ilk safta namaz kılmanın sevabını bilselerdi, bunun için kura çekmekten başka çare bulamasalar, mutlaka kura çekerlerdi.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 210,
        category: 'ibadet',
        arabic: 'مَنْ غَدَا إِلَى الْمَسْجِدِ أَوْ رَاحَ أَعَدَّ اللَّهُ لَهُ فِي الْجَنَّةِ نُزُلًا',
        text: 'Kim sabah akşam camiye giderse, Allah ona her gidiş gelişinde cennette bir ikram hazırlar.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },

    // --- AHLAK ---
    {
        id: 7,
        category: 'ahlak',
        arabic: 'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ',
        text: 'Ben ancak güzel ahlakı tamamlamak için gönderildim.',
        source: 'Mâlik, Ahmed',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 8,
        category: 'ahlak',
        arabic: 'خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ',
        text: 'Sizin en hayırlınız, ailesine karşı en hayırlı olanınızdır.',
        source: 'Tirmizî',
        narrator: 'Hz. Âişe (r.a.)'
    },
    {
        id: 9,
        category: 'ahlak',
        arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ',
        text: 'Kardeşinin yüzüne gülümsemen sadakadır.',
        source: 'Tirmizî',
        narrator: 'Hz. Ebû Zer (r.a.)'
    },
    {
        id: 301,
        category: 'ahlak',
        arabic: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
        text: 'Güçlü kimse güreşte rakibini yenen değil, öfke anında kendine hakim olandır.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 302,
        category: 'ahlak',
        arabic: 'إِيَّاكُمْ وَالظَّنَّ فَإِنَّ الظَّنَّ أَكْذَبُ الْحَدِيثِ',
        text: 'Zandan sakının. Çünkü zan, sözlerin en yalanıdır.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 303,
        category: 'ahlak',
        arabic: 'لَا تَحَاسَدُوا وَلَا تَنَاجَشُوا وَلَا تَبَاغَضُوا',
        text: 'Birbirinize haset etmeyin, alışverişte birbirinizi kızıştırmayın, birbirinize kin beslemeyin, birbirinize sırt çevirmeyin.',
        source: 'Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 304,
        category: 'ahlak',
        arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ',
        text: 'Allah\'a ve ahiret gününe iman eden kimse misafirine ikram etsin.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 305,
        category: 'ahlak',
        arabic: 'إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ',
        text: 'Doğruluk iyiliğe, iyilik de cennete götürür. Kişi doğru söyleye söyleye Allah katında sıddık (doğru sözlü) diye yazılır.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Abdullah bin Mes\'ud (r.a.)'
    },
    {
        id: 306,
        category: 'ahlak',
        arabic: 'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا',
        text: 'Müminin mümine bağlılığı, taşları birbirine kenetlenmiş bir bina gibidir.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Musa (r.a.)'
    },
    {
        id: 307,
        category: 'ahlak',
        arabic: 'مَنْ لَا يَشْكُرِ النَّاسَ لَا يَشْكُرِ اللَّهَ',
        text: 'İnsanlara teşekkür etmeyen, Allah\'a da şükretmez.',
        source: 'Tirmizî',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 308,
        category: 'ahlak',
        arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ',
        text: 'Nerede olursan ol Allah\'tan kork. Kötülüğün arkasından hemen iyilik yap ki onu silsin. İnsanlarla güzel geçin.',
        source: 'Tirmizî',
        narrator: 'Hz. Ebû Zer (r.a.)'
    },
    {
        id: 309,
        category: 'ahlak',
        arabic: 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ',
        text: 'Güzel söz sadakadır.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 310,
        category: 'ahlak',
        arabic: 'يَسِّرُوا وَلَا تُعَسِّرُوا وَبَشِّرُوا وَلَا تُنَفِّرُوا',
        text: 'Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Enes (r.a.)'
    },

    // --- AİLE ---
    {
        id: 10,
        category: 'aile',
        arabic: 'الْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ',
        text: 'Cennet annelerin ayakları altındadır.',
        source: 'Nesâî',
        narrator: 'Hz. Enes (r.a.)'
    },
    {
        id: 11,
        category: 'aile',
        arabic: 'مَنْ لَا يَرْحَمْ لَا يُرْحَمْ',
        text: 'Merhamet etmeyene merhamet olunmaz.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 12,
        category: 'aile',
        arabic: 'كُلُّكُمْ رَاعٍ وَكُلُّكُمْ مَسْؤُولٌ عَنْ رَعِيَّتِهِ',
        text: 'Hepiniz çobansınız ve hepiniz güttüğünüzden sorumlusunuz.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Abdullah bin Ömer (r.a.)'
    },
    {
        id: 401,
        category: 'aile',
        arabic: 'رِضَى الرَّبِّ فِي رِضَى الْوَالِدِ',
        text: 'Rabbin rızası, anne babanın rızasındadır. Rabbin gazabı da anne babanın gazabındadır.',
        source: 'Tirmizî',
        narrator: 'Hz. Abdullah bin Amr (r.a.)'
    },
    {
        id: 402,
        category: 'aile',
        arabic: 'مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ فَلْيَصِلْ رَحِمَهُ',
        text: 'Rızkının genişletilmesini ve ömrünün uzatılmasını isteyen kimse akrabasını gözetip kollasın.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Enes (r.a.)'
    },
    {
        id: 403,
        category: 'aile',
        arabic: 'لَا يَدْخُلُ الْجَنَّةَ قَاطِعٌ',
        text: 'Akrabasıyla ilgisini kesen kimse cennete giremez.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Cübeyr bin Mut\'im (r.a.)'
    },
    {
        id: 404,
        category: 'aile',
        arabic: 'خَيْرُكُمْ خَيْرُكُمْ لِنِسَائِهِ',
        text: 'Sizin en hayırlınız, kadınlarına karşı en hayırlı olanınızdır.',
        source: 'Tirmizî',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 405,
        category: 'aile',
        arabic: 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا وَأَلْطَفُهُمْ بِأَهْلِهِ',
        text: 'Müminlerin iman bakımından en mükemmeli, ahlakı en güzel olanı ve ailesine en nazik davrananıdır.',
        source: 'Tirmizî',
        narrator: 'Hz. Âişe (r.a.)'
    },
    {
        id: 406,
        category: 'aile',
        arabic: 'حَقُّ الْوَلَدِ عَلَى الْوَالِدِ أَنْ يُحْسِنَ اسْمَهُ وَيُحْسِنَ أَدَبَهُ',
        text: 'Çocuğun baba üzerindeki hakkı, ona güzel bir isim koyması ve güzel bir terbiye vermesidir.',
        source: 'Beyhakî',
        narrator: 'Hz. İbn Abbas (r.a.)'
    },
    {
        id: 407,
        category: 'aile',
        arabic: 'مَا نَحَلَ وَالِدٌ وَلَدًا مِنْ نَحْلٍ أَفْضَلَ مِنْ أَدَبٍ حَسَنٍ',
        text: 'Hiçbir baba, çocuğuna güzel terbiyeden daha kıymetli bir miras bırakmamıştır.',
        source: 'Tirmizî',
        narrator: 'Hz. Saîd bin Âs (r.a.)'
    },
    {
        id: 408,
        category: 'aile',
        arabic: 'اتَّقُوا اللَّهَ وَاعْدِلُوا بَيْنَ أَوْلَادِكُمْ',
        text: 'Allah\'tan korkun ve çocuklarınız arasında adaletli olun.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Nu\'man bin Beşîr (r.a.)'
    },
    {
        id: 409,
        category: 'aile',
        arabic: 'أَنْتَ وَمَالُكَ لِأَبِيكَ',
        text: 'Sen ve malın babana aitsiniz.',
        source: 'İbn Mâce',
        narrator: 'Hz. Câbir (r.a.)'
    },
    {
        id: 410,
        category: 'aile',
        arabic: 'الدُّنْيَا مَتَاعٌ وَخَيْرُ مَتَاعِ الدُّنْيَا الْمَرْأَةُ الصَّالِحَةُ',
        text: 'Dünya bir geçimlikten ibarettir. Dünyanın en hayırlı nimeti ise saliha kadındır.',
        source: 'Müslim',
        narrator: 'Hz. Abdullah bin Amr (r.a.)'
    },

    // --- İLİM ---
    {
        id: 13,
        category: 'ilim',
        arabic: 'اطْلُبُوا الْعِلْمَ مِنَ الْمَهْدِ إِلَى اللَّحْدِ',
        text: 'İlmi beşikten mezara kadar arayın.',
        source: 'Hadis',
        narrator: 'Hz. Peygamber (s.a.v.)'
    },
    {
        id: 14,
        category: 'ilim',
        arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ',
        text: 'Kim ilim öğrenmek için bir yola girerse, Allah ona cennetin yolunu kolaylaştırır.',
        source: 'Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 501,
        category: 'ilim',
        arabic: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
        text: 'İlim öğrenmek her Müslümana farzdır.',
        source: 'İbn Mâce',
        narrator: 'Hz. Enes (r.a.)'
    },
    {
        id: 502,
        category: 'ilim',
        arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
        text: 'Sizin en hayırlınız Kuran\'ı öğrenen ve öğretendir.',
        source: 'Buhârî',
        narrator: 'Hz. Osman (r.a.)'
    },
    {
        id: 503,
        category: 'ilim',
        arabic: 'الْعُلَمَاءُ وَرَثَةُ الْأَنْبِيَاءِ',
        text: 'Alimler peygamberlerin varisleridir.',
        source: 'Ebû Dâvûd',
        narrator: 'Hz. Ebû Derdâ (r.a.)'
    },
    {
        id: 504,
        category: 'ilim',
        arabic: 'مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ',
        text: 'Allah kimin hakkında hayır dilerse, onu dinde anlayış sahibi kılar.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Muâviye (r.a.)'
    },
    {
        id: 505,
        category: 'ilim',
        arabic: 'إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ',
        text: 'İnsan öldüğü zaman amel defteri kapanır. Ancak üç şey hariç: Sadaka-i cariye, faydalanılan ilim ve kendisine dua eden hayırlı evlat.',
        source: 'Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 506,
        category: 'ilim',
        arabic: 'فَضْلُ الْعَالِمِ عَلَى الْعَابِدِ كَفَضْلِ الْقَمَرِ عَلَى سَائِرِ الْكَوَاكِبِ',
        text: 'Alimin abide üstünlüğü, dolunayın diğer yıldızlara üstünlüğü gibidir.',
        source: 'Ebû Dâvûd',
        narrator: 'Hz. Ebû Derdâ (r.a.)'
    },
    {
        id: 507,
        category: 'ilim',
        arabic: 'مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ',
        text: 'Kim bir hayra vesile olursa, o hayrı yapan kadar sevap kazanır.',
        source: 'Müslim',
        narrator: 'Hz. Ebû Mes\'ud (r.a.)'
    },
    {
        id: 508,
        category: 'ilim',
        arabic: 'إِنَّ الْمَلَائِكَةَ لَتَضَعُ أَجْنِحَتَهَا لِطَالِبِ الْعِلْمِ رِضًا بِمَا يَصْنَعُ',
        text: 'Melekler, ilim öğrenen kimseden hoşnut oldukları için kanatlarını onun üzerine gererler.',
        source: 'Ebû Dâvûd',
        narrator: 'Hz. Safvân bin Assâl (r.a.)'
    },

    // --- DUA ---
    {
        id: 15,
        category: 'dua',
        arabic: 'الدُّعَاءُ هُوَ الْعِبَادَةُ',
        text: 'Dua ibadetin özüdür.',
        source: 'Tirmizî',
        narrator: 'Hz. Nu\'man bin Beşîr (r.a.)'
    },
    {
        id: 16,
        category: 'dua',
        arabic: 'ادْعُوا اللهَ وَأَنْتُمْ مُوقِنُونَ بِالْإِجَابَةِ',
        text: 'Allah\'a kabul edileceğinden emin olarak dua edin.',
        source: 'Tirmizî',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 601,
        category: 'dua',
        arabic: 'لَيْسَ شَيْءٌ أَكْرَمَ عَلَى اللَّهِ تَعَالَى مِنَ الدُّعَاءِ',
        text: 'Allah katında duadan daha kıymetli bir şey yoktur.',
        source: 'Tirmizî',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 602,
        category: 'dua',
        arabic: 'مَنْ لَمْ يَسْأَلِ اللَّهَ يَغْضَبْ عَلَيْهِ',
        text: 'Kim Allah\'tan istemezse, Allah ona gazap eder.',
        source: 'Tirmizî',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 603,
        category: 'dua',
        arabic: 'يُسْتَجَابُ لِأَحَدِكُمْ مَا لَمْ يَعْجَلْ',
        text: 'Sizden biriniz "Dua ettim de kabul olmadı" diyerek acele etmedikçe duası kabul olunur.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 604,
        category: 'dua',
        arabic: 'دَعْوَةُ الْمَرْءِ الْمُسْلِمِ لِأَخِيهِ بِظَهْرِ الْغَيْبِ مُسْتَجَابَةٌ',
        text: 'Müslüman kişinin din kardeşi için gıyabında yaptığı dua kabul olunur.',
        source: 'Müslim',
        narrator: 'Hz. Ebû Derdâ (r.a.)'
    },
    {
        id: 605,
        category: 'dua',
        arabic: 'إِنَّ رَبَّكُمْ حَيِيٌّ كَرِيمٌ يَسْتَحْيِي مِنْ عَبْدِهِ إِذَا رَفَعَ يَدَيْهِ إِلَيْهِ أَنْ يَرُدَّهُمَا صِفْرًا',
        text: 'Rabbiniz hayâ sahibidir, kerimdir. Kulu ellerini O\'na kaldırdığında, o elleri boş çevirmekten hayâ eder.',
        source: 'Ebû Dâvûd',
        narrator: 'Hz. Selman (r.a.)'
    },
    {
        id: 606,
        category: 'dua',
        arabic: 'أَقْرَبُ مَا يَكُونُ الرَّبُّ مِنَ الْعَبْدِ فِي جَوْفِ اللَّيْلِ الْآخِرِ',
        text: 'Rabbin kula en yakın olduğu an, gecenin son yarısıdır. Eğer o saatte Allah\'ı zikredenlerden olabilirsen ol.',
        source: 'Tirmizî',
        narrator: 'Hz. Amr bin Abese (r.a.)'
    },
    {
        id: 607,
        category: 'dua',
        arabic: 'الدُّعَاءُ يَنْفَعُ مِمَّا نَزَلَ وَمِمَّا لَمْ يَنْزِلْ',
        text: 'Dua, inmiş ve inmemiş olan belalara karşı fayda verir. Ey Allah\'ın kulları, duaya sarılın!',
        source: 'Tirmizî',
        narrator: 'Hz. İbn Ömer (r.a.)'
    },
    {
        id: 608,
        category: 'dua',
        arabic: 'ثَلَاثُ دَعَوَاتٍ مُسْتَجَابَاتٌ لَا شَكَّ فِيهِنَّ',
        text: 'Üç dua vardır ki, kabul olunacağında şüphe yoktur: Mazlumun duası, yolcunun duası ve babanın çocuğuna duası.',
        source: 'Ebû Dâvûd',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },

    // --- SABIR ---
    {
        id: 17,
        category: 'sabir',
        arabic: 'الصَّبْرُ ضِيَاءٌ',
        text: 'Sabır aydınlıktır.',
        source: 'Müslim',
        narrator: 'Hz. Ebû Mâlik el-Eş\'arî (r.a.)'
    },
    {
        id: 18,
        category: 'sabir',
        arabic: 'عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ',
        text: 'Müminin işi ne güzeldir! Her hali hayırdır; sevinirse şükreder, bu onun için hayır olur; başına bir bela gelirse sabreder, bu da onun için hayır olur.',
        source: 'Müslim',
        narrator: 'Hz. Suheyb (r.a.)'
    },
    {
        id: 701,
        category: 'sabir',
        arabic: 'مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حُزْنٍ',
        text: 'Müslümana fenalık, hastalık, keder, hüzün, eziyet ve gam isabet etmez ki, hatta ayağına batan bir diken bile olsa, Allah bunları onun günahlarına kefaret kılar.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Saîd el-Hudrî (r.a.)'
    },
    {
        id: 702,
        category: 'sabir',
        arabic: 'إِنَّمَا الصَّبْرُ عِنْدَ الصَّدْمَةِ الْأُولَى',
        text: 'Sabır, musibetin ilk başa geldiği andadır.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Enes (r.a.)'
    },
    {
        id: 703,
        category: 'sabir',
        arabic: 'مَنْ يَتَصَبَّرْ يُصَبِّرْهُ اللَّهُ',
        text: 'Kim sabretmeye çalışırsa, Allah ona sabır verir. Hiç kimseye sabırdan daha hayırlı ve daha geniş bir nimet verilmemiştir.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Saîd el-Hudrî (r.a.)'
    },
    {
        id: 704,
        category: 'sabir',
        arabic: 'إِذَا أَحَبَّ اللَّهُ قَوْمًا ابْتَلَاهُمْ',
        text: 'Allah bir toplumu sevdiği zaman onları imtihan eder.',
        source: 'Tirmizî',
        narrator: 'Hz. Enes (r.a.)'
    },
    {
        id: 705,
        category: 'sabir',
        arabic: 'يَوَدُّ أَهْلُ الْعَافِيَةِ يَوْمَ الْقِيَامَةِ حِينَ يُعْطَى أَهْلُ الْبَلَاءِ الثَّوَابَ لَوْ أَنَّ جُلُودَهُمْ كَانَتْ قُرِضَتْ بِالْمَقَارِيضِ',
        text: 'Kıyamet günü bela ehline sevapları verildiği zaman, dünyada afiyet içinde olanlar, derilerinin makaslarla doğranmış olmasını temenni ederler.',
        source: 'Tirmizî',
        narrator: 'Hz. Câbir (r.a.)'
    },
    {
        id: 706,
        category: 'sabir',
        arabic: 'لَا يَزَالُ الْبَلَاءُ بِالْمُؤْمِنِ وَالْمُؤْمِنَةِ فِي نَفْسِهِ وَوَلَدِهِ وَمَالِهِ حَتَّى يَلْقَى اللَّهَ وَمَا عَلَيْهِ خَطِيئَةٌ',
        text: 'Mümin erkek ve kadının nefsinde, çocuğunda ve malında bela eksik olmaz. Ta ki Allah\'a günahsız olarak kavuşsun.',
        source: 'Tirmizî',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 707,
        category: 'sabir',
        arabic: 'حُفَّتِ الْجَنَّةُ بِالْمَكَارِهِ وَحُفَّتِ النَّارُ بِالشَّهَوَاتِ',
        text: 'Cennet zorluklarla, cehennem ise şehvetlerle kuşatılmıştır.',
        source: 'Müslim',
        narrator: 'Hz. Enes (r.a.)'
    },

    // --- RIZIK ---
    {
        id: 19,
        category: 'rizik',
        arabic: 'مَا عَالَ مَنِ اقْتَصَدَ',
        text: 'İktisatlı davranan fakir düşmez.',
        source: 'Ahmed',
        narrator: 'Hz. Abdullah bin Mes\'ud (r.a.)'
    },
    {
        id: 20,
        category: 'rizik',
        arabic: 'الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى',
        text: 'Veren el, alan elden hayırlıdır.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Abdullah bin Ömer (r.a.)'
    },
    {
        id: 801,
        category: 'rizik',
        arabic: 'لَوْ أَنَّكُمْ تَوَكَّلْتُمْ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرَزَقَكُمْ كَمَا يَرْزُقُ الطَّيْرَ',
        text: 'Eğer siz Allah\'a hakkıyla tevekkül etseydiniz, kuşları rızıklandırdığı gibi sizi de rızıklandırırdı. Onlar sabah aç gider, akşam tok dönerler.',
        source: 'Tirmizî',
        narrator: 'Hz. Ömer (r.a.)'
    },
    {
        id: 802,
        category: 'rizik',
        arabic: 'مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ',
        text: 'Hiç kimse elinin emeğinden daha hayırlı bir yemek yememiştir.',
        source: 'Buhârî',
        narrator: 'Hz. Mikdâm (r.a.)'
    },
    {
        id: 803,
        category: 'rizik',
        arabic: 'الْبَيِّعَانِ بِالْخِيَارِ مَا لَمْ يَتَفَرَّقَا',
        text: 'Alıcı ve satıcı birbirlerinden ayrılmadıkça muhayyerdirler. Eğer doğru söyler ve kusurları açıklarlarsa alışverişleri bereketli olur.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Hakîm bin Hizâm (r.a.)'
    },
    {
        id: 804,
        category: 'rizik',
        arabic: 'مَنْ لَا يَشْكُرِ الْقَلِيلَ لَا يَشْكُرِ الْكَثِيرَ',
        text: 'Aza şükretmeyen çoğa da şükretmez.',
        source: 'Ahmed',
        narrator: 'Hz. Nu\'man bin Beşîr (r.a.)'
    },
    {
        id: 805,
        category: 'rizik',
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
        text: 'Allah\'ım! Senden hidayet, takva, iffet ve gönül zenginliği isterim.',
        source: 'Müslim',
        narrator: 'Hz. Abdullah bin Mes\'ud (r.a.)'
    },
    {
        id: 806,
        category: 'rizik',
        arabic: 'نِعْمَ الْمَالُ الصَّالِحُ لِلْمَرْءِ الصَّالِحِ',
        text: 'Salih mal, salih kişi için ne güzeldir.',
        source: 'Ahmed',
        narrator: 'Hz. Amr bin Âs (r.a.)'
    },
    {
        id: 807,
        category: 'rizik',
        arabic: 'السَّاعِي عَلَى الْأَرْمَلَةِ وَالْمِسْكِينِ كَالْمُجَاهِدِ فِي سَبِيلِ اللَّهِ',
        text: 'Dul ve yoksullara yardım eden kimse, Allah yolunda cihat eden gibidir.',
        source: 'Buhârî, Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    },
    {
        id: 808,
        category: 'rizik',
        arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
        text: 'Sadaka malı eksiltmez.',
        source: 'Müslim',
        narrator: 'Hz. Ebû Hüreyre (r.a.)'
    }
];

// Günün hadisini getir (günlük değişir)
export const getDailyHadith = () => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % hadiths.length;
    return hadiths[index];
};

// Kategoriye göre hadisleri getir
export const getHadithsByCategory = (categoryId) => {
    return hadiths.filter(h => h.category === categoryId);
};

// Rastgele hadis getir
export const getRandomHadith = () => {
    return hadiths[Math.floor(Math.random() * hadiths.length)];
};
