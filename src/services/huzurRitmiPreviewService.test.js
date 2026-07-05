import { describe, expect, it } from 'vitest';
import {
  buildHuzurRitmiAnalyticsPayload,
  getHuzurRitmiPreview,
} from './huzurRitmiPreviewService';

describe('huzurRitmiPreviewService', () => {
  it('builds the prayer rhythm preview', () => {
    const preview = getHuzurRitmiPreview('prayer_rhythm');

    expect(preview.title).toContain('ibadet');
    expect(preview.steps).toHaveLength(3);
    expect(preview.steps.map((step) => step.label)).toEqual([
      'Vakit odagi',
      'Kisa zikir',
      'Hatirlatma',
    ]);
  });

  it('builds the Quran learning preview', () => {
    const preview = getHuzurRitmiPreview('quran_learning');

    expect(preview.title).toContain('Kuran');
    expect(preview.steps.map((step) => step.label)).toEqual([
      'Kisa okuma',
      'Dua',
      'Anlam adimi',
    ]);
  });

  it('builds the family consistency preview', () => {
    const preview = getHuzurRitmiPreview('family_consistency');

    expect(preview.title).toContain('Aile');
    expect(preview.steps.map((step) => step.label)).toEqual([
      'Ortak niyet',
      'Ortak dua',
      'Kucuk hedef',
    ]);
  });

  it('normalizes unknown goals in analytics payloads', () => {
    expect(buildHuzurRitmiAnalyticsPayload('unknown')).toMatchObject({
      source: 'huzur_ritmi_preview',
      primary_goal: 'prayer_rhythm',
      preview_version: 'daily_ibadah_v2',
    });
  });
});
