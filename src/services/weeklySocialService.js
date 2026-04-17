import {
  buildWeeklyEngagementSnapshot,
  getCurrentWeekKey,
  getWeekStartDate,
  isDateInCurrentWeek
} from './engagementSummaryService';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getBandMeta = (score) => {
  if (score >= 85) {
    return {
      key: 'guclu_ritim',
      label: 'Guclu ritim',
      accent: '#10b981',
      description: 'Bu hafta ritmini saglam sekilde korudun.'
    };
  }

  if (score >= 65) {
    return {
      key: 'istikrarli',
      label: 'Istikrarli',
      accent: '#0ea5e9',
      description: 'Duzenin yerine oturuyor, ayni sakin tempoyla devam et.'
    };
  }

  if (score >= 40) {
    return {
      key: 'duzen_kuruluyor',
      label: 'Duzen kuruluyor',
      accent: '#d97706',
      description: 'Kucuk ama duzenli adimlar ritmini guclendiriyor.'
    };
  }

  return {
    key: 'baslangic',
    label: 'Baslangic',
    accent: '#6b7280',
    description: 'Bu hafta tek bir adim bile yeni bir duzen kurmana yardim eder.'
  };
};

export const calculateConsistencyScore = (snapshot, socialContribution = 0) => {
  const safeSnapshot = snapshot || {};
  const activityScore = (clamp(Number(safeSnapshot.activeDays) || 0, 0, 7) / 7) * 45;
  const ritualVolume = (
    (Number(safeSnapshot.tasksCompleted) || 0) +
    (Number(safeSnapshot.routinesCompleted) || 0) +
    (Number(safeSnapshot.quizzesCompleted) || 0)
  );
  const ritualScore = (clamp(ritualVolume, 0, 14) / 14) * 25;
  const streakStrength = Math.max(
    Number(safeSnapshot.prayerDays) || 0,
    Number(safeSnapshot.quranDays) || 0,
    Number(safeSnapshot.dhikrDays) || 0
  );
  const streakScore = (clamp(streakStrength, 0, 7) / 7) * 20;
  const socialScore = (clamp(Number(socialContribution) || 0, 0, 5) / 5) * 10;

  return Math.round(activityScore + ritualScore + streakScore + socialScore);
};

export const buildWeeklySocialSummary = (anchor = new Date()) => {
  const current = buildWeeklyEngagementSnapshot(7, anchor);
  const previousAnchor = new Date(anchor);
  previousAnchor.setDate(previousAnchor.getDate() - 7);
  const previous = buildWeeklyEngagementSnapshot(7, previousAnchor);

  const ritualCount = (
    (Number(current.tasksCompleted) || 0) +
    (Number(current.routinesCompleted) || 0) +
    (Number(current.quizzesCompleted) || 0)
  );
  const previousRitualCount = (
    (Number(previous.tasksCompleted) || 0) +
    (Number(previous.routinesCompleted) || 0) +
    (Number(previous.quizzesCompleted) || 0)
  );
  const consistencyScore = calculateConsistencyScore(current);
  const band = getBandMeta(consistencyScore);

  return {
    weekKey: getCurrentWeekKey(anchor),
    weekStart: getWeekStartDate(anchor),
    current,
    previous,
    consistencyScore,
    consistencyBand: band,
    ritualCount,
    deltas: {
      activeDays: (Number(current.activeDays) || 0) - (Number(previous.activeDays) || 0),
      xpEarned: (Number(current.xpEarned) || 0) - (Number(previous.xpEarned) || 0),
      ritualCount: ritualCount - previousRitualCount
    }
  };
};

export const buildFamilyWeeklySummary = (family, userSummary = null, anchor = new Date()) => {
  const members = Array.isArray(family?.membersDetails) ? family.membersDetails : [];
  const memberCount = members.length || (Array.isArray(family?.members) ? family.members.length : 0);
  const totalBadgeCount = members.reduce((sum, member) => {
    return sum + (Array.isArray(member?.earnedBadges) ? member.earnedBadges.length : 0);
  }, 0);
  const prayerStrength = members.reduce((sum, member) => sum + (Number(member?.streaks?.fajr_count) || 0), 0);
  const quranStrength = members.reduce((sum, member) => sum + (Number(member?.streaks?.quran_count) || 0), 0);
  const familyStrength = prayerStrength + quranStrength;
  const summary = userSummary || buildWeeklySocialSummary(anchor);
  const contributionValue = (
    (Number(summary?.current?.activeDays) || 0) +
    (Number(summary?.current?.routinesCompleted) || 0) +
    (Number(summary?.current?.quizzesCompleted) || 0)
  );
  const goalTarget = Math.max(7, memberCount * 4);
  const progressPercent = goalTarget > 0 ? Math.round((Math.min(contributionValue, goalTarget) / goalTarget) * 100) : 0;

  return {
    weekKey: getCurrentWeekKey(anchor),
    memberCount,
    totalBadgeCount,
    prayerStrength,
    quranStrength,
    familyStrength,
    recommendedGoal: {
      type: 'active_days',
      title: 'Haftalik aile odagi',
      description: 'Bu hafta ailene duzenli katki icin her gun kucuk bir adim hedefle.',
      targetValue: goalTarget,
      currentValue: contributionValue,
      progressPercent: clamp(progressPercent, 0, 100)
    },
    encouragement: memberCount > 1
      ? 'Ailenin ritmi, senin duzenli katkinla daha gorunur hale geliyor.'
      : 'Ilk duzenli adimlarin aile halkani buyutmek icin guzel bir baslangic olur.'
  };
};

export const buildHatimWeeklySummary = (hatimDetails, anchor = new Date()) => {
  const parts = Object.values(hatimDetails?.parts || {});
  let takenThisWeek = 0;
  let completedThisWeek = 0;
  let myCompletedThisWeek = 0;
  let lastContributionAt = null;

  parts.forEach((part) => {
    if (isDateInCurrentWeek(part?.takenAt, anchor)) {
      takenThisWeek += 1;
      if (!lastContributionAt || new Date(part.takenAt) > new Date(lastContributionAt)) {
        lastContributionAt = part.takenAt;
      }
    }

    if (isDateInCurrentWeek(part?.completedAt, anchor)) {
      completedThisWeek += 1;
      if (!lastContributionAt || new Date(part.completedAt) > new Date(lastContributionAt)) {
        lastContributionAt = part.completedAt;
      }
      if (part?.takenBy?.uid) {
        myCompletedThisWeek += 1;
      }
    }
  });

  const totalParts = Number(hatimDetails?.totalParts) || 30;
  const completedTotal = Number(hatimDetails?.completedParts) || parts.filter((part) => part?.status === 'completed').length;

  return {
    weekKey: getCurrentWeekKey(anchor),
    takenThisWeek,
    completedThisWeek,
    myCompletedThisWeek,
    completedTotal,
    remainingParts: Math.max(0, totalParts - completedTotal),
    progressPercent: totalParts > 0 ? Math.round((completedTotal / totalParts) * 100) : 0,
    lastContributionAt
  };
};
