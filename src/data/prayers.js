// Kategorize edilmiş dualar veritabanı

export const prayerCategories = [
    {
        id: 'daily',
        name: 'prayerBook.categories.daily.name',
        icon: '🌅',
        description: 'prayerBook.categories.daily.desc',
        color: 'linear-gradient(135deg, rgba(147, 197, 253, 0.3), rgba(196, 181, 253, 0.3))'
    },
    {
        id: 'debt',
        name: 'prayerBook.categories.debt.name',
        icon: '💰',
        description: 'prayerBook.categories.debt.desc',
        color: 'linear-gradient(135deg, rgba(134, 239, 172, 0.3), rgba(167, 243, 208, 0.3))'
    },
    {
        id: 'family',
        name: 'prayerBook.categories.family.name',
        icon: '🏠',
        description: 'prayerBook.categories.family.desc',
        color: 'linear-gradient(135deg, rgba(252, 231, 243, 0.3), rgba(251, 207, 232, 0.3))'
    },
    {
        id: 'protection',
        name: 'prayerBook.categories.protection.name',
        icon: '🛡️',
        description: 'prayerBook.categories.protection.desc',
        color: 'linear-gradient(135deg, rgba(254, 215, 170, 0.3), rgba(253, 186, 116, 0.3))'
    },
    {
        id: 'wishes',
        name: 'prayerBook.categories.wishes.name',
        icon: '🤲',
        description: 'prayerBook.categories.wishes.desc',
        color: 'linear-gradient(135deg, rgba(191, 219, 254, 0.3), rgba(186, 230, 253, 0.3))'
    },
    {
        id: 'prophet',
        name: 'prayerBook.categories.prophet.name',
        icon: '☪️',
        description: 'prayerBook.categories.prophet.desc',
        color: 'linear-gradient(135deg, rgba(196, 181, 253, 0.3), rgba(221, 214, 254, 0.3))'
    },
    {
        id: 'special_days',
        name: 'prayerBook.categories.special_days.name',
        icon: '🌙',
        description: 'prayerBook.categories.special_days.desc',
        color: 'linear-gradient(135deg, rgba(254, 240, 138, 0.3), rgba(253, 224, 71, 0.3))'
    },
    {
        id: 'repentance',
        name: 'prayerBook.categories.repentance.name',
        icon: '🕊️',
        description: 'prayerBook.categories.repentance.desc',
        color: 'linear-gradient(135deg, rgba(209, 250, 229, 0.3), rgba(167, 243, 208, 0.3))'
    },
    {
        id: 'prayer_duas',
        name: 'prayerBook.categories.prayer_duas.name',
        icon: '🕌',
        description: 'prayerBook.categories.prayer_duas.desc',
        color: 'linear-gradient(135deg, rgba(254, 202, 202, 0.3), rgba(252, 165, 165, 0.3))'
    },
    {
        id: 'distress',
        name: 'prayerBook.categories.distress.name',
        icon: '💙',
        description: 'prayerBook.categories.distress.desc',
        color: 'linear-gradient(135deg, rgba(224, 231, 255, 0.3), rgba(199, 210, 254, 0.3))'
    }
];

// NOT: Tüm dualar için ID sırası: daily(1-15), debt(16-30), family(31-45), 
// protection(46-60), wishes(61-75), prophet(76-90), special_days(91-105), 
// repentance(106-120), prayer_duas(121-135), distress(136-150)

