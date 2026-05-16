import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';

export const useInAppUpdate = () => {
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    if (!Capacitor.isNativePlatform()) return;

    hasCheckedRef.current = true;

    const checkForUpdate = async () => {
      try {
        const { AppUpdate } = await import('@capawesome/capacitor-app-update');

        const result = await AppUpdate.getAppUpdateInfo();

        if (result.updateAvailability === 2) {
          const { immediateUpdateAllowed } = result;

          if (immediateUpdateAllowed) {
            logger.log('[InAppUpdate] Performing immediate update');
            await AppUpdate.performImmediateUpdate();
          } else {
            logger.log('[InAppUpdate] Flexible update available');
            await AppUpdate.startFlexibleUpdate();
            await AppUpdate.completeFlexibleUpdate();
          }
        }
      } catch (error) {
        if (error.message && !error.message.includes('APP_UPDATE_NOT_AVAILABLE')) {
          logger.warn('[InAppUpdate] Update check failed:', error);
        }
      }
    };

    void checkForUpdate();
  }, []);
};

export default useInAppUpdate;
