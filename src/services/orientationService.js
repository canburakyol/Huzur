import { ScreenOrientation } from '@capacitor/screen-orientation';

class OrientationService {
  async lockPortrait() {
    try {
      // Tabletlerde döndürmeyi serbest bırakabiliriz, sadece telefonlarda kilitleyelim
      // Ancak şimdilik tutarlılık için her yerde dikey zorlayalım
      await ScreenOrientation.lock({
        orientation: 'portrait'
      });
    } catch (error) {
      console.warn('Orientation lock failed (likely browser env):', error);
    }
  }

  async unlock() {
    try {
      await ScreenOrientation.unlock();
    } catch (error) {
      console.warn('Orientation unlock failed:', error);
    }
  }
}

export const orientationService = new OrientationService();
