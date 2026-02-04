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

export default { logCrash, logException };
