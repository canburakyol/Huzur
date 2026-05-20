import { differenceInDays, parseISO, isValid } from 'date-fns';

export const TOTAL_PAGES = 604;

type HatimResult = {
  dailyTarget: number;
  daysLeft: number;
  pagesLeft: number;
  isLate: boolean;
};

type SuggestedDate = {
  label: string;
  date: string;
};

export const calculateHatimTarget = (currentPage: number, targetDate: string): HatimResult => {
    if (!targetDate || !isValid(parseISO(targetDate))) {
        return { dailyTarget: 0, daysLeft: 0, pagesLeft: 0, isLate: false };
    }

    const today = new Date();
    const target = parseISO(targetDate);
    
    const daysLeft = Math.max(1, differenceInDays(target, today) + 1);
    
    const pagesLeft = Math.max(0, TOTAL_PAGES - currentPage);
    
    if (pagesLeft === 0) {
        return { dailyTarget: 0, daysLeft, pagesLeft: 0, isLate: false };
    }

    const dailyTarget = Math.ceil(pagesLeft / daysLeft);

    return {
        dailyTarget,
        daysLeft,
        pagesLeft,
        isLate: daysLeft < 1 && pagesLeft > 0
    };
};

export const getSuggestedDates = (): SuggestedDate[] => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    return [
        { label: '1 Ay Sonra', date: nextMonth.toISOString().split('T')[0] },
    ];
};
