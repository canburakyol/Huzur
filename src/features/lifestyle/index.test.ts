import { describe, expect, it } from 'vitest';
import { allFeatures, hasFeature } from '..';
import { lifestyleFeatures } from '.';

describe('lifestyle feature registry', () => {
  it('does not register the unavailable muezzin selector', () => {
    expect(lifestyleFeatures).not.toHaveProperty('muezzinSelector');
    expect(allFeatures).not.toHaveProperty('muezzinSelector');
    expect(hasFeature('muezzinSelector')).toBe(false);
  });
});
