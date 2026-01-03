import https from 'https';

const URLS = [
    { name: 'Rain', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
    { name: 'Forest', url: 'https://actions.google.com/sounds/v1/ambiences/jungle_atmosphere_afternoon.ogg' },
    { name: 'Ocean', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rocks.ogg' },
    { name: 'Ney', url: 'https://archive.org/download/reed-flute-ney/Reed%20Flute%20%28Ney%29.mp3' },
    { name: 'Zikir', url: 'https://archive.org/download/a-sufi-dhikr/A%20Sufi%20dhikr.mp3' }
];

console.log('Checking URLs...');

URLS.forEach(item => {
    const req = https.request(item.url, { method: 'HEAD' }, (res) => {
        console.log(`${item.name}: Status ${res.statusCode}`);
        if (res.statusCode >= 300 && res.statusCode < 400) {
            console.log(`  -> Redirects to: ${res.headers.location}`);
        }
    });

    req.on('error', (e) => {
        console.error(`${item.name}: Error - ${e.message}`);
    });

    req.end();
});
