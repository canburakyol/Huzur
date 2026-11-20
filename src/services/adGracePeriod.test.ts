import { describe, expect, it } from 'vitest';
import { AD_GRACE_PERIOD_MS, isInAdGracePeriod } from './adGracePeriod';

describe('isInAdGracePeriod', () => {
  const install = Date.UTC(2026, 10, 1);

  it('hides ads right after install and shows them once the period ends', () => {
    expect(isInAdGracePeriod(install, install + 60_000)).toBe(true);
    expect(isInAdGracePeriod(install, install + AD_GRACE_PERIOD_MS - 1)).toBe(true);
    expect(isInAdGracePeriod(install, install + AD_GRACE_PERIOD_MS)).toBe(false);
  });

  it('does not block ads when the install date is missing or invalid', () => {
    expect(isInAdGracePeriod(0, install)).toBe(false);
    expect(isInAdGracePeriod(Number.NaN, install)).toBe(false);
  });
});
