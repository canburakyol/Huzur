import { familyService } from './familyService';
import { storageService } from './storageService';
import { logger } from '../utils/logger';
import { toLocalDateKey } from './engagementSummaryService';

const AUTO_CONTRIBUTION_KEY = 'huzur_family_goal_auto_contributions';

const getContributionMap = () => storageService.getItem(AUTO_CONTRIBUTION_KEY, {});

const markContribution = (key, dateKey) => {
  const history = getContributionMap();
  history[key] = dateKey;
  storageService.setItem(AUTO_CONTRIBUTION_KEY, history);
};

const hasContributionForToday = (key, dateKey) => {
  const history = getContributionMap();
  return history[key] === dateKey;
};

export const contributeFamilyGoalOncePerDay = async (triggerKey, contributionType = 'automatic') => {
  const safeKey = String(triggerKey || '').trim();
  if (!safeKey) return false;

  const todayKey = toLocalDateKey();
  const uniqueKey = `${safeKey}:${todayKey}`;
  if (hasContributionForToday(uniqueKey, todayKey)) {
    return false;
  }

  try {
    const goal = await familyService.contributeWeeklyGoal({
      amount: 1,
      contributionType
    });

    if (!goal) return false;
    markContribution(uniqueKey, todayKey);
    return true;
  } catch (error) {
    logger.warn('[FamilyGoalContribution] Skipped automatic contribution', error?.message || error);
    return false;
  }
};

export default {
  contributeFamilyGoalOncePerDay
};
