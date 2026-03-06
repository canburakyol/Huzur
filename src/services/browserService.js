import { Browser } from '@capacitor/browser';
import { logger } from '../utils/logger';

class BrowserService {
  safeOpenInNewTab(url) {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (win) {
      win.opener = null;
    }
  }

  async open(url, options = {}) {
    try {
      await Browser.open({
        url: url,
        presentationStyle: 'fullscreen', // fullscreen, popup
        toolbarColor: options.toolbarColor || '#4CAF50', // Huzur app main color
        showArrow: true,
        showReloadButton: true
      });
    } catch (error) {
      logger.warn('Browser open failed, falling back to window.open:', error);
      // Fallback: window.open
      this.safeOpenInNewTab(url);
    }
  }

  async close() {
    try {
      await Browser.close();
    } catch (error) {
      logger.warn('Browser close failed:', error);
    }
  }
}

export const browserService = new BrowserService();
