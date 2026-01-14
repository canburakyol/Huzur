
async function checkTafsirAvailability() {
    console.log('--- Checking spa5k/tafsir_api ---');
    try {
        const response = await fetch('https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/editions.json');
        if (response.ok) {
            const data = await response.json();
            const turkish = Object.values(data).filter(t => t.language === 'tr' || t.name.toLowerCase().includes('turkish'));
            console.log('Turkish Tafsirs in spa5k:', JSON.stringify(turkish, null, 2));
            console.log('All languages in spa5k:', [...new Set(Object.values(data).map(t => t.language))]);
        } else {
            console.log('spa5k editions fetch failed');
        }
    } catch (e) {
        console.log('spa5k error:', e.message);
    }

    console.log('\n--- Checking Al Quran Cloud ---');
    try {
        const response = await fetch('https://api.alquran.cloud/v1/edition?type=tafsir');
        if (response.ok) {
            const data = await response.json();
            if (data.data) {
                const turkish = data.data.filter(t => t.language === 'tr');
                console.log('Turkish Tafsirs in Al Quran Cloud:', JSON.stringify(turkish, null, 2));
            }
        }
    } catch (e) {
        console.log('Al Quran Cloud error:', e.message);
    }
}

checkTafsirAvailability();
