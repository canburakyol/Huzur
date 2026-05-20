const HIJRI_MONTHS = [
    'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
    'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
    'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
];

const HIJRI_DAYS = [
    'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

type HijriDate = {
    day: number;
    month: number;
    year: number;
    monthName: string;
    dayName: string;
    formatted: string;
    shortFormatted: string;
};

type BlessedDay = {
    month: number;
    day: number;
    name: string;
    type: string;
};

type FastingDay = {
    nameKey: string;
    type: string;
    descKey: string;
    nameParams?: { day: number };
};

export const gregorianToHijri = (date = new Date()): HijriDate => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    let jd: number;
    if (month > 1) {
        jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 2)) + day - 1524.5;
    } else {
        const adjustedYear = year - 1;
        const adjustedMonth = month + 13;
        jd = Math.floor(365.25 * (adjustedYear + 4716)) + Math.floor(30.6001 * adjustedMonth) + day - 1524.5;
    }

    const a = Math.floor((year - 100) / 100);
    const b = 2 - a + Math.floor(a / 4);
    jd = jd + b + 0.5;

    const l = Math.floor(jd - 1948439.5) + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const hijriMonth = Math.floor((24 * l3) / 709);
    const hijriDay = l3 - Math.floor((709 * hijriMonth) / 24);
    const hijriYear = 30 * n + j - 30;

    return {
        day: hijriDay,
        month: hijriMonth,
        year: hijriYear,
        monthName: HIJRI_MONTHS[hijriMonth - 1] || HIJRI_MONTHS[0],
        dayName: HIJRI_DAYS[date.getDay()],
        formatted: `${hijriDay} ${HIJRI_MONTHS[hijriMonth - 1] || ''} ${hijriYear}`,
        shortFormatted: `${hijriDay}/${hijriMonth}/${hijriYear}`
    };
};

export const getHijriToday = (): HijriDate => {
    return gregorianToHijri(new Date());
};

export const checkBlessedDay = (hijriDate: HijriDate): BlessedDay | null => {
    const { day, month } = hijriDate;

    const blessedDays: BlessedDay[] = [
        { month: 9, day: 1, name: 'Ramazan Başlangıcı', type: 'ramazan' },
        { month: 9, day: 27, name: 'Kadir Gecesi', type: 'kandil' },
        { month: 10, day: 1, name: 'Ramazan Bayramı', type: 'bayram' },
        { month: 12, day: 9, name: 'Arefe Günü', type: 'arefe' },
        { month: 12, day: 10, name: 'Kurban Bayramı', type: 'bayram' },
        { month: 1, day: 1, name: 'Hicri Yılbaşı', type: 'ozel' },
        { month: 1, day: 10, name: 'Aşure Günü', type: 'ozel' },
        { month: 7, day: 27, name: 'Miraç Kandili', type: 'kandil' },
        { month: 8, day: 15, name: 'Berat Kandili', type: 'kandil' },
        { month: 3, day: 12, name: 'Mevlid Kandili', type: 'kandil' },
    ];

    return blessedDays.find(blessed => blessed.month === month && blessed.day === day) || null;
};

export const checkFastingDay = (gregorianDate: Date, hijriDate: HijriDate): FastingDay[] | null => {
    const dayOfWeek = gregorianDate.getDay();
    const { day, month } = hijriDate;

    const fastingDays: FastingDay[] = [];

    if (dayOfWeek === 1) {
        fastingDays.push({ nameKey: 'fasting.days.monday.name', type: 'sunnah', descKey: 'fasting.days.monday.desc' });
    }
    if (dayOfWeek === 4) {
        fastingDays.push({ nameKey: 'fasting.days.thursday.name', type: 'sunnah', descKey: 'fasting.days.thursday.desc' });
    }

    if (day >= 13 && day <= 15) {
        fastingDays.push({ nameKey: 'fasting.days.whiteDays.name', nameParams: { day }, type: 'sunnah', descKey: 'fasting.days.whiteDays.desc' });
    }

    if (month === 1 && (day === 9 || day === 10)) {
        fastingDays.push({ nameKey: 'fasting.days.ashura.name', type: 'sunnah', descKey: 'fasting.days.ashura.desc' });
    }

    if (month === 12 && day === 9) {
        fastingDays.push({ nameKey: 'fasting.days.arafah.name', type: 'sunnah', descKey: 'fasting.days.arafah.desc' });
    }

    if (month === 10 && day >= 2 && day <= 7) {
        fastingDays.push({ nameKey: 'fasting.days.shawwal.name', type: 'sunnah', descKey: 'fasting.days.shawwal.desc' });
    }

    if (month === 9) {
        fastingDays.push({ nameKey: 'fasting.days.ramadan.name', type: 'farz', descKey: 'fasting.days.ramadan.desc' });
    }

    return fastingDays.length > 0 ? fastingDays : null;
};

export { HIJRI_MONTHS, HIJRI_DAYS };
