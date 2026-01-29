/**
 * Widget Capacitor Plugin
 * Android WidgetPlugin ile iletişim kurar
 */

import { registerPlugin } from '@capacitor/core';

export const Widget = registerPlugin('Widget', {
  web: () => ({
    async updateWidget() {
      return { success: false, platform: 'web' };
    },
    async scheduleWidgetAlarms() {
      return { success: false, platform: 'web' };
    },
    async cancelWidgetAlarms() {
      return { success: false, platform: 'web' };
    }
  })
});

export default Widget;