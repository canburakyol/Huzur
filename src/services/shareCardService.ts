import { logShareOpened, logShareSent, analyticsService } from './analyticsService';
import { getExperimentVariant } from './experimentService';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

const APP_SIGNATURE = '📱 Huzur Uygulaması';

type ShareCard = {
  cardType: string;
  title: string;
  text: string;
};

type ShareResult = {
  success: boolean;
  reason?: string;
  channel?: string;
  error?: unknown;
};

const truncateText = (text = '', maxLength = 220): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
};

export const buildVerseShareCard = (verse: { reference?: string; arabic?: string; translation?: string; text?: string }): ShareCard => {
  const reference = verse?.reference || 'Ayet';
  const arabic = truncateText(verse?.arabic || '');
  const translation = truncateText(verse?.translation || verse?.text || '');

  return {
    cardType: 'verse',
    title: `Günün Ayeti - ${reference}`,
    text: `${arabic}\n\n${translation}\n\n(${reference})\n\n${APP_SIGNATURE}`
  };
};

export const buildDuaShareCard = (dua: { title?: string; source?: string; arabic?: string; text?: string }): ShareCard => {
  const title = dua?.title || dua?.source || 'Günün Duası';
  const arabic = truncateText(dua?.arabic || '');
  const text = truncateText(dua?.text || '');

  return {
    cardType: 'dua',
    title: `Günün Duası - ${title}`,
    text: `${arabic}\n\n${text}\n\n${APP_SIGNATURE}`
  };
};

export const buildEsmaShareCard = (esma: { name?: string; latin?: string; arabic?: string; meaning?: string; detail?: string }): ShareCard => {
  const name = esma?.name || esma?.latin || '';
  const arabic = esma?.arabic || '';
  const meaning = esma?.meaning || '';
  const detail = esma?.detail || '';

  let text = `${arabic}\n\n${name}: ${meaning}`;
  if (detail) {
    text += `\n\n${detail}`;
  }
  text += `\n\n${APP_SIGNATURE}`;

  return {
    cardType: 'esma',
    title: `Allah'ın Güzel İsimleri - ${name}`,
    text
  };
};

export const openShareCard = (cardType: string, source = 'daily_content'): void => {
  const ctaVariant = getExperimentVariant('share_cta_v1');
  analyticsService.logExperimentAssigned('share_cta_v1', ctaVariant, 'share_card_open');
  analyticsService.logCtaVariantRendered(ctaVariant, source);

  logShareOpened(cardType, source);
};

export const shareCard = async (card: ShareCard | undefined | null, channelHint = 'native_share'): Promise<ShareResult> => {
  if (!card) return { success: false, reason: 'card_missing' };

  const payload = {
    title: card.title,
    text: card.text
  };

  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title: payload.title,
        text: payload.text,
        dialogTitle: 'Paylaş'
      });
      logShareSent(card.cardType, channelHint);
      return { success: true, channel: 'native_share' };
    }

    if (navigator.share) {
      await navigator.share(payload);
      logShareSent(card.cardType, channelHint);
      return { success: true, channel: channelHint };
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(card.text);
      logShareSent(card.cardType, 'clipboard');
      return { success: true, channel: 'clipboard' };
    }

    return { success: false, reason: 'share_unavailable' };
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      return { success: false, reason: 'cancelled' };
    }
    return { success: false, reason: 'error', error };
  }
};

export default {
  buildVerseShareCard,
  buildDuaShareCard,
  buildEsmaShareCard,
  openShareCard,
  shareCard
};
