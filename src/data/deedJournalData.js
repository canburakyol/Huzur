// Amel Defteri Data
// Deed Journal - Daily worship and good deed tracking

// Günlük İbadet Kategorileri
export const DAILY_WORSHIP = [
    {
        id: 'sabah-namazi',
        title: 'deedJournal.categories.worship.fajr',
        icon: '🌅',
        points: 10,
        category: 'namaz'
    },
    {
        id: 'ogle-namazi',
        title: 'deedJournal.categories.worship.dhuhr',
        icon: '☀️',
        points: 10,
        category: 'namaz'
    },
    {
        id: 'ikindi-namazi',
        title: 'deedJournal.categories.worship.asr',
        icon: '🌤️',
        points: 10,
        category: 'namaz'
    },
    {
        id: 'aksam-namazi',
        title: 'deedJournal.categories.worship.maghrib',
        icon: '🌅',
        points: 10,
        category: 'namaz'
    },
    {
        id: 'yatsi-namazi',
        title: 'deedJournal.categories.worship.isha',
        icon: '🌙',
        points: 10,
        category: 'namaz'
    }
];

// Sünnet ve Nafile İbadetler
export const SUNNAH_DEEDS = [
    {
        id: 'teheccud',
        title: 'deedJournal.categories.sunnah.tahajjud.title',
        icon: '🌌',
        description: 'deedJournal.categories.sunnah.tahajjud.desc',
        points: 20,
        category: 'namaz'
    },
    {
        id: 'duha',
        title: 'deedJournal.categories.sunnah.duha.title',
        icon: '🌤️',
        description: 'deedJournal.categories.sunnah.duha.desc',
        points: 15,
        category: 'namaz'
    },
    {
        id: 'evvabin',
        title: 'deedJournal.categories.sunnah.evvabin.title',
        icon: '🌆',
        description: 'deedJournal.categories.sunnah.evvabin.desc',
        points: 10,
        category: 'namaz'
    },
    {
        id: 'quran-oku',
        title: 'deedJournal.categories.sunnah.quran.title',
        icon: '📖',
        description: 'deedJournal.categories.sunnah.quran.desc',
        points: 15,
        category: 'quran'
    },
    {
        id: 'sabah-aksam-zikir',
        title: 'deedJournal.categories.sunnah.dhikr.title',
        icon: '📿',
        description: 'deedJournal.categories.sunnah.dhikr.desc',
        points: 10,
        category: 'zikir'
    },
    {
        id: 'salavat',
        title: 'deedJournal.categories.sunnah.salawat.title',
        icon: '✨',
        description: 'deedJournal.categories.sunnah.salawat.desc',
        points: 5,
        category: 'zikir'
    },
    {
        id: 'istigfar',
        title: 'deedJournal.categories.sunnah.istighfar.title',
        icon: '🤲',
        description: 'deedJournal.categories.sunnah.istighfar.desc',
        points: 5,
        category: 'zikir'
    },
    {
        id: 'sunnet-oruc',
        title: 'deedJournal.categories.sunnah.fasting.title',
        icon: '🌙',
        description: 'deedJournal.categories.sunnah.fasting.desc',
        points: 30,
        category: 'oruc'
    }
];

// İyilik ve Hayır İşleri
export const GOOD_DEEDS = [
    {
        id: 'sadaka',
        title: 'deedJournal.categories.goodDeeds.charity.title',
        icon: '💰',
        description: 'deedJournal.categories.goodDeeds.charity.desc',
        points: 20,
        category: 'hayir'
    },
    {
        id: 'aile-ziyaret',
        title: 'deedJournal.categories.goodDeeds.family.title',
        icon: '👨‍👩‍👧‍👦',
        description: 'deedJournal.categories.goodDeeds.family.desc',
        points: 15,
        category: 'sosyal'
    },
    {
        id: 'hasta-ziyaret',
        title: 'deedJournal.categories.goodDeeds.sick.title',
        icon: '🏥',
        description: 'deedJournal.categories.goodDeeds.sick.desc',
        points: 20,
        category: 'sosyal'
    },
    {
        id: 'selam-ver',
        title: 'deedJournal.categories.goodDeeds.salam.title',
        icon: '👋',
        description: 'deedJournal.categories.goodDeeds.salam.desc',
        points: 5,
        category: 'sosyal'
    },
    {
        id: 'yemek-ikram',
        title: 'deedJournal.categories.goodDeeds.feeding.title',
        icon: '🍽️',
        description: 'deedJournal.categories.goodDeeds.feeding.desc',
        points: 15,
        category: 'hayir'
    },
    {
        id: 'guzel-soz',
        title: 'deedJournal.categories.goodDeeds.kindWord.title',
        icon: '💬',
        description: 'deedJournal.categories.goodDeeds.kindWord.desc',
        points: 5,
        category: 'ahlak'
    },
    {
        id: 'ilim-ogretmek',
        title: 'deedJournal.categories.goodDeeds.teaching.title',
        icon: '📚',
        description: 'deedJournal.categories.goodDeeds.teaching.desc',
        points: 20,
        category: 'ilim'
    },
    {
        id: 'sabir',
        title: 'deedJournal.categories.goodDeeds.patience.title',
        icon: '🧘',
        description: 'deedJournal.categories.goodDeeds.patience.desc',
        points: 10,
        category: 'ahlak'
    }
];

