import { describe, it, expect } from 'vitest';
import { getNotificationPreferences } from './smartNotificationService';

describe('smartNotificationService (Unified)', () => {
  it('should provide default preferences', () => {
    const prefs = getNotificationPreferences();
    expect(prefs).toBeDefined();
    expect(typeof prefs.prayer).toBe('boolean');
  });
});
