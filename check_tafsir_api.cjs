const fetch = require('node-fetch'); // Note: might need dynamic import if node-fetch is ESM

async function checkApi() {
    try {
        // 1. Check standard endpoint content
        console.log('Checking standard endpoint (Elmalili)...');
        const res1 = await fetch('https://api.acikkuran.com/surah/1/verse/1?author=14');
        const data1 = await res1.json();
        console.log('Standard (Author 14 - Elmalili):', data1.data.translation.text);
        console.log('Footnotes:', data1.data.translation.footnotes);

        // 2. Check for tafsir endpoint (guess)
        console.log('\nChecking tafsir endpoint (guess)...');
        const res2 = await fetch('https://api.acikkuran.com/surah/1/verse/1/tafsir');
        if (res2.ok) {
            const data2 = await res2.json();
            console.log('Tafsir Endpoint Found:', data2);
        } else {
            console.log('Tafsir Endpoint Not Found (Status:', res2.status, ')');
        }

        // 3. Check quran.com API for Turkish tafsir
        console.log('\nChecking quran.com API...');
        // 164 = Tafsir al-Jalalayn (Arabic), 169 = Ibn Kathir (English). Need to find Turkish ID.
        // List tafsirs
        const res3 = await fetch('https://api.quran.com/api/v4/resources/tafsirs');
        const data3 = await res3.json();
        const turkishTafsirs = data3.tafsirs.filter(t => t.language_name === 'turkish' || t.slug.includes('tr'));
        console.log('Turkish Tafsirs on Quran.com:', turkishTafsirs);

    } catch (err) {
        console.error('Error:', err);
    }
}

// Dynamic import for node-fetch if needed, or just use native fetch in Node 18+
if (typeof fetch === 'undefined') {
    import('node-fetch').then(mod => {
        global.fetch = mod.default;
        checkApi();
    });
} else {
    checkApi();
}
