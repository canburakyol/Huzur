import { differenceInDays, parseISO, isValid } from 'date-fns';

export const TOTAL_PAGES = 604;

/**
 * Calculate daily reading target
 * @param {number} currentPage - The last page read (1-604)
 * @param {string} targetDate - Target completion date (YYYY-MM-DD)
 * @returns {object} { dailyTarget, daysLeft, pagesLeft, isLate }
 */
export const calculateHatimTarget = (currentPage, targetDate) => {
    if (!targetDate || !isValid(parseISO(targetDate))) {
        return { dailyTarget: 0, daysLeft: 0, pagesLeft: 0, isLate: false };
    }

    const today = new Date();
    const target = parseISO(targetDate);
    
    // Calculate days left (including today)
    const daysLeft = Math.max(1, differenceInDays(target, today) + 1);
    
    const pagesLeft = Math.max(0, TOTAL_PAGES - currentPage);
    
    if (pagesLeft === 0) {
        return { dailyTarget: 0, daysLeft, pagesLeft: 0, isLate: false };
    }

    // Calculate daily target rounded up
    const dailyTarget = Math.ceil(pagesLeft / daysLeft);

    return {
        dailyTarget,
        daysLeft,
        pagesLeft,
        isLate: daysLeft < 1 && pagesLeft > 0
    };
};

/**
 * Suggest target dates based on Islamic events
 * @param {object} religiousDays - List of religious days
 * @returns {array} Suggested dates
 */
export const getSuggestedDates = () => {
    // This would ideally filter upcoming religious days
    // For now, returning generic suggestions relative to today
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    return [
        { label: '1 Ay Sonra', date: nextMonth.toISOString().split('T')[0] },
        // Add more dynamic dates here if needed
    ];
};
