
async function verifySpa5k() {
    const tests = [
        { name: 'Ibn Kathir (AR)', slug: 'ar-tafsir-ibn-kathir', surah: 1, ayah: 2 },
        { name: 'Tabari (AR)', slug: 'ar-tafsir-al-tabari', surah: 1, ayah: 2 },
        { name: 'Ibn Kathir (EN)', slug: 'en-tafisr-ibn-kathir', surah: 1, ayah: 2 }
    ];

    for (const test of tests) {
        const url = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${test.slug}/${test.surah}/${test.ayah}.json`;
        console.log(`\nTesting ${test.name}: ${url}`);
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                console.log(`SUCCESS!`);
                console.log(`Text Preview: ${JSON.stringify(data.text || data.tafsir).substring(0, 100)}...`);
            } else {
                console.log(`FAILED: ${response.status}`);
            }
        } catch (e) {
            console.log(`ERROR: ${e.message}`);
        }
    }
}

verifySpa5k();
