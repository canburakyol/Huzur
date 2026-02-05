import { Browser } from '@capacitor/browser';

class BrowserService {
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
      console.warn('Browser open failed, falling back to window.open:', error);
      // Fallback: window.open
      window.open(url, '_blank');
    }
  }

  async close() {
    try {
      await Browser.close();
    } catch (error) {
      console.warn('Browser close failed:', error);
    }
  }
}

export const browserService = new BrowserService();
