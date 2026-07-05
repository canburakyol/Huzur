import fs from 'node:fs/promises';
import path from 'node:path';
import { DIRS, ROOT } from './config.js';

const imageExt = /\.(png|jpe?g|webp)$/i;
const audioExt = /\.(mp3|wav|m4a|aac)$/i;
async function first(dir, matcher) { return (await fs.readdir(dir)).filter((x) => matcher.test(x)).map((x) => path.join(dir,x))[0] ?? null; }
async function all(dir, matcher) { return (await fs.readdir(dir)).filter((x) => matcher.test(x)).map((x) => path.join(dir,x)); }
const shuffle = (items) => items.map((value) => ({ value, order:Math.random() })).sort((a,b) => a.order-b.order).map(({value}) => value);

export async function ensureWorkspace() {
  await Promise.all(Object.values(DIRS).map((dir) => fs.mkdir(dir, { recursive:true })));
  const seed = path.resolve(ROOT, '..', '..', 'public', 'marketing', 'home.png');
  const target = path.join(DIRS.screenshots, 'huzur-home.png');
  try { await fs.access(target); } catch { try { await fs.copyFile(seed, target); } catch {} }
  const logoSeed = path.resolve(ROOT, '..', '..', 'assets', 'icon.png');
  const logoTarget = path.join(DIRS.logo, 'huzur-icon.png');
  try { await fs.access(logoTarget); } catch { try { await fs.copyFile(logoSeed, logoTarget); } catch {} }
  const musicSeed = path.resolve(ROOT, '..', '..', 'public', 'sounds', 'forest.mp3');
  const musicTarget = path.join(DIRS.music, 'huzur-forest.mp3');
  try { await fs.access(musicTarget); } catch { try { await fs.copyFile(musicSeed, musicTarget); } catch {} }
  const highResolutionSeeds = [
    'phone-01-prayer-times.png','phone-02-quran.png','phone-03-dhikr-counter.png',
    'phone-04-adhkar.png','phone-05-qibla.png','phone-06-greeting-cards.png'
  ];
  for (const name of highResolutionSeeds) {
    const source = path.resolve(ROOT,'..','..','play_store_assets','2026-03-refresh',name);
    const target = path.join(DIRS.screenshots,`huzur-hires-${name}`);
    try { await fs.access(target); } catch { try { await fs.copyFile(source,target); } catch {} }
  }
}

export async function pickAssets() {
  const found = await all(DIRS.screenshots, imageExt);
  if (!found.length) throw new Error('assets/screenshots klasörüne en az bir ekran görüntüsü ekleyin.');
  const highResolution = found.filter((file) => path.basename(file).startsWith('huzur-hires-'));
  const userScreenshots = found.filter((file) => path.basename(file) !== 'huzur-home.png');
  const screenshots = shuffle(highResolution.length ? highResolution : (userScreenshots.length ? userScreenshots : found)).slice(0, 4);
  return { screenshots, logo: await first(DIRS.logo,imageExt), background: await first(DIRS.backgrounds,/\.(png|jpe?g|webp|mp4)$/i), music: await first(DIRS.music,audioExt) };
}

export async function assetStatus() {
  const count = async (dir, re) => (await fs.readdir(dir)).filter((x) => re.test(x)).length;
  return { screenshots:await count(DIRS.screenshots,imageExt), logos:await count(DIRS.logo,imageExt), backgrounds:await count(DIRS.backgrounds,/\.(png|jpe?g|webp|mp4)$/i), music:await count(DIRS.music,audioExt) };
}
