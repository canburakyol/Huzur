/**
 * Widget Capacitor Plugin
 * Android WidgetPlugin ile iletişim kurar
 */

import { registerPlugin, Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';

export interface WidgetResult {
  success: boolean;
  platform: string;
  error?: string;
}

export interface WidgetPlugin {
  updateWidget(data?: unknown): Promise<WidgetResult>;
  scheduleWidgetAlarms(data?: unknown): Promise<WidgetResult>;
  cancelWidgetAlarms(data?: unknown): Promise<WidgetResult>;
  updateZikirWidget(data?: unknown): Promise<WidgetResult>;
}

const platform = Capacitor.getPlatform();

const noopPlugin: WidgetPlugin = {
  async updateWidget(): Promise<WidgetResult> {
    return { success: false, platform, error: 'Plugin not available' };
  },
  async scheduleWidgetAlarms(): Promise<WidgetResult> {
    return { success: false, platform, error: 'Plugin not available' };
  },
  async cancelWidgetAlarms(): Promise<WidgetResult> {
    return { success: false, platform, error: 'Plugin not available' };
  },
  async updateZikirWidget(): Promise<WidgetResult> {
    return { success: false, platform, error: 'Plugin not available' };
  }
};

let nativeWidget: WidgetPlugin | null = null;
try {
  if (Capacitor.isPluginAvailable('Widget')) {
    nativeWidget = registerPlugin<WidgetPlugin>('Widget', {
      web: () => noopPlugin
    });
  }
} catch (error) {
  logger.error('[WidgetPlugin] Failed to register plugin', error);
}

const getWidget = (): WidgetPlugin => nativeWidget || noopPlugin;

const Widget: WidgetPlugin = {
  updateWidget(data?: unknown): Promise<WidgetResult> {
    return getWidget().updateWidget(data);
  },
  scheduleWidgetAlarms(data?: unknown): Promise<WidgetResult> {
    return getWidget().scheduleWidgetAlarms(data);
  },
  cancelWidgetAlarms(data?: unknown): Promise<WidgetResult> {
    return getWidget().cancelWidgetAlarms(data);
  },
  updateZikirWidget(data?: unknown): Promise<WidgetResult> {
    return getWidget().updateZikirWidget(data);
  }
};

export { Widget };
export default Widget;