export const prayers = [
    // GÜNLÜK OKUNACAK DUALAR (1-15)
    { type: 'prayer', id: 1, category: 'daily', title: 'prayerBook.items.1.title', arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ', transliteration: 'Esbahnâ ve esbaha\'l-mülkü lillâhi ve\'l-hamdü lillâh', meaning: 'prayerBook.items.1.meaning' },
    { type: 'prayer', id: 2, category: 'daily', title: 'prayerBook.items.2.title', arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ', transliteration: 'Emseynâ ve emse\'l-mülkü lillâhi ve\'l-hamdü lillâh', meaning: 'prayerBook.items.2.meaning' },
    { type: 'prayer', id: 3, category: 'daily', title: 'prayerBook.items.3.title', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', transliteration: 'Bismike Allâhümme emûtü ve ahyâ', meaning: 'prayerBook.items.3.meaning' },
    { type: 'prayer', id: 4, category: 'daily', title: 'prayerBook.items.4.title', arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ', transliteration: 'Bismillâhi tev', meaning: 'prayerBook.items.4.meaning' },
    { type: 'prayer', id: 5, category: 'daily', title: 'prayerBook.items.5.title', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ', transliteration: 'Allâhümme innî es\'elüke hayre\'l-mevlici ve hayre\'l-mahrec', meaning: 'prayerBook.items.5.meaning' },
    { type: 'prayer', id: 6, category: 'daily', title: 'prayerBook.items.6.title', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', transliteration: 'Allâhü lâ ilâhe illâ hüve\'l-hayyü\'l-kayyûm', meaning: 'prayerBook.items.6.meaning' },
    { type: 'prayer', id: 7, category: 'daily', title: 'prayerBook.items.7.title', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Sübhânallâhi ve bi-hamdihî', meaning: 'prayerBook.items.7.meaning' },
    { type: 'prayer', id: 8, category: 'daily', title: 'prayerBook.items.8.title', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', transliteration: 'Bismillâhillezî lâ yedurru mea\'smihî şey\'ün', meaning: 'prayerBook.items.8.meaning' },
    { type: 'prayer', id: 9, category: 'daily', title: 'prayerBook.items.9.title', arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي', transliteration: 'Allâhümme âfinî fî bedenî', meaning: 'prayerBook.items.9.meaning' },
    { type: 'prayer', id: 10, category: 'daily', title: 'prayerBook.items.10.title', arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', transliteration: 'Estağfirullâhe ve etûbü ileyh', meaning: 'prayerBook.items.10.meaning' },
    { type: 'prayer', id: 11, category: 'daily', title: 'prayerBook.items.11.title', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allâhümme salli alâ Muhammed', meaning: 'prayerBook.items.11.meaning' },
    { type: 'prayer', id: 12, category: 'daily', title: 'prayerBook.items.12.title', arabic: 'رَضِيتُ بِاللَّهِ رَبًّا', transliteration: 'Radîtü billâhi rabben', meaning: 'prayerBook.items.12.meaning' },
    { type: 'prayer', id: 13, category: 'daily', title: 'prayerBook.items.13.title', arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Elhamdü lillâh', meaning: 'prayerBook.items.13.meaning' },
    { type: 'prayer', id: 14, category: 'daily', title: 'prayerBook.items.14.title', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ', transliteration: 'Allâhümme innî es\'elüke\'l-âfiyeh', meaning: 'prayerBook.items.14.meaning' },
    { type: 'prayer', id: 15, category: 'daily', title: 'prayerBook.items.15.title', arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ وَلَكَ الشُّكْرُ', transliteration: 'Allâhümme leke\'l-hamdü ve lekeş-şükr', meaning: 'prayerBook.items.15.meaning' },

    // BORÇLULAR İÇİN DUALAR (16-27)
    { type: 'prayer', id: 16, category: 'debt', title: 'prayerBook.items.16.title', arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ', transliteration: 'Allâhümme-kfinî bi-halâlike an harâmik', meaning: 'prayerBook.items.16.meaning' },
    { type: 'prayer', id: 17, category: 'debt', title: 'prayerBook.items.17.title', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ', transliteration: 'Allâhümme innî a\'ûzu bike mine\'l-hemm', meaning: 'prayerBook.items.17.meaning' },
    { type: 'prayer', id: 18, category: 'debt', title: 'prayerBook.items.18.title', arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا', transliteration: 'Allâhümme bârik lenâ fîmâ razaktanâ', meaning: 'prayerBook.items.18.meaning' },
    { type: 'prayer', id: 19, category: 'debt', title: 'prayerBook.items.19.title', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ رِزْقًا طَيِّبًا', transliteration: 'Allâhümme innî es\'elüke rızkan tayyiben', meaning: 'prayerBook.items.19.meaning' },
    { type: 'prayer', id: 20, category: 'debt', title: 'prayerBook.items.20.title', arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', transliteration: 'Allâhümme-ftah lî ebvâbe rahmetik', meaning: 'prayerBook.items.20.meaning' },
    { type: 'prayer', id: 21, category: 'debt', title: 'prayerBook.items.21.title', arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ', transliteration: 'Rabbi evzi\'nî en eşkure ni\'metek', meaning: 'prayerBook.items.21.meaning' },
    { type: 'prayer', id: 22, category: 'debt', title: 'prayerBook.items.22.title', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْغِنَى', transliteration: 'Allâhümme innî es\'elüke\'l-ğinâ', meaning: 'prayerBook.items.22.meaning' },
    { type: 'prayer', id: 23, category: 'debt', title: 'prayerBook.items.23.title', arabic: 'اللَّهُمَّ ارْزُقْنِي رِزْقًا حَلَالًا', transliteration: 'Allâhümme-rzuknî rızkan halâlen', meaning: 'prayerBook.items.23.meaning' },
    { type: 'prayer', id: 24, category: 'debt', title: 'prayerBook.items.24.title', arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا', transliteration: 'Allâhümme lâ sehle illâ mâ cealtehû sehlen', meaning: 'prayerBook.items.24.meaning' },
    { type: 'prayer', id: 25, category: 'debt', title: 'prayerBook.items.25.title', arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', transliteration: 'Hasbünallâhü ve ni\'me\'l-vekîl', meaning: 'prayerBook.items.25.meaning' },
    { type: 'prayer', id: 26, category: 'debt', title: 'prayerBook.items.26.title', arabic: 'اللَّهُمَّ وَسِّعْ عَلَيَّ فِي رِزْقِي', transliteration: 'Allâhümme vessi\' aleyye fî rızkî', meaning: 'prayerBook.items.26.meaning' },
    { type: 'prayer', id: 27, category: 'debt', title: 'prayerBook.items.27.title', arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', transliteration: 'Ve men yettekıllâhe yec\'al lehû mahracen', meaning: 'prayerBook.items.27.meaning' },

    // AİLE VE EV HUZURU (28-39)
    { type: 'prayer', id: 28, category: 'family', title: 'prayerBook.items.28.title', arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ', transliteration: 'Rabbenâ heb lenâ min ezvâcinâ ve zürriyyâtinâ kurrate a\'yün', meaning: 'prayerBook.items.28.meaning' },
    { type: 'prayer', id: 29, category: 'family', title: 'prayerBook.items.29.title', arabic: 'بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ', transliteration: 'Bârakallâhü leke ve bârake aleyke', meaning: 'prayerBook.items.29.meaning' },
    { type: 'prayer', id: 30, category: 'family', title: 'prayerBook.items.30.title', arabic: 'رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً', transliteration: 'Rabbi heb lî min ledünke zürriyyeten tayyibeten', meaning: 'prayerBook.items.30.meaning' },
    { type: 'prayer', id: 31, category: 'family', title: 'prayerBook.items.31.title', arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', transliteration: 'Rabbi\'rhamhümâ kemâ rabbeyânî sagîrâ', meaning: 'prayerBook.items.31.meaning' },
    { type: 'prayer', id: 32, category: 'family', title: 'prayerBook.items.32.title', arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِي دَارِنَا', transliteration: 'Allâhümme bârik lenâ fî dârinâ', meaning: 'prayerBook.items.32.meaning' },
    { type: 'prayer', id: 33, category: 'family', title: 'prayerBook.items.33.title', arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي', transliteration: 'Rabbi\'c-alnî mukîme\'s-salâti ve min zürriyyetî', meaning: 'prayerBook.items.33.meaning' },
    { type: 'prayer', id: 34, category: 'family', title: 'prayerBook.items.34.title', arabic: 'رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ', transliteration: 'Rabbenasrif annâ azâbe cehennem', meaning: 'prayerBook.items.34.meaning' },
    { type: 'prayer', id: 35, category: 'family', title: 'prayerBook.items.35.title', arabic: 'رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً', transliteration: 'Rabbenâ âtinâ min ledünke rahmeten', meaning: 'prayerBook.items.35.meaning' },
    { type: 'prayer', id: 36, category: 'family', title: 'prayerBook.items.36.title', arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا', transliteration: 'Rabbenâ lâ tüziğ kulûbenâ', meaning: 'prayerBook.items.36.meaning' },
    { type: 'prayer', id: 37, category: 'family', title: 'prayerBook.items.37.title', arabic: 'اللَّهُمَّ أَصْلِحْ بَيْنَنَا وَبَيْنَ جِيرَانِنَا', transliteration: 'Allâhümme eslih beynenâ ve beyne cîrâninâ', meaning: 'prayerBook.items.37.meaning' },
    { type: 'prayer', id: 38, category: 'family', title: 'prayerBook.items.38.title', arabic: 'رَبَّنَا وَاجْعَلْنَا مُسْلِمَيْنِ لَكَ', transliteration: 'Rabbenâ vec-alnâ müslimeyne lek', meaning: 'prayerBook.items.38.meaning' },
    { type: 'prayer', id: 39, category: 'family', title: 'prayerBook.items.39.title', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', transliteration: 'Rabbenâ âtinâ fî\'d-dünyâ haseneten', meaning: 'prayerBook.items.39.meaning' },

    // KORUNMA VE MANEVİ GÜÇLENME (40-51)
    { type: 'prayer', id: 40, category: 'protection', title: 'prayerBook.items.40.title', arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', transliteration: 'E\'ûzü billâhi mine\'ş-şeytâni\'r-racîm', meaning: 'prayerBook.items.40.meaning' },
    { type: 'prayer', id: 41, category: 'protection', title: 'prayerBook.items.41.title', arabic: 'مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'Mâşâallâh, lâ kuvvete illâ billâh', meaning: 'prayerBook.items.41.meaning' },
    { type: 'prayer', id: 42, category: 'protection', title: 'prayerBook.items.42.title', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ', transliteration: 'Lâ ilâhe illallâh Muhammedün Resûlullâh', meaning: 'prayerBook.items.42.meaning' },
    { type: 'prayer', id: 43, category: 'protection', title: 'prayerBook.items.43.title', arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', transliteration: 'E\'ûzü bi-kelimâtillâhi\'t-tâmmâti min şerri mâ halak', meaning: 'prayerBook.items.43.meaning' },
    { type: 'prayer', id: 44, category: 'protection', title: 'prayerBook.items.44.title', arabic: 'بِسْمِ اللَّهِ أَرْقِيكَ', transliteration: 'Bismillâhi erkîke', meaning: 'prayerBook.items.44.meaning' },
    { type: 'prayer', id: 45, category: 'protection', title: 'prayerBook.items.45.title', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', transliteration: 'Kul e\'ûzü bi-rabbi\'n-nâs', meaning: 'prayerBook.items.45.meaning' },
    { type: 'prayer', id: 46, category: 'protection', title: 'prayerBook.items.46.title', arabic: 'أَصْبَحْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ', transliteration: 'Esbahnâ alâ fıtratil-islâm', meaning: 'prayerBook.items.46.meaning' },
    { type: 'prayer', id: 47, category: 'protection', title: 'prayerBook.items.47.title', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', transliteration: 'Kul e\'ûzü bi-rabbi\'l-felak', meaning: 'prayerBook.items.47.meaning' },
    { type: 'prayer', id: 48, category: 'protection', title: 'prayerBook.items.48.title', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ', transliteration: 'Allâhümme innî e\'ûzü bike min zevâli ni\'metik', meaning: 'prayerBook.items.48.meaning' },
    { type: 'prayer', id: 49, category: 'protection', title: 'prayerBook.items.49.title', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'Lâ havle ve lâ kuvvete illâ billâh', meaning: 'prayerBook.items.49.meaning' },
    { type: 'prayer', id: 50, category: 'protection', title: 'prayerBook.items.50.title', arabic: 'اللَّهُمَّ يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَىٰ دِينِكَ', transliteration: 'Allâhümme yâ mukallibe\'l-kulûbi sebbit kalbî alâ dînik', meaning: 'prayerBook.items.50.meaning' },
    { type: 'prayer', id: 51, category: 'protection', title: 'prayerBook.items.51.title', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ فِتْنَةِ الدَّجَّالِ', transliteration: 'Allâhümme innî e\'ûzü bike min fitneti\'d-deccâl', meaning: 'prayerBook.items.51.meaning' },

    // İSTEK VE NİYAZ DUALARI (52-63)
    { type: 'prayer', id: 52, category: 'wishes', title: 'prayerBook.items.52.title', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً', transliteration: 'Rabbenâ âtinâ fî\'d-dünyâ haseneten ve fî\'l-âhıreti haseneten', meaning: 'prayerBook.items.52.meaning' },
    { type: 'prayer', id: 53, category: 'wishes', title: 'prayerBook.items.53.title', arabic: 'رَّبِّ زِدْنِي عِلْمًا', transliteration: 'Rabbi zidnî ilmen', meaning: 'prayerBook.items.53.meaning' },
    { type: 'prayer', id: 54, category: 'wishes', title: 'prayerBook.items.54.title', arabic: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا', transliteration: 'Rabbenağfir lenâ zunûbenâ', meaning: 'prayerBook.items.54.meaning' },
    { type: 'prayer', id: 55, category: 'wishes', title: 'prayerBook.items.55.title', arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', transliteration: 'İhdinâs-sırâta\'l-mustakîm', meaning: 'prayerBook.items.55.meaning' },
    { type: 'prayer', id: 56, category: 'wishes', title: 'prayerBook.items.56.title', arabic: 'رَبِّ ارْحَمْنَا', transliteration: 'Rabbi\'rhamnâ', meaning: 'prayerBook.items.56.meaning' },
    { type: 'prayer', id: 57, category: 'wishes', title: 'prayerBook.items.57.title', arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا', transliteration: 'Rabbenâ efriğ aleynâ sabren', meaning: 'prayerBook.items.57.meaning' },
    { type: 'prayer', id: 58, category: 'wishes', title: 'prayerBook.items.58.title', arabic: 'رَبِّ يَسِّرْ وَلَا تُعَسِّرْ', transliteration: 'Rabbi yessir ve lâ tuassir', meaning: 'prayerBook.items.58.meaning' },
    { type: 'prayer', id: 59, category: 'wishes', title: 'prayerBook.items.59.title', arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا', transliteration: 'Rabbenâ tekabbel minnâ', meaning: 'prayerBook.items.59.meaning' },
    { type: 'prayer', id: 60, category: 'wishes', title: 'prayerBook.items.60.title', arabic: 'وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ', transliteration: 'Ve edhılnî bi-rahmetike fî ibâdike\'s-sâlihîn', meaning: 'prayerBook.items.60.meaning' },
    { type: 'prayer', id: 61, category: 'wishes', title: 'prayerBook.items.61.title', arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ', transliteration: 'Rabbi evzi\'nî en eşkure ni\'metek', meaning: 'prayerBook.items.61.meaning' },
    { type: 'prayer', id: 62, category: 'wishes', title: 'prayerBook.items.62.title', arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ', transliteration: 'Rabbenâ tekabbel minnâ inneke ente\'s-semîu\'l-alîm', meaning: 'prayerBook.items.62.meaning' },
    { type: 'prayer', id: 63, category: 'wishes', title: 'prayerBook.items.63.title', arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', transliteration: 'Allâhümme inneke afüvvün tuhibbü\'l-afve fa\'fü annî', meaning: 'prayerBook.items.63.meaning' },

    // PEYGAMBER EFENDİMİZDEN DUALAR (64-75)
    { type: 'prayer', id: 64, category: 'prophet', title: 'prayerBook.items.64.title', arabic: 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ', transliteration: 'Allâhümme\'hdinî fîmen hedeyte', meaning: 'prayerBook.items.64.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },
    { type: 'prayer', id: 65, category: 'prophet', title: 'prayerBook.items.65.title', arabic: 'اللَّهُمَّ أَنتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنتَ', transliteration: 'Allâhümme ente rabbî lâ ilâhe illâ ente', meaning: 'prayerBook.items.65.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },
    { type: 'prayer', id: 66, category: 'prophet', title: 'prayerBook.items.66.title', arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا', transliteration: 'Sübhâne\'llezî sehhara lenâ hâzâ', meaning: 'prayerBook.items.66.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },
    { type: 'prayer', id: 67, category: 'prophet', title: 'prayerBook.items.67.title', arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا', transliteration: 'Allâhümme bârik lenâ fîmâ razaktanâ', meaning: 'prayerBook.items.67.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },
    { type: 'prayer', id: 68, category: 'prophet', title: 'prayerBook.items.68.title', arabic: 'لَا بَأْسَ طَهُورٌ إِن شَاءَ اللَّهُ', transliteration: 'Lâ be\'se tahûrun inşâallâh', meaning: 'prayerBook.items.68.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },
    { type: 'prayer', id: 69, category: 'prophet', title: 'prayerBook.items.69.title', arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', transliteration: 'E\'ûzü billâhi mine\'ş-şeytâni\'r-racîm', meaning: 'prayerBook.items.69.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },
    { type: 'prayer', id: 70, category: 'prophet', title: 'prayerBook.items.70.title', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ', transliteration: 'Allâhümme innî e\'ûzü bike min azâbi\'l-kabr', meaning: 'prayerBook.items.70.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },
    { type: 'prayer', id: 71, category: 'prophet', title: 'prayerBook.items.71.title', arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', transliteration: 'Allâhümme-ftah lî ebvâbe rahmetik', meaning: 'prayerBook.items.71.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },
    { type: 'prayer', id: 72, category: 'prophet', title: 'prayerBook.items.72.title', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِن فَضْلِكَ', transliteration: 'Allâhümme innî es\'elüke min fadlik', meaning: 'prayerBook.items.72.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },
    { type: 'prayer', id: 73, category: 'prophet', title: 'prayerBook.items.73.title', arabic: 'أَشْهَدُ أَن لَّا إِلَٰهَ إِلَّا اللَّهُ', transliteration: 'Eşhedü en lâ ilâhe illallâh', meaning: 'prayerBook.items.73.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },
    { type: 'prayer', id: 74, category: 'prophet', title: 'prayerBook.items.74.title', arabic: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ', transliteration: 'Allâhümme\'ğfir lehû ve\'rhamhü', meaning: 'prayerBook.items.74.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },
    { type: 'prayer', id: 75, category: 'prophet', title: 'prayerBook.items.75.title', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ', transliteration: 'Allâhümme innî es\'elüke bi-rahmetik', meaning: 'prayerBook.items.75.meaning', prophet: 'Hz. Muhammed (s.a.v.)', source: 'Hadis-i Şerif' },

    // ÖZEL GÜN VE GECE DUALARI (76-87)
    { type: 'prayer', id: 76, category: 'special_days', title: 'prayerBook.items.76.title', arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ', transliteration: 'Allâhümme salli alâ seyyidinâ Muhammed', meaning: 'prayerBook.items.76.meaning' },
    { type: 'prayer', id: 77, category: 'special_days', title: 'prayerBook.items.77.title', arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ', transliteration: 'Sübhânallâhi ve\'l-hamdü lillâh', meaning: 'prayerBook.items.77.meaning' },
    { type: 'prayer', id: 78, category: 'special_days', title: 'prayerBook.items.78.title', arabic: 'اللَّهُمَّ ارْزُقْنَا شَفَاعَةَ نَبِيِّكَ', transliteration: 'Allâhümme-rzuknâ şefâate nebiyyik', meaning: 'prayerBook.items.78.meaning' },
    { type: 'prayer', id: 79, category: 'special_days', title: 'prayerBook.items.79.title', arabic: 'اللَّهُمَّ اغْفِرْ لِي ذُنُوبِي', transliteration: 'Allâhümme\'ğfir lî zunûbî', meaning: 'prayerBook.items.79.meaning' },
    { type: 'prayer', id: 80, category: 'special_days', title: 'prayerBook.items.80.title', arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', transliteration: 'Allâhümme inneke afüvvün tuhibbü\'l-afve fa\'fü annî', meaning: 'prayerBook.items.80.meaning' },
    { type: 'prayer', id: 81, category: 'special_days', title: 'prayerBook.items.81.title', arabic: 'اللَّهُمَّ بَلِّغْنَا رَمَضَانَ', transliteration: 'Allâhümme belliğnâ Ramadân', meaning: 'prayerBook.items.81.meaning' },
    { type: 'prayer', id: 82, category: 'special_days', title: 'prayerBook.items.82.title', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: 'Lâ ilâhe illallâhü vahdehû lâ şerîke leh', meaning: 'prayerBook.items.82.meaning' },
    { type: 'prayer', id: 83, category: 'special_days', title: 'prayerBook.items.83.title', arabic: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَٰهَ إِلَّا اللَّهُ', transliteration: 'Allâhüekber Allâhüekber lâ ilâhe illallâh', meaning: 'prayerBook.items.83.meaning' },
    { type: 'prayer', id: 84, category: 'special_days', title: 'prayerBook.items.84.title', arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ', transliteration: 'Lebbeyk Allâhümme lebbeyk', meaning: 'prayerBook.items.84.meaning' },
    { type: 'prayer', id: 85, category: 'special_days', title: 'prayerBook.items.85.title', arabic: 'اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ', transliteration: 'Allâhümme ehillehû aleynâ bi\'l-yümni ve\'l-îmân', meaning: 'prayerBook.items.85.meaning' },
    { type: 'prayer', id: 86, category: 'special_days', title: 'prayerBook.items.86.title', arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِي شَعْبَانَ', transliteration: 'Allâhümme bârik lenâ fî Şa\'bân', meaning: 'prayerBook.items.86.meaning' },
    { type: 'prayer', id: 87, category: 'special_days', title: 'prayerBook.items.87.title', arabic: 'اللَّهُمَّ اجْعَلْهَا أَيَّامًا مُبَارَكَةً', transliteration: 'Allâhümme-c\'alhâ eyyâmen mübâreketen', meaning: 'prayerBook.items.87.meaning' },

    // TÖVBE - İSTİĞFAR DUALARI (88-99)
    { type: 'prayer', id: 88, category: 'repentance', title: 'prayerBook.items.88.title', arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Estağfirullâh', meaning: 'prayerBook.items.88.meaning' },
    { type: 'prayer', id: 89, category: 'repentance', title: 'prayerBook.items.89.title', arabic: 'أَتُوبُ إِلَى اللَّهِ', transliteration: 'Etûbü ilallâh', meaning: 'prayerBook.items.89.meaning' },
    { type: 'prayer', id: 90, category: 'repentance', title: 'prayerBook.items.90.title', arabic: 'رَبِّ اغْفِرْ لِي وَارْحَمْنِي', transliteration: 'Rabbi\'ğfir lî ve\'rhamnî', meaning: 'prayerBook.items.90.meaning' },
    { type: 'prayer', id: 91, category: 'repentance', title: 'prayerBook.items.91.title', arabic: 'اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي', transliteration: 'Allâhümme innî zalemtü nefsî', meaning: 'prayerBook.items.91.meaning' },
    { type: 'prayer', id: 92, category: 'repentance', title: 'prayerBook.items.92.title', arabic: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا', transliteration: 'Rabbenâ zalemnâ enfüsenâ', meaning: 'prayerBook.items.92.meaning' },
    { type: 'prayer', id: 93, category: 'repentance', title: 'prayerBook.items.93.title', arabic: 'رَبِّ اغْفِرْ وَارْحَمْ وَأَنتَ خَيْرُ الرَّاحِمِينَ', transliteration: 'Rabbi\'ğfir ve\'rham ve ente hayru\'r-râhimîn', meaning: 'prayerBook.items.93.meaning' },
    { type: 'prayer', id: 94, category: 'repentance', title: 'prayerBook.items.94.title', arabic: 'اللَّهُمَّ اغْسِلْنِي مِنْ خَطَايَايَ', transliteration: 'Allâhümme\'ğsilnî min hatâyâye', meaning: 'prayerBook.items.94.meaning' },
    { type: 'prayer', id: 95, category: 'repentance', title: 'prayerBook.items.95.title', arabic: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ', transliteration: 'Estağfirullâhe\'llezî lâ ilâhe illâ hüve', meaning: 'prayerBook.items.95.meaning' },
    { type: 'prayer', id: 96, category: 'repentance', title: 'prayerBook.items.96.title', arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ', transliteration: 'Allâhümme inneke afüvvün kerîm', meaning: 'prayerBook.items.96.meaning' },
    { type: 'prayer', id: 97, category: 'repentance', title: 'prayerBook.items.97.title', arabic: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا', transliteration: 'Rabbenâ lâ tü\'âhıznâ in nesînâ ev ahtanâ', meaning: 'prayerBook.items.97.meaning' },
    { type: 'prayer', id: 98, category: 'repentance', title: 'prayerBook.items.98.title', arabic: 'اللَّهُمَّ طَهِّرْنِي مِنَ الذُّنُوبِ', transliteration: 'Allâhümme tahhirnî mine\'z-zunûb', meaning: 'prayerBook.items.98.meaning' },
    { type: 'prayer', id: 99, category: 'repentance', title: 'prayerBook.items.99.title', arabic: 'تُبْتُ إِلَى اللَّهِ', transliteration: 'Tübtü ilallâh', meaning: 'prayerBook.items.99.meaning' },

    // NAMAZ DUALARI (100-111)
    { type: 'prayer', id: 100, category: 'prayer_duas', title: 'prayerBook.items.100.title', arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allâhüekber', meaning: 'prayerBook.items.100.meaning' },
    { type: 'prayer', id: 101, category: 'prayer_duas', title: 'prayerBook.items.101.title', arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ', transliteration: 'Sübhâneke Allâhümme ve bi-hamdike', meaning: 'prayerBook.items.101.meaning' },
    { type: 'prayer', id: 102, category: 'prayer_duas', title: 'prayerBook.items.102.title', arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', transliteration: 'Elhamdü lillâhi rabbi\'l-âlemîn', meaning: 'prayerBook.items.102.meaning' },
    { type: 'prayer', id: 103, category: 'prayer_duas', title: 'prayerBook.items.103.title', arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ', transliteration: 'Sübhâne rabbiye\'l-azîm', meaning: 'prayerBook.items.103.meaning' },
    { type: 'prayer', id: 104, category: 'prayer_duas', title: 'prayerBook.items.104.title', arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَىٰ', transliteration: 'Sübhâne rabbiye\'l-a\'lâ', meaning: 'prayerBook.items.104.meaning' },
    { type: 'prayer', id: 105, category: 'prayer_duas', title: 'prayerBook.items.105.title', arabic: 'التَّحِيَّاتُ لِلَّهِ', transliteration: 'Ettehıyyâtü lillâh', meaning: 'prayerBook.items.105.meaning' },
    { type: 'prayer', id: 106, category: 'prayer_duas', title: 'prayerBook.items.106.title', arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', transliteration: 'Allâhümme salli alâ Muhammed', meaning: 'prayerBook.items.106.meaning' },
    { type: 'prayer', id: 107, category: 'prayer_duas', title: 'prayerBook.items.107.title', arabic: 'اللَّهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ', transliteration: 'Allâhümme bârik alâ Muhammed', meaning: 'prayerBook.items.107.meaning' },
    { type: 'prayer', id: 108, category: 'prayer_duas', title: 'prayerBook.items.108.title', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', transliteration: 'Rabbenâ âtinâ fî\'d-dünyâ haseneten', meaning: 'prayerBook.items.108.meaning' },
    { type: 'prayer', id: 109, category: 'prayer_duas', title: 'prayerBook.items.109.title', arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', transliteration: 'Esselâmü aleyküm ve rahmetullâh', meaning: 'prayerBook.items.109.meaning' },
    { type: 'prayer', id: 110, category: 'prayer_duas', title: 'prayerBook.items.110.title', arabic: 'اللَّهُمَّ أَنتَ السَّلَامُ', transliteration: 'Allâhümme ente\'s-selâm', meaning: 'prayerBook.items.110.meaning' },
    { type: 'prayer', id: 111, category: 'prayer_duas', title: 'prayerBook.items.111.title', arabic: 'اللَّهُمَّ إِنَّا نَسْتَعِينُكَ', transliteration: 'Allâhümme innâ neste\'înüke', meaning: 'prayerBook.items.111.meaning' },

    // SIKINTI - GAM - KEDER DUALARI (112-123)
    { type: 'prayer', id: 112, category: 'distress', title: 'prayerBook.items.112.title', arabic: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', transliteration: 'Lâ ilâhe illâ ente sübhâneke innî küntü mine\'z-zâlimîn', meaning: 'prayerBook.items.112.meaning' },
    { type: 'prayer', id: 113, category: 'distress', title: 'prayerBook.items.113.title', arabic: 'اللَّهُمَّ إِنِّي عَبْدُكَ', transliteration: 'Allâhümme innî abdüke', meaning: 'prayerBook.items.113.meaning' },
    { type: 'prayer', id: 114, category: 'distress', title: 'prayerBook.items.114.title', arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ', transliteration: 'Hasbiye\'llâhü lâ ilâhe illâ hüve', meaning: 'prayerBook.items.114.meaning' },
    { type: 'prayer', id: 115, category: 'distress', title: 'prayerBook.items.115.title', arabic: 'اللَّهُمَّ رَحْمَتَكَ أَرْجُو', transliteration: 'Allâhümme rahmeteke ercû', meaning: 'prayerBook.items.115.meaning' },
    { type: 'prayer', id: 116, category: 'distress', title: 'prayerBook.items.116.title', arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', transliteration: 'Yâ Hayyu yâ Kayyûm bi-rahmetike estağîs', meaning: 'prayerBook.items.116.meaning' },
    { type: 'prayer', id: 117, category: 'distress', title: 'prayerBook.items.117.title', arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلً', transliteration: 'Allâhümme lâ sehle illâ mâ cealtehû sehlen', meaning: 'prayerBook.items.117.meaning' },
    { type: 'prayer', id: 118, category: 'distress', title: 'prayerBook.items.118.title', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ', transliteration: 'Allâhümme innî e\'ûzü bike mine\'l-hemm', meaning: 'prayerBook.items.118.meaning' },
    { type: 'prayer', id: 119, category: 'distress', title: 'prayerBook.items.119.title', arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', transliteration: 'İnnâ lillâhi ve innâ ileyhi râci\'ûn', meaning: 'prayerBook.items.119.meaning' },
    { type: 'prayer', id: 120, category: 'distress', title: 'prayerBook.items.120.title', arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا', transliteration: 'Rابbenâ efriğ aleynâ sabren', meaning: 'prayerBook.items.120.meaning' },
    { type: 'prayer', id: 121, category: 'distress', title: 'prayerBook.items.121.title', arabic: 'اللَّهُ مَعِيَ اللَّهُ نَاظِرٌ إِلَيَّ', transliteration: 'Allâhü mea\'î Allâhü nâzırun ileyye', meaning: 'prayerBook.items.121.meaning' },
    { type: 'prayer', id: 122, category: 'distress', title: 'prayerBook.items.122.title', arabic: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ', transliteration: 'Ve lâ tey\'esû min ravhıllâh', meaning: 'prayerBook.items.122.meaning' },
    { type: 'prayer', id: 123, category: 'distress', title: 'prayerBook.items.123.title', arabic: 'وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ', transliteration: 'Ve ale\'llâhi fel-yetevekkeli\'l-mü\'minûn', meaning: 'prayerBook.items.123.meaning' },
];

export default prayers;
