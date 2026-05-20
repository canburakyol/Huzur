import { CloudRain, Wind, Waves, Music, Book, Disc, LucideIcon } from 'lucide-react';

export interface SleepSound {
  id: string;
  nameKey: string;
  category: string;
  url: string;
  icon: LucideIcon;
}

export interface SoundCategory {
  id: string;
  nameKey: string;
  icon: LucideIcon;
}

export const SLEEP_SOUNDS: SleepSound[] = [
  { id: 'rain', nameKey: 'huzurMode.rain', category: 'nature', url: '/sounds/rain.mp3', icon: CloudRain },
  { id: 'forest', nameKey: 'huzurMode.forest', category: 'nature', url: '/sounds/forest.mp3', icon: Wind },
  { id: 'ocean', nameKey: 'huzurMode.ocean', category: 'nature', url: '/sounds/ocean.mp3', icon: Waves },
  { id: 'zikir_subhan', nameKey: 'huzurMode.zikirSubhan', category: 'dhikr', url: '/sounds/zikir_subhan.mp3', icon: Disc },
  { id: 'ney', nameKey: 'huzurMode.ney', category: 'music', url: '/sounds/ney.mp3', icon: Music },
  { id: 'rahman', nameKey: 'huzurMode.rahman', category: 'quran', url: '/sounds/rahman.mp3', icon: Book }
];

export const CATEGORIES: SoundCategory[] = [
  { id: 'nature', nameKey: 'huzurMode.catNature', icon: Wind },
  { id: 'dhikr', nameKey: 'huzurMode.catDhikr', icon: Disc },
  { id: 'music', nameKey: 'huzurMode.catMusic', icon: Music },
  { id: 'quran', nameKey: 'huzurMode.catQuran', icon: Book },
];
