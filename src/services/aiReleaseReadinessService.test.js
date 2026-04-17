import { describe, expect, it } from 'vitest';
import { buildAiReleaseReadiness } from './aiReleaseReadinessService';

describe('aiReleaseReadinessService', () => {
  it('blocks readiness when rollout gate is hold or freshness is stale', () => {
    const readiness = buildAiReleaseReadiness({
      healthSummary: {
        latestAiHealthAt: '2026-03-20T00:00:00.000Z',
        surfaces: [
          { updatedAtIso: '2026-03-20T00:00:00.000Z' },
          { updatedAtIso: '2026-03-20T00:00:00.000Z' },
        ],
      },
      rolloutGate: {
        recommendation: 'hold',
        label: 'Yavaslat',
      },
      incidentSummary: {
        last24hCount: 1,
        criticalCount: 1,
      },
      flags: {
        assistant_v2_enabled: true,
        weekly_insights_v1_enabled: true,
        home_ranking_v2_enabled: true,
        push_personalization_v1_enabled: true,
        social_ai_hints_v1_enabled: true,
      },
      nowMs: Date.parse('2026-03-27T12:00:00.000Z'),
    });

    expect(readiness.status).toBe('blocked');
    expect(readiness.failedChecks).toBeGreaterThan(0);
  });
});
