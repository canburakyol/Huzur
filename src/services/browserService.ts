import { Browser } from '@capacitor/browser';
import { logger } from '../utils/logger';

type BrowserOptions = {
  toolbarColor?: string;
};

const ALLOWED_EXTERNAL_HOSTS = new Set([
  'canburakyol.github.io',
  'play.google.com',
  'www.youtube.com',
  'youtube.com',
  'youtu.be'
]);

const normalizeAllowedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return null;
    }

    const host = parsed.hostname.toLowerCase();
    if (!ALLOWED_EXTERNAL_HOSTS.has(host)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
};

class BrowserService {
  safeOpenInNewTab(url: string): void {
    const safeUrl = normalizeAllowedUrl(url);
    if (!safeUrl) {
      logger.warn('Blocked unsafe external URL');
      return;
    }

    const win = window.open(safeUrl, '_blank', 'noopener,noreferrer');
    if (win) {
      win.opener = null;
    }
  }

  async open(url: string, options: BrowserOptions = {}): Promise<void> {
    const safeUrl = normalizeAllowedUrl(url);
    if (!safeUrl) {
      logger.warn('Blocked unsafe external URL');
      return;
    }

    try {
      await Browser.open({
        url: safeUrl,
        presentationStyle: 'fullscreen',
        toolbarColor: options.toolbarColor || '#4CAF50',
        showArrow: true,
        showReloadButton: true
      });
    } catch (error) {
      logger.warn('Browser open failed, falling back to window.open:', error);
      this.safeOpenInNewTab(url);
    }
  }

  async close(): Promise<void> {
    try {
      await Browser.close();
    } catch (error) {
      logger.warn('Browser close failed:', error);
    }
  }
}

export const browserService = new BrowserService();
