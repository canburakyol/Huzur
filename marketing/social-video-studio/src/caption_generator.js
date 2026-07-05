import { CATEGORIES } from './config.js';

export function generateCaption(category, script) {
  const title = `${CATEGORIES[category]} artık daha düzenli.`;
  const caption = `${script.hook}. ${script.benefit}.\n\nHuzur ile günlük ibadet rutinini tek yerde takip et.`;
  const hashtags = ['#HuzurUygulaması','#İbadetRutini','#Namaz','#Zikir','#Müslüman', category === 'quran' ? '#Kuran' : '#Maneviyat'];
  return { title, caption, hashtags };
}
