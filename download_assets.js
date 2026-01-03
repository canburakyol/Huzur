import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET_DIR = path.join(__dirname, 'public', 'sounds');

if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const FILES = [
    { name: 'rain.ogg', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
    { name: 'forest.ogg', url: 'https://actions.google.com/sounds/v1/ambiences/jungle_atmosphere_afternoon.ogg' },
    { name: 'ocean.ogg', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rocks.ogg' },
    // Using alternative reliable sources for Ney and Zikir if Archive.org fails, but let's try Archive first with a known working link or a different source.
    // Archive.org links often redirect, so we need to handle that or use a direct link.
    // Let's use a specific known file for Ney and Zikir from a reliable CDN if possible, or try the Archive one.
    // Actually, for Ney and Zikir, I will use a placeholder from a free sound site that allows direct download if I can't find a better one.
    // But for now, let's try the Archive ones again, but with 'https' and follow redirects.
    // Better: Use a reliable GitHub raw link if I can find one. 
    // Since I couldn't find one, I'll try to download from the Google Actions library if there are any matching sounds, or use a generic one.
    // Google Actions has 'religious' or 'spiritual' sounds? Unlikely.
    // I will stick to the Archive.org links but I'll use a script that follows redirects.
    { name: 'ney.mp3', url: 'https://ia800605.us.archive.org/15/items/reed-flute-ney/Reed%20Flute%20%28Ney%29.mp3' }, // Direct link attempt
    { name: 'zikr.mp3', url: 'https://ia801407.us.archive.org/27/items/a-sufi-dhikr/A%20Sufi%20dhikr.mp3' } // Direct link attempt
];

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                download(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

console.log('Downloading assets...');

Promise.all(FILES.map(async (f) => {
    try {
        await download(f.url, path.join(TARGET_DIR, f.name));
        console.log(`✅ Downloaded ${f.name}`);
    } catch (e) {
        console.error(`❌ Failed to download ${f.name}:`, e.message);
    }
})).then(() => console.log('Done.'));
