export type DeepLinkConfig = {
  appScheme: string;
  androidPackageId: string;
  webFallbackBase: string;
  defaultCampaign: string;
  defaultSource: string;
}

export type BuildInviteUrlOptions = {
  code: string;
  source?: string;
  campaign?: string;
  lang?: string;
}

export const buildPlayStoreReferralUrl = ({
  code,
  source = DEEP_LINK_CONFIG.defaultSource,
  campaign = DEEP_LINK_CONFIG.defaultCampaign,
  lang = 'tr'
}: BuildInviteUrlOptions): string => {
  const playStoreUrl = new URL(DEEP_LINK_CONFIG.webFallbackBase);
  const referrerParams = new URLSearchParams({
    ref: code || '',
    src: source,
    cmp: campaign,
    lang
  });

  playStoreUrl.searchParams.set('referrer', referrerParams.toString());
  return playStoreUrl.toString();
};

export const DEEP_LINK_CONFIG: DeepLinkConfig = {
  appScheme: 'huzur://invite',
  androidPackageId: 'com.huzurapp.android',
  webFallbackBase: 'https://play.google.com/store/apps/details?id=com.huzurapp.android',
  defaultCampaign: 'evergreen',
  defaultSource: 'app_share'
};

export const buildInviteUrl = ({
  code,
  source = DEEP_LINK_CONFIG.defaultSource,
  campaign = DEEP_LINK_CONFIG.defaultCampaign,
  lang = 'tr'
}: BuildInviteUrlOptions): string => {
  const encodedCode = encodeURIComponent(code || '');
  const encodedSource = encodeURIComponent(source);
  const encodedCampaign = encodeURIComponent(campaign);
  const encodedLang = encodeURIComponent(lang);
  const fallbackUrl = buildPlayStoreReferralUrl({ code, source, campaign, lang });

  return `intent://invite/${encodedCode}?ref=${encodedCode}&src=${encodedSource}&cmp=${encodedCampaign}&lang=${encodedLang}` +
    `#Intent;scheme=huzur;package=${DEEP_LINK_CONFIG.androidPackageId};S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;
};

export default {
  DEEP_LINK_CONFIG,
  buildInviteUrl,
  buildPlayStoreReferralUrl
};
