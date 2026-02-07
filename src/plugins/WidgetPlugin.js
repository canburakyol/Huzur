/**
 * Widget Capacitor Plugin
 * Android WidgetPlugin ile iletişim kurar
 */

import { registerPlugin, Capacitor } from '@capacitor/core';

// Fallback implementation for when plugin is not available
const noopPlugin = {
  async updateWidget() {
    return { success: false, platform: Capacitor.getPlatform(), error: 'Plugin not available' };
  },
  async scheduleWidgetAlarms() {
    return { success: false, platform: Capacitor.getPlatform(), error: 'Plugin not available' };
  },
  async cancelWidgetAlarms() {
    return { success: false, platform: Capacitor.getPlatform(), error: 'Plugin not available' };
  },
  async updateZikirWidget() {
    return { success: false, platform: Capacitor.getPlatform(), error: 'Plugin not available' };
  }
};

// Safe plugin registration that doesn't throw on Android when native plugin is missing
let Widget;
try {
  if (Capacitor.isPluginAvailable('Widget')) {
    Widget = registerPlugin('Widget', {
      web: () => noopPlugin
    });
  } else {
    Widget = noopPlugin;
  }
} catch {
  Widget = noopPlugin;
}

export { Widget };
export default Widget;