export const DEEP_LINK_CONFIG = {
  appScheme: 'huzur://invite',
  webFallbackBase: 'https://huzur.app/invite',
  defaultCampaign: 'evergreen',
  defaultSource: 'app_share'
};

export const buildInviteUrl = ({ code, source = DEEP_LINK_CONFIG.defaultSource, campaign = DEEP_LINK_CONFIG.defaultCampaign, lang = 'tr' }) => {
  const encodedCode = encodeURIComponent(code || '');
  const encodedSource = encodeURIComponent(source);
  const encodedCampaign = encodeURIComponent(campaign);
  const encodedLang = encodeURIComponent(lang);

  return `${DEEP_LINK_CONFIG.webFallbackBase}/${encodedCode}?ref=${encodedCode}&src=${encodedSource}&cmp=${encodedCampaign}&lang=${encodedLang}`;
};

export default {
  DEEP_LINK_CONFIG,
  buildInviteUrl
};
