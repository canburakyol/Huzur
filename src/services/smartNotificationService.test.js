import { describe, it, expect } from 'vitest';
import {
  buildWinbackNotifications,
  getNotificationPreferences
} from './smartNotificationService';

describe('smartNotificationService (Unified)', () => {
  it('should provide default preferences', () => {
    const prefs = getNotificationPreferences();
    expect(prefs).toBeDefined();
    expect(typeof prefs.prayer).toBe('boolean');
    expect(prefs.winback).toBe(true);
  });

  it('builds a three-step winback sequence from the current open', () => {
    const notifications = buildWinbackNotifications(new Date('2026-05-03T12:00:00+03:00'), {
      reminder: true,
      winback: true,
      quietHoursEnabled: false
    });

    expect(notifications).toHaveLength(3);
    expect(notifications.map((item) => item.extra.lifecycle_stage)).toEqual([
      'cooling_2_4d',
      'comeback_5_13d',
      'dormant_14d_plus'
    ]);
    expect(notifications[0].extra.campaign).toBe('winback_reactivation_v1');
  });

  it('respects quiet hours for winback scheduling', () => {
    const notifications = buildWinbackNotifications(new Date('2026-05-03T12:00:00+03:00'), {
      reminder: true,
      winback: true,
      quietHoursEnabled: true,
      quietHoursStart: '19:00',
      quietHoursEnd: '21:00'
    });

    expect(notifications).toHaveLength(0);
  });
});
