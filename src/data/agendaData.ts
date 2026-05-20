import { religiousDays } from './religiousDays';

const HIJRI_MONTHS: string[] = [
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

const GREGORIAN_MONTHS: string[] = [
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

const DAYS: string[] = [
  'calendar.days.sunday',
  'calendar.days.monday',
  'calendar.days.tuesday',
  'calendar.days.wednesday',
  'calendar.days.thursday',
  'calendar.days.friday',
  'calendar.days.saturday'
];

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

export interface CalendarDay {
  day: number;
  date: Date;
  dateStr: string;
  hijri: HijriDate;
  isToday: boolean;
  religiousDay: typeof religiousDays[number] | undefined;
}

export const getHijriDate = (date: Date): HijriDate => {
  const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  const parts = formatter.formatToParts(date);
  const day = parseInt(parts.find(p => p.type === 'day')!.value);
  const month = parseInt(parts.find(p => p.type === 'month')!.value);
  const year = parseInt(parts.find(p => p.type === 'year')!.value);

  return {
    day,
    month,
    year,
    monthName: HIJRI_MONTHS[month - 1]
  };
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
};

export const getMonthDays = (year: number, month: number): (null | CalendarDay)[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  let startOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  const days: (null | CalendarDay)[] = [];

  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const hijri = getHijriDate(date);
    const dateStr = date.toISOString().split('T')[0];

    const religiousDay = religiousDays.find(d => {
      const dDate = new Date(d.date);
      return dDate.getDate() === i &&
        dDate.getMonth() === month &&
        dDate.getFullYear() === year;
    });

    days.push({
      day: i,
      date,
      dateStr,
      hijri,
      isToday: isSameDay(date, new Date()),
      religiousDay
    });
  }

  return days;
};

export const getMonthName = (monthIndex: number): string => GREGORIAN_MONTHS[monthIndex];
export const getDayName = (dayIndex: number): string => DAYS[dayIndex];
