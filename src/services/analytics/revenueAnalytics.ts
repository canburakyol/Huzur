import { ANALYTICS_EVENTS } from "./constants";
import type { AnalyticsService } from "./core";

type RevenueThis = AnalyticsService & {
  logEvent: (name: string, params?: Record<string, unknown>) => void;
}

export class RevenueAnalyticsMethods {
  logPremiumRecoveryMomentOpened(
    this: RevenueThis,
    surface = "home_recovery_support",
    riskBand = "steady",
    recoveryFeature = "assistant"
  ): void {
    this.logEvent(ANALYTICS_EVENTS.PREMIUM_RECOVERY_MOMENT_OPENED, {
      surface,
      risk_band: riskBand,
      recovery_feature: recoveryFeature,
    });
  }
}

export const registerRevenueAnalytics = (AnalyticsServiceClass: typeof AnalyticsService): void => {
  Object.getOwnPropertyNames(RevenueAnalyticsMethods.prototype)
    .filter((name) => name !== "constructor")
    .forEach((name) => {
      (AnalyticsServiceClass.prototype as unknown as Record<string, unknown>)[name] = (RevenueAnalyticsMethods.prototype as unknown as Record<string, unknown>)[name];
    });
};
