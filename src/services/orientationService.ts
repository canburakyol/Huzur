import { ScreenOrientation } from '@capacitor/screen-orientation';
import { logger } from '../utils/logger';

class OrientationService {
  async lockPortrait(): Promise<void> {
    try {
      await ScreenOrientation.lock({
        orientation: 'portrait'
      });
    } catch (error) {
      logger.warn('Orientation lock failed (likely browser env):', error);
    }
  }

  async unlock(): Promise<void> {
    try {
      await ScreenOrientation.unlock();
    } catch (error) {
      logger.warn('Orientation unlock failed:', error);
    }
  }
}

export const orientationService = new OrientationService();
