import { ANALYTICS_EVENTS } from './constants';

class RevenueAnalyticsMethods {
  logPremiumRecoveryMomentOpened(surface = 'home_recovery_support', riskBand = 'steady', recoveryFeature = 'assistant') {
    this.logEvent(ANALYTICS_EVENTS.PREMIUM_RECOVERY_MOMENT_OPENED, {
      surface,
      risk_band: riskBand,
      recovery_feature: recoveryFeature
    });
  }
}

export const registerRevenueAnalytics = (AnalyticsService) => {
  Object.getOwnPropertyNames(RevenueAnalyticsMethods.prototype)
    .filter((name) => name !== 'constructor')
    .forEach((name) => {
      AnalyticsService.prototype[name] = RevenueAnalyticsMethods.prototype[name];
    });
};
