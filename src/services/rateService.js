import { Preferences } from '@capacitor/preferences';
import { Browser } from '@capacitor/browser';
import { Device } from '@capacitor/device';

const RATE_CONFIG = {
  MIN_DAYS_BEFORE_PROMPT: 7,           // İlk 7 gün bekle
  MIN_LAUNCHES_BEFORE_PROMPT: 5,       // En az 5 açılış
  DAYS_BETWEEN_PROMPTS: 60,            // Tekrar sorma süresi (2 ay)
  ANDROID_PACKAGE_ID: 'com.huzurapp.android'
};

class RateService {
  constructor() {
    this.STORAGE_KEY = 'rate_app_data';
  }

  async getData() {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    return value ? JSON.parse(value) : {
      firstLaunchDate: Date.now(),
      launchCount: 0,
      eventCount: 0,
      lastPromptDate: null,
      hasRated: false,
      hasDeclined: false
    };
  }

  async saveData(data) {
    await Preferences.set({ key: this.STORAGE_KEY, value: JSON.stringify(data) });
  }

  async trackLaunch() {
    const data = await this.getData();
    data.launchCount++;
    await this.saveData(data);
  }

  // Önemli bir olay (Zikir bitti, Hatim bitti vb.)
  async trackHappyEvent() {
    const data = await this.getData();
    data.eventCount++;
    await this.saveData(data);
  }

  async shouldShowPrompt() {
    const data = await this.getData();

    // Zaten puanladıysa veya reddettiyse asla sorma
    if (data.hasRated || data.hasDeclined) return false;

    const now = Date.now();
    const daysSinceFirst = (now - data.firstLaunchDate) / (1000 * 60 * 60 * 24);
    const daysSinceLastPrompt = data.lastPromptDate 
      ? (now - data.lastPromptDate) / (1000 * 60 * 60 * 24)
      : Infinity;

    // Temel koşullar
    const isMatureEnough = daysSinceFirst >= RATE_CONFIG.MIN_DAYS_BEFORE_PROMPT;
    const isFrequentUser = data.launchCount >= RATE_CONFIG.MIN_LAUNCHES_BEFORE_PROMPT;
    const isNotAnnoying = daysSinceLastPrompt >= RATE_CONFIG.DAYS_BETWEEN_PROMPTS;

    return isMatureEnough && isFrequentUser && isNotAnnoying;
  }

  // Prompt'u tetikle (Sally'nin Zikir Sonu kuralı için)
  async checkAndPrompt(force = false) {
    try {
      if (!force) {
        const shouldShow = await this.shouldShowPrompt();
        if (!shouldShow) return false;
      }

      // Bu metot UI tarafında bir Modal/Alert tetiklemeli.
      // Sadece logic kısmını burada yönetiyoruz, "Evet" denirse openStore() çağrılacak.
      return true; // UI göstermeli
    } catch (error) {
      console.error('Rate prompt check error:', error);
      return false;
    }
  }

  async openStore() {
    try {
      // Puanladı olarak işaretle
      const data = await this.getData();
      data.hasRated = true;
      data.lastPromptDate = Date.now();
      await this.saveData(data);

      const info = await Device.getInfo();
      if (info.platform === 'android') {
        await Browser.open({ url: `market://details?id=${RATE_CONFIG.ANDROID_PACKAGE_ID}` });
      } else {
        // Fallback for web/ios
        // window.open(...)
      }
    } catch (e) {
      console.error('Failed to open store:', e);
    }
  }

  async deferPrompt() {
    const data = await this.getData();
    data.lastPromptDate = Date.now(); // Bugün sormuşuz gibi kaydet, süreyi sıfırla
    await this.saveData(data);
  }

  async declinePrompt() {
    const data = await this.getData();
    data.hasDeclined = true;
    await this.saveData(data);
  }
}

export const rateService = new RateService();
