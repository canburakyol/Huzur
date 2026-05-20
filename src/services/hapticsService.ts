import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { logger } from '../utils/logger';

class HapticsService {
  supported = false;

  constructor() {
    this.checkSupport();
  }

  async checkSupport(): Promise<void> {
    try {
      const result = await Haptics.isSupported();
      this.supported = result.value;
    } catch (e) {
      logger.warn('Haptics support check failed:', e);
      this.supported = false;
    }
  }

  async lightImpact(): Promise<void> {
    try {
      if (this.supported) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch (e) {
      logger.warn('Haptics light failed', e);
    }
  }

  async mediumImpact(): Promise<void> {
    try {
      if (this.supported) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    } catch (e) {
      logger.warn('Haptics medium failed', e);
    }
  }

  async heavyImpact(): Promise<void> {
    try {
      if (this.supported) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (e) {
      logger.warn('Haptics heavy failed', e);
    }
  }

  async successNotification(): Promise<void> {
    try {
      if (this.supported) {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (navigator.vibrate) {
        navigator.vibrate([50, 50, 100]);
      }
    } catch (e) {
      logger.warn('Haptics success failed', e);
    }
  }

  async errorNotification(): Promise<void> {
    try {
      if (this.supported) {
        await Haptics.notification({ type: NotificationType.Error });
      } else if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }
    } catch (e) {
      logger.warn('Haptics error failed', e);
    }
  }

  async selectionChanged(): Promise<void> {
    try {
      if (this.supported) {
        await Haptics.selectionChanged();
      }
    } catch (error) {
      logger.error('[Haptics] selection haptic failed', error);
    }
  }
}

export const hapticsService = new HapticsService();
