import { test, expect } from '@playwright/test';

const REFERRAL_OWN_CODE_KEY = 'huzur_referral_code';
const REFERRAL_STATE_KEY = 'huzur_referral_state';
const ANALYTICS_EVENTS_KEY = 'analytics_events';

const readStringFromStorage = async (page, key, fallback = null) => {
  return page.evaluate(([k, fb]) => {
    const raw = localStorage.getItem(k);
    return raw ?? fb;
  }, [key, fallback]);
};

const readJsonFromStorage = async (page, key, fallback = null) => {
  return page.evaluate(([k, fb]) => {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) return fb;
      return JSON.parse(raw);
    } catch {
      return fb;
    }
  }, [key, fallback]);
};

const triggerDeepLinkCapture = async (page, url) => {
  return page.evaluate(async (targetUrl) => {
    const { captureInviteAcceptanceFromUrl } = await import('/src/services/referralService.js');
    window.history.replaceState({}, '', targetUrl);
    return captureInviteAcceptanceFromUrl({ source: 'e2e_test' });
  }, url);
};

test.describe('Referral Flow E2E (invite/create/accept/reward)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1200);

    await page.evaluate(() => {
      localStorage.removeItem('huzur_referral_code');
      localStorage.removeItem('huzur_referral_state');
      localStorage.removeItem('analytics_events');
      localStorage.removeItem('growthOnboardingCompleted');
      localStorage.removeItem('growthOnboardingStarted');
      localStorage.removeItem('firstIbadahActionDone');
    });
  });

  test('invite create stores code/state and logs analytics', async ({ page }) => {
    await page.evaluate(async () => {
      const { createInviteLink } = await import('/src/services/referralService.js');
      createInviteLink({ source: 'e2e_test', campaign: 'evergreen', lang: 'tr' });
    });

    const ownCode = await readStringFromStorage(page, REFERRAL_OWN_CODE_KEY, null);
    const state = await readJsonFromStorage(page, REFERRAL_STATE_KEY, null);
    const analyticsEvents = await readJsonFromStorage(page, ANALYTICS_EVENTS_KEY, []);

    expect(typeof ownCode).toBe('string');
    expect(ownCode).toMatch(/^HZR[A-Z0-9]{6}$/);
    expect(state?.ownCode).toBe(ownCode);
    expect(Boolean(state?.inviteCreatedAt)).toBeTruthy();

    const inviteCreatedEvent = analyticsEvents.find((event) => event?.name === 'invite_created');
    expect(inviteCreatedEvent).toBeTruthy();
    expect(inviteCreatedEvent?.params?.source).toBe('e2e_test');
  });

  test('deep link accept + onboarding unlocks invitee reward once', async ({ page }) => {
    const captureResult = await triggerDeepLinkCapture(page, '/invite/HZRFRIEND1?ref=HZRFRIEND1&src=test&cmp=evergreen&lang=tr');

    expect(captureResult?.status).toBe('captured');

    await page.evaluate(async () => {
      const {
        markOnboardingCompletedForReferral,
        markFirstIbadahCompletedForReferral,
        getReferralProgress
      } = await import('/src/services/referralService.js');

      markOnboardingCompletedForReferral();
      markFirstIbadahCompletedForReferral();

      return getReferralProgress();
    });

    const state = await readJsonFromStorage(page, REFERRAL_STATE_KEY, null);
    const analyticsEvents = await readJsonFromStorage(page, ANALYTICS_EVENTS_KEY, []);

    expect(state?.invitedByCode).toBe('HZRFRIEND1');
    expect(Boolean(state?.onboardingCompletedAt)).toBeTruthy();
    expect(Boolean(state?.firstIbadahCompletedAt)).toBeTruthy();
    expect(Boolean(state?.rewards?.inviteeUnlockedAt)).toBeTruthy();

    const inviteAcceptedEvent = analyticsEvents.find((event) => event?.name === 'invite_accepted');
    expect(inviteAcceptedEvent).toBeTruthy();

    const rewardEvents = analyticsEvents.filter((event) => event?.name === 'referral_reward_unlocked');
    expect(rewardEvents.length).toBe(1);
    expect(rewardEvents[0]?.params?.referral_code).toBe('HZRFRIEND1');
  });

  test('anti-abuse blocks repeated referral attempts and logs block events', async ({ page }) => {
    for (let i = 0; i < 7; i += 1) {
      const code = `HZRABUSE${i}`;
      await triggerDeepLinkCapture(page, `/invite/${code}?ref=${code}&src=abuse&cmp=evergreen&lang=tr`);
    }

    const state = await readJsonFromStorage(page, REFERRAL_STATE_KEY, null);
    const analyticsEvents = await readJsonFromStorage(page, ANALYTICS_EVENTS_KEY, []);

    expect(Boolean(state?.antiAbuse?.blockedUntil)).toBeTruthy();

    const blockedEvents = analyticsEvents.filter((event) => event?.name === 'referral_attempt_blocked');
    expect(blockedEvents.length).toBeGreaterThan(0);

    const flaggedEvents = analyticsEvents.filter((event) => event?.name === 'referral_abuse_flagged');
    expect(flaggedEvents.length).toBeGreaterThan(0);
  });
});
