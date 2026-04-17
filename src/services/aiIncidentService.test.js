import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../constants';
import { buildAiIncidentSummary, clearAiIncidents, recordAiIncident } from './aiIncidentService';

describe('aiIncidentService', () => {
  beforeEach(() => {
    const store = {};
    vi.stubGlobal('localStorage', {
      getItem: (key) => (key in store ? store[key] : null),
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
    });
    clearAiIncidents();
  });

  it('stores incidents and summarizes last 24 hours', () => {
    recordAiIncident('assistant', 'callable_failed', new Error('boom'), {
      hasContext: true,
      candidateCount: 0,
    });

    const summary = buildAiIncidentSummary(JSON.parse(localStorage.getItem(STORAGE_KEYS.AI_INCIDENTS)));

    expect(summary.totalCount).toBe(1);
    expect(summary.last24hCount).toBe(1);
    expect(summary.criticalCount).toBe(1);
    expect(summary.latestIncident?.kind).toBe('assistant');
  });
});
