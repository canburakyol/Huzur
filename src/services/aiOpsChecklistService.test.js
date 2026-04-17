import { describe, expect, it } from 'vitest';
import { buildAiOpsChecklist } from './aiOpsChecklistService';

describe('aiOpsChecklistService', () => {
  it('builds intervene checklist when trust or readiness is blocked', () => {
    const checklist = buildAiOpsChecklist({
      healthSummary: {
        surfaces: [
          { key: 'latestAssistantSnapshot', label: 'Huzur Rehberi', status: 'action' },
          { key: 'latestHomeRankingSnapshot', label: 'Ana ekran sirasi', status: 'watch' },
        ],
      },
      rolloutGate: {
        recommendation: 'hold',
      },
      releaseReadiness: {
        status: 'blocked',
        checks: [
          { key: 'freshness', status: 'fail' },
        ],
      },
      incidentSummary: {
        last24hCount: 1,
        criticalCount: 1,
      },
      flags: {
        assistant_v2_enabled: true,
        home_ranking_v2_enabled: true,
        weekly_insights_v1_enabled: true,
        push_personalization_v1_enabled: true,
        social_ai_hints_v1_enabled: true,
      },
    });

    expect(checklist.stage).toBe('intervene');
    expect(checklist.operatorActions.length).toBeGreaterThan(0);
    expect(checklist.smokeChecks.some((item) => item.key === 'assistant_smoke')).toBe(true);
  });
});
