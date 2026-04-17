import { describe, expect, it } from 'vitest';
import { buildAiReleaseBrief } from './aiReleaseBriefService';

describe('aiReleaseBriefService', () => {
  it('returns no_ship when readiness is blocked', () => {
    const brief = buildAiReleaseBrief({
      healthSummary: {
        averageTrust: 0.58,
        actionCount: 1,
        watchCount: 1,
      },
      rolloutGate: {
        recommendation: 'hold',
      },
      releaseReadiness: {
        status: 'blocked',
        checks: [
          { label: 'Incident baskisi', detail: 'Son 24 saatte 1 AI incident kaydi var', status: 'fail' },
        ],
      },
      incidentSummary: {
        last24hCount: 1,
        latestIncident: {
          kind: 'assistant',
          stage: 'callable_failed',
        },
      },
      opsChecklist: {
        operatorActions: ['Son 24 saatte kritik AI incident var; yeni rollout acmadan once bunu kapat.'],
      },
      flags: {
        assistant_v2_enabled: true,
        home_ranking_v2_enabled: true,
        weekly_insights_v1_enabled: true,
        push_personalization_v1_enabled: true,
        social_ai_hints_v1_enabled: true,
      },
    });

    expect(brief.key).toBe('no_ship');
    expect(brief.risks.length).toBeGreaterThan(0);
    expect(brief.nextSteps.length).toBe(3);
  });
});
