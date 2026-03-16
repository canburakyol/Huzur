import { registerPlugin, Capacitor } from '@capacitor/core';

const noopPlugin = {
  async initialize() {
    return { success: false, platform: Capacitor.getPlatform(), error: 'Plugin not available' };
  },
  async loadAd() {
    return { success: false, platform: Capacitor.getPlatform(), error: 'Plugin not available' };
  },
  async reportImpression() {
    return { success: false, platform: Capacitor.getPlatform(), error: 'Plugin not available' };
  },
  async reportClick() {
    return { success: false, platform: Capacitor.getPlatform(), error: 'Plugin not available' };
  }
};

let NativeAdBridge;
try {
  if (Capacitor.getPlatform() === 'android') {
    NativeAdBridge = registerPlugin('NativeAdBridge', {
      web: () => noopPlugin
    });
  } else {
    NativeAdBridge = noopPlugin;
  }
} catch {
  NativeAdBridge = noopPlugin;
}

export { NativeAdBridge };
export default NativeAdBridge;
