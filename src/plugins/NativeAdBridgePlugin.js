import { registerPlugin } from '@capacitor/core';

export const NativeAdBridge = registerPlugin('NativeAdBridge', {
  web: () => ({
    async initialize() {
      return { success: false, platform: 'web' };
    },
    async loadAd() {
      return null;
    },
    async reportImpression() {
      return { success: false, platform: 'web' };
    },
    async reportClick() {
      return { success: false, platform: 'web' };
    }
  })
});

export default NativeAdBridge;
