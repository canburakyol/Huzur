import { describe, expect, it } from 'vitest';

import spiritualInterventions from '../data/spiritualInterventions/index.js';
import {
  buildPushHintFromIntervention,
  buildWeeklyInsightFallback,
  deriveSpiritualUserState,
  getSpiritualIntervention
} from './spiritualInterventionService';

describe('spiritualInterventionService', () => {
  it('ships a reviewed corpus with exactly 100 entries', () => {
    expect(spiritualInterventions).toHaveLength(100);
    expect(spiritualInterventions.every((entry) => entry.reviewStatus === 'reviewed')).toBe(true);
    expect(spiritualInterventions.every((entry) => typeof entry.sourceUrl === 'string' && entry.sourceUrl.length > 0)).toBe(true);
  });

  it('derives low iman state from weak streak activity', () => {
    expect(deriveSpiritualUserState({
      streak: { current: 1 },
      weeklySnapshot: { activeDays: 1 }
    })).toBe('low_iman_streak');
  });

  it('selects a friday intervention when friday context matches', () => {
    const intervention = getSpiritualIntervention({
      context: {
        streak: { current: 6 },
        weeklySnapshot: { activeDays: 5 }
      },
      now: new Date('2026-03-27T09:00:00.000Z')
    });

    expect(intervention).not.toBeNull();
    expect(typeof intervention?.trigger_condition.dayOfWeek).toBe('string');
  });

  it('builds a weekly fallback payload from a matched intervention', () => {
    const fallback = buildWeeklyInsightFallback({
      context: {
        streak: { current: 2 },
        weeklySnapshot: { activeDays: 1 }
      },
      now: new Date('2026-03-28T23:30:00.000Z'),
      weekKey: '2026-03-21_2026-03-27'
    });

    expect(fallback?.provider).toBe('local_spiritual_reviewed');
    expect(fallback?.reviewStatus).toBe('reviewed');
    expect(fallback?.summary).toBeTruthy();
    expect(Array.isArray(fallback?.sources)).toBe(true);
  });

  it('trims push hint text for notification-safe lengths', () => {
    const intervention = getSpiritualIntervention({
      context: {
        streak: { current: 3 },
        weeklySnapshot: { activeDays: 3 }
      },
      now: new Date('2026-03-28T10:00:00.000Z')
    });

    const pushCopy = buildPushHintFromIntervention(intervention);

    expect(pushCopy.title.length).toBeLessThanOrEqual(52);
    expect(pushCopy.body.length).toBeLessThanOrEqual(132);
  });
});
