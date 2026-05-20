import { beforeEach, describe, expect, it } from 'vitest';
import { getStreakData, recordActivity, getStreakDisplay, checkAndUpdateStreak, getWeeklyGoalPreference } from './streakService';

describe('streakService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with zero streak for a new category', () => {
    const data = getStreakData();
    expect(data.streaks.prayer).toBeDefined();
    expect(data.streaks.prayer.count).toBe(0);
  });

  it('tracks multiple categories independently', () => {
    recordActivity('prayer');
    recordActivity('zikir');
    const data = getStreakData();
    expect(data.streaks.prayer.count).toBeGreaterThanOrEqual(1);
    expect(data.streaks.zikir.count).toBeGreaterThanOrEqual(1);
  });

  it('getStreakDisplay returns formatted streak info', () => {
    const display = getStreakDisplay();
    expect(display).toBeDefined();
    expect(display.current).toBeDefined();
    expect(display.emoji).toBeDefined();
  });

  it('checkAndUpdateStreak returns streak data', () => {
    const result = checkAndUpdateStreak();
    expect(result).toBeDefined();
    expect(result.streakData).toBeDefined();
  });

  it('weekly goal preference defaults to 3', () => {
    const pref = getWeeklyGoalPreference();
    expect(pref).toBe(3);
  });
});
