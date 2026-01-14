
async function checkGlobalQuran() {
    const urls = [
        'http://api.globalquran.com/complete/quran-tafsir-tr-elmalili',
        'http://api.globalquran.com/surah/1/tafsir-tr-elmalili',
        'https://api.globalquran.com/quran/tafsir/tr.elmalili',
        'http://api.globalquran.com/1/1/tafsir-tr-elmalili'
    ];

    for (const url of urls) {
        try {
            console.log(`Checking ${url}...`);
            const response = await fetch(url);
            if (response.ok) {
                console.log(`FOUND: ${url}`);
                const text = await response.text();
                console.log(`Preview: ${text.substring(0, 100)}`);
            } else {
                console.log(`Failed: ${response.status}`);
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

checkGlobalQuran();
