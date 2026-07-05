import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../constants';
import {
  FIRST_IBADAH_ACTION_COMPLETED_EVENT,
  hasCompletedFirstActivationAction,
  hasCompletedFirstIbadahAction,
  isActivationFeature,
  markFirstActivationAction,
  markFirstIbadahActionCompleted,
} from './activationService';
import {
  logFirstActivationFeatureOpened,
  logFirstPrayerActionCompleted,
} from './analyticsService';
import { markFirstIbadahCompletedForReferral } from './referralService';
import { storageService } from './storageService';

vi.mock('./analyticsService', () => ({
  logFirstActivationFeatureOpened: vi.fn(),
  logFirstPrayerActionCompleted: vi.fn(),
}));

vi.mock('./referralService', () => ({
  markFirstIbadahCompletedForReferral: vi.fn(),
}));

vi.mock('./storageService', () => ({
  storageService: {
    getBoolean: vi.fn(),
    setBoolean: vi.fn(),
    getString: vi.fn(),
  },
}));

describe('activationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageService.getBoolean.mockImplementation(() => false);
    storageService.getString.mockReturnValue('prayer_rhythm');
  });

  it('marks core spiritual feature opens as first activation without granting referral ibadah', () => {
    const result = markFirstActivationAction({
      feature: 'routineBuilder',
      source: 'home_hero',
    });

    expect(result).toMatchObject({
      marked: true,
      source: 'home_hero:routineBuilder',
    });
    expect(storageService.setBoolean).toHaveBeenCalledWith(STORAGE_KEYS.FIRST_ACTIVATION_FEATURE_OPENED, true);
    expect(logFirstActivationFeatureOpened).toHaveBeenCalledWith(
      'routineBuilder',
      'home_hero:routineBuilder',
      expect.objectContaining({
        activation_stage: 'feature_opened',
        primary_goal: 'prayer_rhythm',
      })
    );
    expect(logFirstPrayerActionCompleted).not.toHaveBeenCalled();
    expect(markFirstIbadahCompletedForReferral).not.toHaveBeenCalled();
  });

  it('does not count non-activation surfaces as first activation', () => {
    const result = markFirstActivationAction({
      feature: 'settings',
      source: 'bottom_nav',
    });

    expect(result).toMatchObject({
      marked: false,
      reason: 'non_activation_feature',
    });
    expect(storageService.setBoolean).not.toHaveBeenCalled();
    expect(logFirstActivationFeatureOpened).not.toHaveBeenCalled();
    expect(logFirstPrayerActionCompleted).not.toHaveBeenCalled();
  });

  it('does not duplicate first activation after it is completed', () => {
    storageService.getBoolean.mockReturnValue(true);

    const result = markFirstActivationAction({
      feature: 'quran',
      source: 'home_feature_grid',
    });

    expect(result).toMatchObject({
      marked: false,
      reason: 'already_completed',
    });
    expect(storageService.setBoolean).not.toHaveBeenCalled();
    expect(logFirstActivationFeatureOpened).not.toHaveBeenCalled();
    expect(logFirstPrayerActionCompleted).not.toHaveBeenCalled();
  });

  it('exposes activation state and feature classification', () => {
    storageService.getBoolean.mockReturnValue(true);

    expect(hasCompletedFirstActivationAction()).toBe(true);
    expect(hasCompletedFirstIbadahAction()).toBe(true);
    expect(isActivationFeature('dailyTasks')).toBe(true);
    expect(isActivationFeature('duaTracker')).toBe(true);
    expect(isActivationFeature('settings')).toBe(false);
  });

  it('treats legacy first ibadah completion as first activation completion', () => {
    storageService.getBoolean.mockImplementation((key) => key === STORAGE_KEYS.FIRST_IBADAH_ACTION_DONE);

    expect(hasCompletedFirstActivationAction()).toBe(true);
  });

  it('marks a real spiritual action as first ibadah and syncs referral once', () => {
    const eventListener = vi.fn();
    window.addEventListener(FIRST_IBADAH_ACTION_COMPLETED_EVENT, eventListener);

    const result = markFirstIbadahActionCompleted({
      feature: 'zikirmatik',
      source: 'zikir_increment',
    });

    expect(result).toMatchObject({
      marked: true,
      source: 'zikir_increment:zikirmatik',
    });
    expect(storageService.setBoolean).toHaveBeenCalledWith(STORAGE_KEYS.FIRST_IBADAH_ACTION_DONE, true);
    expect(storageService.setBoolean).toHaveBeenCalledWith(STORAGE_KEYS.FIRST_ACTIVATION_FEATURE_OPENED, true);
    expect(logFirstPrayerActionCompleted).toHaveBeenCalledWith(
      'zikir_increment:zikirmatik',
      expect.objectContaining({
        activation_stage: 'ibadah_completed',
        primary_goal: 'prayer_rhythm',
      })
    );
    expect(markFirstIbadahCompletedForReferral).toHaveBeenCalledTimes(1);
    expect(eventListener).toHaveBeenCalledTimes(1);
    expect(eventListener.mock.calls[0][0].detail).toMatchObject({
      marked: true,
      source: 'zikir_increment:zikirmatik',
    });

    window.removeEventListener(FIRST_IBADAH_ACTION_COMPLETED_EVENT, eventListener);
  });

  it('does not duplicate the first ibadah referral milestone', () => {
    storageService.getBoolean.mockReturnValue(true);

    const result = markFirstIbadahActionCompleted({
      feature: 'dailyTasks',
      source: 'daily_task:namaz',
    });

    expect(result).toMatchObject({
      marked: false,
      reason: 'already_completed',
    });
    expect(storageService.setBoolean).not.toHaveBeenCalled();
    expect(logFirstPrayerActionCompleted).not.toHaveBeenCalled();
    expect(markFirstIbadahCompletedForReferral).not.toHaveBeenCalled();
  });
});
