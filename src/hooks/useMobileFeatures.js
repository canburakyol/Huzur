import { useEffect, useCallback } from 'react';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { orientationService } from '../services/orientationService';
import { updateService } from '../services/updateService';
import { rateService } from '../services/rateService';
import { logger } from '../utils/logger';

// Tüm mobil özellik initialization mantığı bu hook içinde toplanır.
export const useMobileFeatures = () => {

  // 1. Orientation Lock (Mount Anında)
  useEffect(() => {
    orientationService.lockPortrait();
  }, []);

  // 2. Update Check logic (Winston's Resume Rule)
  const checkUpdates = useCallback(async () => {
    try {
      // İnternet yoksa sessizce çık
      const status = await Network.getStatus();
      if (!status.connected) return;

      const info = await updateService.checkForUpdate();
      if (info.updateAvailable) {
        if (info.immediateUpdateAllowed) {
          await updateService.startImmediateUpdate();
        } else if (info.flexibleUpdateAllowed) {
          await updateService.startFlexibleUpdate();
        }
      }
    } catch (error) {
      logger.warn('[useMobileFeatures] Update check failed:', error);
    }
  }, []);

  // 3. App State Listener (Resume anında update kontrolü)
  useEffect(() => {
    // İlk açılışta kontrol et
    void checkUpdates();

    // Resume (Arka plandan dönüş) anında kontrol et
    const listener = App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        void checkUpdates();
      }
    });

    return () => {
      listener
        .then((l) => l.remove())
        .catch((error) => logger.warn('[useMobileFeatures] App listener cleanup failed:', error));
    };
  }, [checkUpdates]);

  // 4. Rate Prompt Trigger (Sally'nin Zikir Sonu Kuralı için)
  const triggerRatePrompt = useCallback(async (force = false) => {
    try {
      const status = await Network.getStatus();
      if (!status.connected) return false; // Offline ise sorma

      const shouldShow = await rateService.checkAndPrompt(force);
      return shouldShow; // UI bu sonucu kullanıp modal gösterecek
    } catch (error) {
      logger.warn('[useMobileFeatures] Rate prompt check failed:', error);
      return false;
    }
  }, []);

  return {
    triggerRatePrompt
  };
};
