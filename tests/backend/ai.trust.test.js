import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { __test } = require('../../functions/index.js');

const {
  buildAssistantFallbackResponseV2,
  buildAssistantSafetyResponse,
  buildAiHealthSnapshot,
  normalizeAssistantResponse,
  normalizeWeeklyInsightResponse,
} = __test;

describe('AI trust stack helpers', () => {
  it('assistant fallback normalizes reviewed context sources into trust metadata', () => {
    const context = {
      dailyContent: {
        verseReference: 'Bakara 2:286',
      },
      streak: {
        current: 2,
      },
      prayer: {
        nextPrayerLabel: 'Yatsi',
      },
      primaryGoal: 'prayer_rhythm',
      weeklySnapshot: {
        activeDays: 3,
      },
    };

    const fallback = buildAssistantFallbackResponseV2('Bugun ne yapayim?', context);
    const normalized = normalizeAssistantResponse({}, fallback);

    expect(normalized.confidence).toBe('medium');
    expect(normalized.reviewStatus).toBe('reviewed');
    expect(normalized.sourceCount).toBe(1);
    expect(normalized.trustScore).toBeGreaterThan(0.6);
    expect(normalized.sources[0]).toMatchObject({
      label: 'Bakara 2:286',
      type: 'daily_content',
      reviewStatus: 'reviewed',
    });
  });

  it('safety response stays low-confidence and policy-guided', () => {
    const response = buildAssistantSafetyResponse('medical_legal_redirect', {
      prayer: { nextPrayerLabel: 'Ikindi' },
      weeklySnapshot: { activeDays: 1 },
      streak: { current: 0 },
    });
    const normalized = normalizeAssistantResponse(response, response);

    expect(normalized.provider).toBe('safety_policy');
    expect(normalized.confidence).toBe('low');
    expect(normalized.reviewStatus).toBe('general_guidance');
    expect(normalized.trustScore).toBeLessThanOrEqual(0.52);
    expect(normalized.sources.length).toBeGreaterThan(0);
  });

  it('weekly insight normalization carries fallback trust metadata forward', () => {
    const fallback = {
      provider: 'fallback',
      weekKey: '2026-03-23',
      title: 'Haftalik Huzur Ozeti',
      summary: 'Bu hafta tek bir adimla ritmini tazeleyebilirsin.',
      riskBand: 'at_risk',
      priority: 'recover',
      confidence: 'medium',
      reviewStatus: 'reviewed',
      sourceCount: 1,
      trustScore: 0.72,
      sources: [
        {
          sourceId: 'verse:Bakara 2:286',
          label: 'Bakara 2:286',
          type: 'daily_content',
          reviewStatus: 'reviewed',
          confidence: 'medium',
          origin: 'daily_content',
        },
      ],
    };

    const normalized = normalizeWeeklyInsightResponse({}, fallback, '2026-03-23');

    expect(normalized.confidence).toBe('medium');
    expect(normalized.reviewStatus).toBe('reviewed');
    expect(normalized.sourceCount).toBe(1);
    expect(normalized.trustScore).toBe(0.72);
    expect(normalized.sources[0].label).toBe('Bakara 2:286');
  });

  it('ai health snapshot keeps trust and source summary in a stable shape', () => {
    const snapshot = buildAiHealthSnapshot('assistant', {
      provider: 'openai',
      confidence: 'medium',
      reviewStatus: 'reviewed',
      trustScore: 0.81,
      sourceCount: 2,
      safetyCategory: 'none',
      sources: [
        {
          sourceId: 'verse:Bakara 2:286',
          label: 'Bakara 2:286',
          type: 'daily_content',
          reviewStatus: 'reviewed',
          confidence: 'high',
          origin: 'daily_content',
        },
      ],
    }, {
      riskBand: 'recovering',
    });

    expect(snapshot).toMatchObject({
      kind: 'assistant',
      provider: 'openai',
      confidence: 'medium',
      reviewStatus: 'reviewed',
      trustScore: 0.81,
      sourceCount: 2,
      riskBand: 'recovering',
    });
    expect(snapshot.sources[0].label).toBe('Bakara 2:286');
    expect(typeof snapshot.updatedAtIso).toBe('string');
  });
});
