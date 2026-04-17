import { describe, expect, it } from 'vitest';
import { buildAiRolloutGate } from './aiRolloutGateService';

describe('aiRolloutGateService', () => {
  it('returns hold when action-level trust issues exist', () => {
    const gate = buildAiRolloutGate({
      healthSummary: {
        actionCount: 1,
        watchCount: 1,
        averageTrust: 0.66,
      },
      flags: {
        assistant_v2_enabled: true,
        weekly_insights_v1_enabled: true,
        home_ranking_v2_enabled: true,
        push_personalization_v1_enabled: true,
        social_ai_hints_v1_enabled: true,
      },
    });

    expect(gate.recommendation).toBe('hold');
    expect(gate.enabledFlagCount).toBe(5);
    expect(gate.actions.length).toBeGreaterThan(0);
  });
});
