import { logger } from '../utils/logger';
import { Preferences } from '@capacitor/preferences';
import { Browser } from '@capacitor/browser';
import { Device } from '@capacitor/device';

const RATE_CONFIG = {
  MIN_DAYS_BEFORE_PROMPT: 7,
  MIN_LAUNCHES_BEFORE_PROMPT: 5,
  DAYS_BETWEEN_PROMPTS: 60,
  ANDROID_PACKAGE_ID: 'com.huzurapp.android'
};

type RateData = {
  firstLaunchDate: number;
  launchCount: number;
  eventCount: number;
  lastPromptDate: number | null;
  hasRated: boolean;
  hasDeclined: boolean;
};

class RateService {
  private STORAGE_KEY = 'rate_app_data';

  async getData(): Promise<RateData> {
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

  async saveData(data: RateData): Promise<void> {
    await Preferences.set({ key: this.STORAGE_KEY, value: JSON.stringify(data) });
  }

  async trackLaunch(): Promise<void> {
    const data = await this.getData();
    data.launchCount++;
    await this.saveData(data);
  }

  async trackHappyEvent(): Promise<void> {
    const data = await this.getData();
    data.eventCount++;
    await this.saveData(data);
  }

  async shouldShowPrompt(): Promise<boolean> {
    const data = await this.getData();

    if (data.hasRated || data.hasDeclined) return false;

    const now = Date.now();
    const daysSinceFirst = (now - data.firstLaunchDate) / (1000 * 60 * 60 * 24);
    const daysSinceLastPrompt = data.lastPromptDate 
      ? (now - data.lastPromptDate) / (1000 * 60 * 60 * 24)
      : Infinity;

    const isMatureEnough = daysSinceFirst >= RATE_CONFIG.MIN_DAYS_BEFORE_PROMPT;
    const isFrequentUser = data.launchCount >= RATE_CONFIG.MIN_LAUNCHES_BEFORE_PROMPT;
    const isNotAnnoying = daysSinceLastPrompt >= RATE_CONFIG.DAYS_BETWEEN_PROMPTS;

    return isMatureEnough && isFrequentUser && isNotAnnoying;
  }

  async checkAndPrompt(force = false): Promise<boolean> {
    try {
      if (!force) {
        const shouldShow = await this.shouldShowPrompt();
        if (!shouldShow) return false;
      }

      return true;
    } catch (error) {
      logger.error('Rate prompt check error:', error);
      return false;
    }
  }

  async openStore(): Promise<void> {
    try {
      const data = await this.getData();
      data.hasRated = true;
      data.lastPromptDate = Date.now();
      await this.saveData(data);

      const info = await Device.getInfo();
      if (info.platform === 'android') {
        await Browser.open({ url: `market://details?id=${RATE_CONFIG.ANDROID_PACKAGE_ID}` });
      }
    } catch (e) {
      logger.error('Failed to open store:', e);
    }
  }

  async deferPrompt(): Promise<void> {
    const data = await this.getData();
    data.lastPromptDate = Date.now();
    await this.saveData(data);
  }

  async declinePrompt(): Promise<void> {
    const data = await this.getData();
    data.hasDeclined = true;
    await this.saveData(data);
  }
}

export const rateService = new RateService();
