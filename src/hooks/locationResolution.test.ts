import { describe, expect, it, vi } from 'vitest';
import { forwardCoordinatesBeforeEnrichment } from './locationResolution';

describe('forwardCoordinatesBeforeEnrichment', () => {
  it('forwards prayer coordinates without waiting for location enrichment', async () => {
    let resolveEnrichment: ((value: { locationName: string }) => void) | undefined;
    const enrich = vi.fn(() => new Promise<{ locationName: string }>((resolve) => {
      resolveEnrichment = resolve;
    }));
    const forward = vi.fn();

    const pending = forwardCoordinatesBeforeEnrichment({ latitude: 41.01, longitude: 28.98 }, forward, enrich);

    expect(forward).toHaveBeenCalledWith({ latitude: 41.01, longitude: 28.98 });
    expect(enrich).toHaveBeenCalledOnce();

    resolveEnrichment?.({ locationName: 'İstanbul' });
    await expect(pending).resolves.toEqual({ locationName: 'İstanbul' });
  });
});
