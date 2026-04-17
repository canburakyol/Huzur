import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { __test } = require('../../functions/index.js');

const {
  buildAiReleaseStatusFromMetrics,
  buildHomeRankingFallback,
  normalizeHomeRankingResponse,
  buildPushHintFallback,
  normalizePushHintResponse,
} = __test;

describe('AI observability rollup helpers', () => {
  it('marks release status critical when fallback and incident pressure spike', () => {
    const result = buildAiReleaseStatusFromMetrics({
      dailyMetrics: {
        requestCount: 10,
        fallbackCount: 5,
        lowTrustCount: 3,
        criticalIncidentCount: 1,
        providerBreakdown: {
          openai: 4,
          fallback: 6,
        },
        surfaceBreakdown: {
          assistant: 4,
          home_ranking: 2,
        },
        riskSurfaceBreakdown: {
          assistant: 3,
        },
      },
      rollingState: {
        lastSeenAtBySurface: {
          assistant: { toMillis: () => Date.parse('2026-03-27T09:00:00.000Z') },
          home_ranking: { toMillis: () => Date.parse('2026-03-27T09:00:00.000Z') },
          weekly_insight: { toMillis: () => Date.parse('2026-03-27T09:00:00.000Z') },
          push_hint: { toMillis: () => Date.parse('2026-03-27T09:00:00.000Z') },
        },
        lastWeeklyCronSuccessAt: { toMillis: () => Date.parse('2026-03-25T09:00:00.000Z') },
      },
      now: new Date('2026-03-27T12:00:00.000Z'),
    });

    expect(result.status).toBe('critical');
    expect(result.topProvider).toBe('fallback');
    expect(result.topRiskSurface).toBe('assistant');
  });

  it('keeps trust metadata on home ranking fallback normalization', () => {
    const context = {
      dailyContent: {
        verseReference: 'Bakara 2:286',
      },
      weeklySnapshot: {
        activeDays: 4,
      },
      streak: {
        current: 3,
      },
    };
    const candidates = [
      { id: 'dailyQuests', title: 'Gunluk gorevler' },
      { id: 'dailyContent', title: 'Gunluk icerik' },
    ];

    const fallback = buildHomeRankingFallback(context, candidates);
    const normalized = normalizeHomeRankingResponse({}, fallback, candidates);

    expect(normalized.reviewStatus).toBe('reviewed');
    expect(normalized.sourceCount).toBeGreaterThan(0);
    expect(normalized.trustScore).toBeGreaterThan(0.6);
  });

  it('keeps trust metadata on push hint fallback normalization', () => {
    const fallback = buildPushHintFallback('reminder', {
      dailyContent: {
        verseReference: 'Bakara 2:286',
      },
      weeklySnapshot: {
        activeDays: 2,
      },
      streak: {
        current: 0,
      },
    });
    const normalized = normalizePushHintResponse({}, fallback);

    expect(normalized.reviewStatus).toBeDefined();
    expect(normalized.sourceCount).toBeGreaterThan(0);
    expect(normalized.trustScore).toBeGreaterThan(0.4);
  });
});
