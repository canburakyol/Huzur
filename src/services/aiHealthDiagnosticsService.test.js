import { describe, expect, it } from 'vitest';
import { buildAiHealthSummary } from './aiHealthDiagnosticsService';

describe('aiHealthDiagnosticsService', () => {
  it('marks low-trust unreviewed surfaces as action', () => {
    const summary = buildAiHealthSummary({
      latestAssistantSnapshot: {
        provider: 'openai',
        reviewStatus: 'reviewed',
        trustScore: 0.84,
        sourceCount: 2,
      },
      latestHomeRankingSnapshot: {
        provider: 'fallback',
        reviewStatus: 'unreviewed',
        trustScore: 0.48,
        sourceCount: 0,
      },
      latestWeeklyInsightSnapshot: {
        provider: 'openai',
        reviewStatus: 'contextual',
        trustScore: 0.68,
        sourceCount: 1,
      },
      latestPushHintSnapshot: {
        provider: 'gemini',
        reviewStatus: 'reviewed',
        trustScore: 0.77,
        sourceCount: 1,
      },
    });

    expect(summary.overallStatus).toBe('action');
    expect(summary.actionCount).toBe(1);
    expect(summary.watchCount).toBeGreaterThanOrEqual(1);
    expect(summary.surfaces.find((item) => item.key === 'latestHomeRankingSnapshot')?.status).toBe('action');
  });
});
