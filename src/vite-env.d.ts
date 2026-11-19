/// <reference types="vite/client" />

interface Window {
  // Injected by the Capacitor native bridge; absent in a plain browser.
  Capacitor?: {
    getPlatform?: () => string;
    isNativePlatform?: () => boolean;
    isNative?: boolean;
    Plugins?: {
      Crashlytics?: Record<string, ((options: Record<string, unknown>) => Promise<unknown>) | undefined>;
    };
  };
  __CRASHLYTICS_TEST__?: unknown;
}
