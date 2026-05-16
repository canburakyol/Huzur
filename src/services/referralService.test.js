import { beforeEach, describe, expect, it } from 'vitest';
import { getOrCreateReferralCode, createInviteLink, getReferralProgress, markOnboardingCompletedForReferral, markFirstIbadahCompletedForReferral, markInviteeConvertedForInviter } from './referralService';

describe('referralService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates or retrieves a referral code', () => {
    const code = getOrCreateReferralCode();
    expect(code).toBeDefined();
    expect(typeof code).toBe('string');
    expect(code.length).toBeGreaterThan(0);
  });

  it('creates an invite link', () => {
    const link = createInviteLink({ source: 'test', campaign: 'evergreen', lang: 'tr' });
    expect(link).toBeDefined();
  });

  it('tracks referral progress', () => {
    const progress = getReferralProgress();
    expect(progress).toBeDefined();
    expect(typeof progress).toBe('object');
  });

  it('marks onboarding completed for referral', () => {
    const result = markOnboardingCompletedForReferral();
    expect(result).toBeDefined();
  });

  it('marks first ibadah completed for referral', () => {
    const result = markFirstIbadahCompletedForReferral();
    expect(result).toBeDefined();
  });

  it('marks invitee converted for inviter', () => {
    const result = markInviteeConvertedForInviter();
    expect(result).toBeDefined();
  });
});
