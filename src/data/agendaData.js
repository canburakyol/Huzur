import { religiousDays } from './religiousDays';

// Hicri Ay İsimleri (Translation Keys)
const HIJRI_MONTHS = [
    'calendar.hijriMonths.muharram',
    'calendar.hijriMonths.safar',
    'calendar.hijriMonths.rabi1',
    'calendar.hijriMonths.rabi2',
    'calendar.hijriMonths.jumada1',
    'calendar.hijriMonths.jumada2',
    'calendar.hijriMonths.rajab',
    'calendar.hijriMonths.shaban',
    'calendar.hijriMonths.ramadan',
    'calendar.hijriMonths.shawwal',
    'calendar.hijriMonths.dhul_qada',
    'calendar.hijriMonths.dhul_hijja'
];

// Miladi Ay İsimleri (Translation Keys)
const GREGORIAN_MONTHS = [
    'calendar.gregorianMonths.january',
    'calendar.gregorianMonths.february',
    'calendar.gregorianMonths.march',
    'calendar.gregorianMonths.april',
    'calendar.gregorianMonths.may',
    'calendar.gregorianMonths.june',
    'calendar.gregorianMonths.july',
    'calendar.gregorianMonths.august',
    'calendar.gregorianMonths.september',
    'calendar.gregorianMonths.october',
    'calendar.gregorianMonths.november',
    'calendar.gregorianMonths.december'
];

// Gün İsimleri (Translation Keys)
const DAYS = [
    'calendar.days.sunday',
    'calendar.days.monday',
    'calendar.days.tuesday',
    'calendar.days.wednesday',
    'calendar.days.thursday',
    'calendar.days.friday',
    'calendar.days.saturday'
];

// Tarihi Hicri takvime çevir
export const getHijriDate = (date) => {
    const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });

    const parts = formatter.formatToParts(date);
    const day = parseInt(parts.find(p => p.type === 'day').value);
    const month = parseInt(parts.find(p => p.type === 'month').value);
    const year = parseInt(parts.find(p => p.type === 'year').value);

    return {
        day,
        month, // 1-12
        year,
        monthName: HIJRI_MONTHS[month - 1]
    };
};

// Ayın günlerini getir (Miladi takvime göre grid oluşturmak için)
export const getMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 (Pazar) - 6 (Cumartesi)

    // Pazartesi ile başlatmak için (0=Pazar -> 6, 1=Pzt -> 0)
    // Türkiye'de hafta Pazartesi başlar
    let startOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days = [];

    // Önceki aydan boşluklar
    for (let i = 0; i < startOffset; i++) {
        days.push(null);
    }

    // Ayın günleri
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const hijri = getHijriDate(date);
        const dateStr = date.toISOString().split('T')[0];

        // Dini gün kontrolü
        const religiousDay = religiousDays.find(d => {
            const dDate = new Date(d.date);
            return dDate.getDate() === i &&
                dDate.getMonth() === month &&
                dDate.getFullYear() === year;
        });

        days.push({
            day: i,
            date: date,
            dateStr: dateStr,
            hijri: hijri,
            isToday: isSameDay(date, new Date()),
            religiousDay: religiousDay
        });
    }

    return days;
};

// İki tarih aynı gün mü?
const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
};

export const getMonthName = (monthIndex) => GREGORIAN_MONTHS[monthIndex];
export const getDayName = (dayIndex) => DAYS[dayIndex];
