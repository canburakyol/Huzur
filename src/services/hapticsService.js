import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { logger } from '../utils/logger';

class HapticsService {
  constructor() {
    this.supported = false;
    this.checkSupport();
  }

  async checkSupport() {
    try {
      const result = await Haptics.isSupported();
      this.supported = result.value;
    } catch (e) {
      logger.warn('Haptics support check failed:', e);
      this.supported = false;
    }
  }

  // Hafif dokunma (button press)
  async lightImpact() {
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

  // Orta şiddet (zikir sayacı)
  async mediumImpact() {
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

  // Güçlü titreşim (hedef tamamlandı)
  async heavyImpact() {
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

  // Başarı bildirimi (zikir tamamlandı)
  async successNotification() {
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

  // Hata bildirimi
  async errorNotification() {
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

  // Seçim değişimi
  async selectionChanged() {
    try {
      if (this.supported) {
        await Haptics.selectionChanged();
      }
    } catch {
      // No fallback needed
    }
  }
}

export const hapticsService = new HapticsService();
