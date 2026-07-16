import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { logShareOpened, logShareSent } from './analyticsService';
import { createInviteLink } from './referralService';
import { buildPlayStoreReferralUrl } from '../config/deepLinkConfig';

type VerseShareDetails = {
  reference?: string;
  translation?: string;
  text?: string;
};

type VerseImageShareResult = {
  success: boolean;
  reason?: 'cancelled' | 'image_generation_failed' | 'share_unavailable' | 'error';
  error?: unknown;
};

const slugify = (value = 'ayet'): string => value
  .toLocaleLowerCase('tr-TR')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 48) || 'ayet';

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => new Promise((resolve) => {
  canvas.toBlob(resolve, 'image/jpeg', 0.94);
});

export const shareVerseAsImage = async (
  element: HTMLElement | null,
  verse: VerseShareDetails,
): Promise<VerseImageShareResult> => {
  const reference = verse.reference || 'Günün Ayeti';
  const translation = verse.translation || verse.text || '';
  const { code } = createInviteLink({
    source: 'daily_verse_share',
    campaign: 'daily_verse',
    lang: 'tr',
  });
  const playStoreUrl = buildPlayStoreReferralUrl({
    code,
    source: 'daily_verse_share',
    campaign: 'daily_verse',
    lang: 'tr',
  });
  const shareText = `“${translation}”\n\n${reference}\n\nHer gün yeni bir ayet için Huzur: Namaz Vakitleri ve Kuran'ı ücretsiz indir:\n${playStoreUrl}`;
  const fileName = `huzur-${slugify(reference)}-${Date.now()}.jpg`;

  logShareOpened('verse_image', 'home_daily_verse');

  const shareTextOnly = async (): Promise<VerseImageShareResult> => {
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title: `Günün Ayeti - ${reference}`,
        text: shareText,
        dialogTitle: 'Bu ayeti paylaş',
      });
      logShareSent('verse_text', 'native_share_fallback');
      return { success: true };
    }

    if (navigator.share) {
      await navigator.share({ title: `Günün Ayeti - ${reference}`, text: shareText });
      logShareSent('verse_text', 'web_share_fallback');
      return { success: true };
    }

    return { success: false, reason: 'share_unavailable' };
  };

  if (!element) {
    try {
      return await shareTextOnly();
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        return { success: false, reason: 'cancelled' };
      }
      return { success: false, reason: 'error', error };
    }
  }

  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      backgroundColor: '#173d2c',
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: false,
      width: 540,
      height: 675,
    });

    if (Capacitor.isNativePlatform()) {
      const base64Data = canvas.toDataURL('image/jpeg', 0.94).split(',')[1];
      if (!base64Data) return { success: false, reason: 'image_generation_failed' };

      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title: `Günün Ayeti - ${reference}`,
        text: shareText,
        files: [writeResult.uri],
        dialogTitle: 'Bu ayeti paylaş',
      });
      logShareSent('verse_image', 'native_share');
      return { success: true };
    }

    const blob = await canvasToBlob(canvas);
    if (!blob) return { success: false, reason: 'image_generation_failed' };

    const file = new File([blob], fileName, { type: 'image/jpeg' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `Günün Ayeti - ${reference}`, text: shareText });
      logShareSent('verse_image', 'web_share');
      return { success: true };
    }

    if (navigator.share) {
      await navigator.share({ title: `Günün Ayeti - ${reference}`, text: shareText });
      logShareSent('verse_image', 'web_share_text_fallback');
      return { success: true };
    }

    return { success: false, reason: 'share_unavailable' };
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      return { success: false, reason: 'cancelled' };
    }

    try {
      return await shareTextOnly();
    } catch (fallbackError) {
      if ((fallbackError as Error)?.name === 'AbortError') {
        return { success: false, reason: 'cancelled' };
      }
      return { success: false, reason: 'error', error: fallbackError || error };
    }
  }
};
