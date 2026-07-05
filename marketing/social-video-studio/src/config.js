import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DIRS = {
  screenshots: path.join(ROOT, 'assets', 'screenshots'), logo: path.join(ROOT, 'assets', 'logo'),
  backgrounds: path.join(ROOT, 'assets', 'backgrounds'), music: path.join(ROOT, 'assets', 'music'),
  contentBank: path.join(ROOT, 'content_bank'), videos: path.join(ROOT, 'output', 'videos'),
  captions: path.join(ROOT, 'output', 'captions'), public: path.join(ROOT, 'public')
};
export const CATEGORIES = {
  prayer_times:'Namaz vakitleri', qibla:'Kıble bulucu', dhikr:'Zikirmatik', quran:'Kur’an okuma',
  prayer_circle:'Dua kardeşliği', khatm:'Hatim takibi', friday:'Cuma mesajı', general:'Genel uygulama tanıtımı'
};
