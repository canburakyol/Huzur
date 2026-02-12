import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { captureInviteAcceptanceFromUrl } from '../../services/referralService';

export function useDeepLinkBridge() {
  useEffect(() => {
    captureInviteAcceptanceFromUrl({ source: 'app_launch' });
  }, []);

  useEffect(() => {
    let appUrlOpenListener = null;

    const setupDeepLinkListener = async () => {
      try {
        if (typeof CapacitorApp.getLaunchUrl === 'function') {
          const launch = await CapacitorApp.getLaunchUrl();
          if (launch?.url) {
            captureInviteAcceptanceFromUrl({ source: 'android_launch_url' });
          }
        }

        appUrlOpenListener = await CapacitorApp.addListener('appUrlOpen', ({ url }) => {
          if (url) {
            captureInviteAcceptanceFromUrl({ source: 'android_app_url_open' });
          }
        });
      } catch (error) {
        console.warn('[DeepLink] Listener setup failed:', error);
      }
    };

    setupDeepLinkListener();

    return () => {
      try {
        appUrlOpenListener?.remove();
      } catch {
        // ignore
      }
    };
  }, []);
}
