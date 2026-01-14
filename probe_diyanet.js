
async function probeDiyanet() {
    const endpoints = [
        'https://kuran.diyanet.gov.tr/api/surah/1/verse/1',
        'https://kuran.diyanet.gov.tr/tefsir/api/surah/1/verse/1',
        'https://kuran.diyanet.gov.tr/mushaf/json/surah/1/verse/1',
        'https://kuran.diyanet.gov.tr/api/v1/tefsir',
        'https://kuran.diyanet.gov.tr/tefsir/1/1/json'
    ];

    for (const url of endpoints) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            console.log(`${url}: ${response.status}`);
        } catch (e) {
            console.log(`${url}: Error ${e.message}`);
        }
    }
}

probeDiyanet();