// Kaçınılması Gerekenler (Günah Takibi)
export const THINGS_TO_AVOID = [
    {
        id: 'yalan',
        title: 'deedJournal.categories.avoid.lying.title',
        icon: '🚫',
        description: 'deedJournal.categories.avoid.lying.desc',
        points: -15,
        category: 'gunah'
    },
    {
        id: 'giybet',
        title: 'deedJournal.categories.avoid.backbiting.title',
        icon: '🗣️',
        description: 'deedJournal.categories.avoid.backbiting.desc',
        points: -20,
        category: 'gunah'
    },
    {
        id: 'namaz-kacirdim',
        title: 'deedJournal.categories.avoid.missedPrayer.title',
        icon: '⏰',
        description: 'deedJournal.categories.avoid.missedPrayer.desc',
        points: -25,
        category: 'gunah'
    },
    {
        id: 'haram-baktim',
        title: 'deedJournal.categories.avoid.haramLook.title',
        icon: '👁️',
        description: 'deedJournal.categories.avoid.haramLook.desc',
        points: -15,
        category: 'gunah'
    },
    {
        id: 'ofke',
        title: 'deedJournal.categories.avoid.anger.title',
        icon: '😠',
        description: 'deedJournal.categories.avoid.anger.desc',
        points: -10,
        category: 'gunah'
    },
    {
        id: 'israf',
        title: 'deedJournal.categories.avoid.waste.title',
        icon: '💸',
        description: 'deedJournal.categories.avoid.waste.desc',
        points: -10,
        category: 'gunah'
    }
];

// Günlük Hedefler
export const DAILY_GOALS = [
    {
        id: 'bes-vakit',
        title: 'deedJournal.badges.fullDay.title',
        description: 'deedJournal.badges.fullDay.desc',
        target: 5,
        type: 'namaz',
        reward: 50
    },
    {
        id: 'kuran-sayfa',
        title: 'deedJournal.categories.sunnah.quran.title',
        description: 'deedJournal.categories.sunnah.quran.desc',
        target: 1,
        type: 'quran',
        reward: 15
    },
    {
        id: 'zikir-100',
        title: 'deedJournal.categories.sunnah.dhikr.title',
        description: 'deedJournal.categories.sunnah.dhikr.desc',
        target: 100,
        type: 'zikir',
        reward: 10
    }
];

// Rozetler ve Başarılar
export const ACHIEVEMENTS = [
    {
        id: 'ilk-gun',
        title: 'deedJournal.badges.firstStep.title',
        description: 'deedJournal.badges.firstStep.desc',
        icon: '🌟',
        requirement: 1, // 1 gün
        type: 'streak'
    },
    {
        id: 'hafta-seridi',
        title: 'deedJournal.badges.weekStreak.title',
        description: 'deedJournal.badges.weekStreak.desc',
        icon: '🔥',
        requirement: 7,
        type: 'streak'
    },
    {
        id: 'ay-seridi',
        title: 'deedJournal.badges.monthStreak.title',
        description: 'deedJournal.badges.monthStreak.desc',
        icon: '🏆',
        requirement: 30,
        type: 'streak'
    },
    {
        id: 'yuz-puan',
        title: 'deedJournal.badges.hundredPoints.title',
        description: 'deedJournal.badges.hundredPoints.desc',
        icon: '💯',
        requirement: 100,
        type: 'daily_points'
    },
    {
        id: 'bin-puan',
        title: 'deedJournal.badges.thousandPoints.title',
        description: 'deedJournal.badges.thousandPoints.desc',
        icon: '👑',
        requirement: 1000,
        type: 'total_points'
    },
    {
        id: 'bes-vakit-tamam',
        title: 'deedJournal.badges.fullDay.title',
        description: 'deedJournal.badges.fullDay.desc',
        icon: '🕌',
        requirement: 5,
        type: 'daily_prayers'
    }
];

// Motivasyon Mesajları
export const MOTIVATION_MESSAGES = [
    "deedJournal.motivation.0",
    "deedJournal.motivation.1",
    "deedJournal.motivation.2",
    "deedJournal.motivation.3",
    "deedJournal.motivation.4",
    "deedJournal.motivation.5",
    "deedJournal.motivation.6",
    "deedJournal.motivation.7"
];
