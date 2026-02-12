import { STORAGE_KEYS } from '../constants';
import { storageService } from './storageService';

const CAMPAIGN_IDS = {
  EVERGREEN: 'evergreen',
  FRIDAY: 'friday',
  RAMADAN: 'ramadan',
  KANDIL: 'kandil'
};

const REGION_IDS = {
  TR: 'TR',
  EU_DIASPORA: 'EU_DIASPORA'
};

const EUROPE_TIMEZONE_PREFIX = 'Europe/';

const isRamadanApprox = (date) => {
  const month = date.getMonth() + 1;
  return month === 2 || month === 3 || month === 4;
};

const isFriday = (date) => date.getDay() === 5;

const isApproxKandilWindow = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return (
    (month === 1 && day >= 10 && day <= 20) ||
    (month === 2 && day >= 20 && day <= 28) ||
    (month === 3 && day >= 1 && day <= 12) ||
    (month === 10 && day >= 10 && day <= 22)
  );
};

export const getCampaignRegion = () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
    if (timezone === 'Europe/Istanbul') return REGION_IDS.TR;
    if (timezone.startsWith(EUROPE_TIMEZONE_PREFIX)) return REGION_IDS.EU_DIASPORA;
    return REGION_IDS.TR;
  } catch {
    return REGION_IDS.TR;
  }
};

const getCampaignByDate = (date = new Date()) => {
  if (isRamadanApprox(date)) return CAMPAIGN_IDS.RAMADAN;
  if (isFriday(date)) return CAMPAIGN_IDS.FRIDAY;
  if (isApproxKandilWindow(date)) return CAMPAIGN_IDS.KANDIL;
  return CAMPAIGN_IDS.EVERGREEN;
};

const readCampaignOverride = () => {
  return storageService.getString(STORAGE_KEYS.CAMPAIGN_OVERRIDE, '');
};

export const setCampaignOverride = (campaignId) => {
  const valid = Object.values(CAMPAIGN_IDS).includes(campaignId) ? campaignId : CAMPAIGN_IDS.EVERGREEN;
  storageService.setString(STORAGE_KEYS.CAMPAIGN_OVERRIDE, valid);
  return valid;
};

export const clearCampaignOverride = () => {
  storageService.removeItem(STORAGE_KEYS.CAMPAIGN_OVERRIDE);
};

export const getActiveCampaign = (date = new Date()) => {
  const override = readCampaignOverride();
  const campaign = Object.values(CAMPAIGN_IDS).includes(override) ? override : getCampaignByDate(date);
  const region = getCampaignRegion();
  const variant = region === REGION_IDS.EU_DIASPORA ? 'diaspora' : 'local';

  return {
    id: campaign,
    region,
    variant,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul',
    date: date.toISOString()
  };
};

export const resolveCampaignCopy = ({
  campaign,
  type = 'reminder',
  fallbackTitle = '',
  fallbackBody = ''
}) => {
  const currentCampaign = campaign || getActiveCampaign();

  const copyMap = {
    [CAMPAIGN_IDS.EVERGREEN]: {
      reminder: {
        title: currentCampaign.variant === 'diaspora' ? '🌍 Vakit Hatırlatması' : '🕌 Vakit Hatırlatması',
        body: currentCampaign.variant === 'diaspora'
          ? 'Bulunduğun ülkede vakit yaklaşıyor. Kısa bir mola verip ibadete yönel.'
          : 'Vakit yaklaşıyor. Kısa bir mola verip ibadete yönel.'
      }
    },
    [CAMPAIGN_IDS.FRIDAY]: {
      reminder: {
        title: '✨ Cuma Bereketi',
        body: currentCampaign.variant === 'diaspora'
          ? 'Cuma gününü bulunduğun şehirde bereketle geçir. Duanı ve zikrini ihmal etme.'
          : 'Cuma gününü bereketle geçir. Duanı ve zikrini ihmal etme.'
      }
    },
    [CAMPAIGN_IDS.RAMADAN]: {
      reminder: {
        title: '🌙 Ramazan Hatırlatması',
        body: currentCampaign.variant === 'diaspora'
          ? 'Ramazan rutinin için bugünkü ibadet hedefini tamamlamayı unutma.'
          : 'Ramazan bereketiyle bugünkü ibadet hedefini tamamlamayı unutma.'
      }
    },
    [CAMPAIGN_IDS.KANDIL]: {
      reminder: {
        title: '🕯️ Kandil Gecesi',
        body: currentCampaign.variant === 'diaspora'
          ? 'Kandil gecesi için kısa bir dua ve zikirle kalbini ferahlat.'
          : 'Kandil gecesinde dua ve zikirle kalbini ferahlat.'
      }
    }
  };

  const campaignCopy = copyMap[currentCampaign.id]?.[type];
  if (!campaignCopy) {
    return {
      title: fallbackTitle,
      body: fallbackBody
    };
  }

  return campaignCopy;
};

export const CAMPAIGNS = CAMPAIGN_IDS;
export const CAMPAIGN_REGIONS = REGION_IDS;

export default {
  CAMPAIGNS,
  CAMPAIGN_REGIONS,
  getCampaignRegion,
  getActiveCampaign,
  resolveCampaignCopy,
  setCampaignOverride,
  clearCampaignOverride
};
