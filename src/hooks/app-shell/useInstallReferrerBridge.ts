import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import InstallReferrer from "../../plugins/InstallReferrerPlugin";
import { captureInviteAcceptanceFromCode } from "../../services/referralService";
import { logger } from "../../utils/logger";

const readReferralCodeFromReferrer = (rawReferrer: string | undefined): string => {
  if (!rawReferrer) {
    return "";
  }

  try {
    const params = new URLSearchParams(rawReferrer);
    return (params.get("ref") || "").trim().toUpperCase();
  } catch (error) {
    logger.error("[InstallReferrer] Failed to parse referral code from referrer", error);
    return "";
  }
};

export function useInstallReferrerBridge(): void {
  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") {
      return;
    }

    let isCancelled = false;

    const syncInstallReferrer = async () => {
      try {
        const details = await InstallReferrer.getInstallReferrerDetails();
        if (isCancelled || !details?.success || !details?.referrer || details?.consumed) {
          return;
        }

        const referralCode = readReferralCodeFromReferrer(details.referrer);
        if (!referralCode) {
          await InstallReferrer.markInstallReferrerConsumed({ referrer: details.referrer });
          return;
        }

        captureInviteAcceptanceFromCode(referralCode, { source: "android_install_referrer" });
        await InstallReferrer.markInstallReferrerConsumed({ referrer: details.referrer });
      } catch (error) {
        logger.error("[InstallReferrer] Sync failed", error);
      }
    };

    void syncInstallReferrer();

    return () => {
      isCancelled = true;
    };
  }, []);
}

export default useInstallReferrerBridge;
