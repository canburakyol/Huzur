import { describe, expect, it } from 'vitest';
import { buildInviteUrl } from './deepLinkConfig';

describe('deepLinkConfig', () => {
  it('builds an Android intent link with Play Store fallback', () => {
    const inviteUrl = buildInviteUrl({
      code: 'HZR123',
      source: 'home_referral_trigger',
      campaign: 'evergreen',
      lang: 'tr'
    });

    expect(inviteUrl).toContain('intent://invite/HZR123');
    expect(inviteUrl).toContain('scheme=huzur');
    expect(inviteUrl).toContain('package=com.huzurapp.android');
    expect(inviteUrl).toContain('S.browser_fallback_url=');

    const fallbackMatch = inviteUrl.match(/S\.browser_fallback_url=([^;]+);end$/);
    expect(fallbackMatch).not.toBeNull();

    const fallbackUrl = new URL(decodeURIComponent(fallbackMatch[1]));
    expect(fallbackUrl.origin).toBe('https://play.google.com');
    expect(fallbackUrl.pathname).toBe('/store/apps/details');
    expect(fallbackUrl.searchParams.get('id')).toBe('com.huzurapp.android');
    expect(fallbackUrl.searchParams.get('referrer')).toBe('ref=HZR123&src=home_referral_trigger&cmp=evergreen&lang=tr');
  });
});
