// Simple bridge to report JS errors to Crashlytics via Capacitor plugin
export async function logCrash(message) {
  try {
    const plugin = window?.Capacitor?.Plugins?.Crashlytics;
    if (plugin && typeof plugin.log === 'function') {
      await plugin.log({ message });
    } else {
      console.warn('Crashlytics plugin not available.');
    }
  } catch (e) {
    // Swallow to avoid breaking app flow
    console.error('Crashlytics log failed', e);
  }
}

export async function logException(error) {
  try {
    const plugin = window?.Capacitor?.Plugins?.Crashlytics;
    if (plugin && typeof plugin.logException === 'function') {
      await plugin.logException({ message: error?.message, stack: error?.stack });
    } else {
      console.error(error);
    }
  } catch (e) {
    console.error('Crashlytics logException failed', e);
  }
}

export async function initCrashlyticsTestHook() {
  if (typeof window !== 'undefined') {
    // Expose a simple global test function to trigger Crashlytics messages from the UI/console
    window.__CRASHLYTICS_TEST__ = async () => {
      await logCrash('CRASHLYTICS TEST START');
      try {
        throw new Error('Crashlytics test exception');
      } catch (err) {
        await logException(err);
      }
    };
  }
}

export default { logCrash, logException, initCrashlyticsTestHook };
