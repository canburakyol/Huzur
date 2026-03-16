import { registerPlugin, Capacitor } from '@capacitor/core';

const noopPlugin = {
  async syncPrayerSchedule() {
    return { success: false, platform: Capacitor.getPlatform(), error: 'Plugin not available' };
  }
};

let PrayerSchedule;
try {
  if (Capacitor.isPluginAvailable('PrayerSchedule')) {
    PrayerSchedule = registerPlugin('PrayerSchedule', {
      web: () => noopPlugin
    });
  } else {
    PrayerSchedule = noopPlugin;
  }
} catch {
  PrayerSchedule = noopPlugin;
}

export { PrayerSchedule };
export default PrayerSchedule;
