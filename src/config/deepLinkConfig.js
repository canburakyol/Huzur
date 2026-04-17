export const DEEP_LINK_CONFIG = {
  appScheme: 'huzur://invite',
  androidPackageId: 'com.huzurapp.android',
  webFallbackBase: 'https://play.google.com/store/apps/details?id=com.huzurapp.android',
  defaultCampaign: 'evergreen',
  defaultSource: 'app_share'
};

export const buildInviteUrl = ({ code, source = DEEP_LINK_CONFIG.defaultSource, campaign = DEEP_LINK_CONFIG.defaultCampaign, lang = 'tr' }) => {
  const encodedCode = encodeURIComponent(code || '');
  const encodedSource = encodeURIComponent(source);
  const encodedCampaign = encodeURIComponent(campaign);
  const encodedLang = encodeURIComponent(lang);
  const fallbackUrl = new URL(DEEP_LINK_CONFIG.webFallbackBase);
  const referrerParams = new URLSearchParams({
    ref: code || '',
    src: source,
    cmp: campaign,
    lang
  });

  fallbackUrl.searchParams.set('referrer', referrerParams.toString());

  return `intent://invite/${encodedCode}?ref=${encodedCode}&src=${encodedSource}&cmp=${encodedCampaign}&lang=${encodedLang}` +
    `#Intent;scheme=huzur;package=${DEEP_LINK_CONFIG.androidPackageId};S.browser_fallback_url=${encodeURIComponent(fallbackUrl.toString())};end`;
};

export default {
  DEEP_LINK_CONFIG,
  buildInviteUrl
};
