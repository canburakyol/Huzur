import { useEffect, useCallback } from "react";
import { App } from "@capacitor/app";
import { Network } from "@capacitor/network";
import { orientationService } from "../services/orientationService";
import { updateService } from "../services/updateService";
import { rateService } from "../services/rateService";
import { logger } from "../utils/logger";

export const useMobileFeatures = () => {
  useEffect(() => {
    orientationService.lockPortrait();
  }, []);

  const checkUpdates = useCallback(async () => {
    try {
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
      logger.warn("[useMobileFeatures] Update check failed:", error);
    }
  }, []);

  useEffect(() => {
    void checkUpdates();

    const listener = App.addListener("appStateChange", (state) => {
      if (state.isActive) {
        void checkUpdates();
      }
    });

    return () => {
      listener
        .then((l) => l.remove())
        .catch((error) => logger.warn("[useMobileFeatures] App listener cleanup failed:", error));
    };
  }, [checkUpdates]);

  const triggerRatePrompt = useCallback(async (force = false): Promise<boolean> => {
    try {
      const status = await Network.getStatus();
      if (!status.connected) return false;

      const shouldShow = await rateService.checkAndPrompt(force);
      return shouldShow;
    } catch (error) {
      logger.warn("[useMobileFeatures] Rate prompt check failed:", error);
      return false;
    }
  }, []);

  return {
    triggerRatePrompt,
  };
};
