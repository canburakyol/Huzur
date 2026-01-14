
async function checkQuranCom() {
    console.log('--- Checking Quran.com API v4 ---');
    try {
        // Get resources (translations/tafsirs)
        const response = await fetch('https://api.quran.com/api/v4/resources/tafsirs');
        if (response.ok) {
            const data = await response.json();
            const turkish = data.tafsirs.filter(t => t.language_name === 'turkish' || t.language_name === 'Turkish');
            console.log('Turkish Tafsirs in Quran.com:', JSON.stringify(turkish, null, 2));
        } else {
            console.log('Quran.com fetch failed');
        }
    } catch (e) {
        console.log('Quran.com error:', e.message);
    }
}

checkQuranCom();
