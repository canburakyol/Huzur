// Hicri Takvim Servisi
// Miladi tarihten Hicri tarihe dönüşüm

const HIJRI_MONTHS = [
    'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
    'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
    'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
];

const HIJRI_DAYS = [
    'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

/**
 * Miladi tarihi Hicri tarihe çevirir
 * @param {Date} date - Miladi tarih
 * @returns {Object} - Hicri tarih bilgisi
 */
export const gregorianToHijri = (date = new Date()) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    // Julian Day Number hesaplama
    let jd;
    if (month > 1) {
        jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 2)) + day - 1524.5;
    } else {
        const adjustedYear = year - 1;
        const adjustedMonth = month + 13;
        jd = Math.floor(365.25 * (adjustedYear + 4716)) + Math.floor(30.6001 * adjustedMonth) + day - 1524.5;
    }

    // Gregorian takvim düzeltmesi
    const a = Math.floor((year - 100) / 100);
    const b = 2 - a + Math.floor(a / 4);
    jd = jd + b + 0.5;

    // Hicri takvime çevirme
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

/**
 * Bugünün Hicri tarihini döndürür
 */
export const getHijriToday = () => {
    return gregorianToHijri(new Date());
};

/**
 * Mübarek gün kontrolü
 * @param {Object} hijriDate - Hicri tarih objesi
 * @returns {Object|null} - Mübarek gün bilgisi veya null
 */
export const checkBlessedDay = (hijriDate) => {
    const { day, month } = hijriDate;

    const blessedDays = [
        // Ramazan
        { month: 9, day: 1, name: 'Ramazan Başlangıcı', type: 'ramazan' },
        { month: 9, day: 27, name: 'Kadir Gecesi', type: 'kandil' },

        // Şevval
        { month: 10, day: 1, name: 'Ramazan Bayramı', type: 'bayram' },

        // Zilhicce
        { month: 12, day: 9, name: 'Arefe Günü', type: 'arefe' },
        { month: 12, day: 10, name: 'Kurban Bayramı', type: 'bayram' },

        // Muharrem
        { month: 1, day: 1, name: 'Hicri Yılbaşı', type: 'ozel' },
        { month: 1, day: 10, name: 'Aşure Günü', type: 'ozel' },

        // Recep
        { month: 7, day: 27, name: 'Miraç Kandili', type: 'kandil' },

        // Şaban
        { month: 8, day: 15, name: 'Berat Kandili', type: 'kandil' },

        // Rebiülevvel
        { month: 3, day: 12, name: 'Mevlid Kandili', type: 'kandil' },
    ];

    return blessedDays.find(blessed => blessed.month === month && blessed.day === day) || null;
};

/**
 * Oruç tutulması tavsiye edilen günleri kontrol eder
 * @param {Date} gregorianDate - Miladi tarih
 * @param {Object} hijriDate - Hicri tarih
 * @returns {Object|null} - Oruç bilgisi
 */
export const checkFastingDay = (gregorianDate, hijriDate) => {
    const dayOfWeek = gregorianDate.getDay();
    const { day, month } = hijriDate;

    const fastingDays = [];

    // Pazartesi-Perşembe orucu
    if (dayOfWeek === 1) {
        fastingDays.push({ nameKey: 'fasting.days.monday.name', type: 'sunnah', descKey: 'fasting.days.monday.desc' });
    }
    if (dayOfWeek === 4) {
        fastingDays.push({ nameKey: 'fasting.days.thursday.name', type: 'sunnah', descKey: 'fasting.days.thursday.desc' });
    }

    // Eyyam-ı Bid (Ayın 13-14-15)
    if (day >= 13 && day <= 15) {
        fastingDays.push({ nameKey: 'fasting.days.whiteDays.name', nameParams: { day }, type: 'sunnah', descKey: 'fasting.days.whiteDays.desc' });
    }

    // Aşure orucu
    if (month === 1 && (day === 9 || day === 10)) {
        fastingDays.push({ nameKey: 'fasting.days.ashura.name', type: 'sunnah', descKey: 'fasting.days.ashura.desc' });
    }

    // Arefe orucu
    if (month === 12 && day === 9) {
        fastingDays.push({ nameKey: 'fasting.days.arafah.name', type: 'sunnah', descKey: 'fasting.days.arafah.desc' });
    }

    // Şevval oruçları
    if (month === 10 && day >= 2 && day <= 7) {
        fastingDays.push({ nameKey: 'fasting.days.shawwal.name', type: 'sunnah', descKey: 'fasting.days.shawwal.desc' });
    }

    // Ramazan
    if (month === 9) {
        fastingDays.push({ nameKey: 'fasting.days.ramadan.name', type: 'farz', descKey: 'fasting.days.ramadan.desc' });
    }

    return fastingDays.length > 0 ? fastingDays : null;
};

export { HIJRI_MONTHS, HIJRI_DAYS };
