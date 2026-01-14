
async function fetchDiyanetContent() {
    const endpoints = [
        'https://kuran.diyanet.gov.tr/tefsir/api/surah/1/verse/1',
        'https://kuran.diyanet.gov.tr/mushaf/json/surah/1/verse/1',
        'https://kuran.diyanet.gov.tr/api/v1/tefsir',
        'https://kuran.diyanet.gov.tr/tefsir/1/1/json'
    ];

    for (const url of endpoints) {
        try {
            console.log(`\nFetching ${url}...`);
            const response = await fetch(url);
            const contentType = response.headers.get('content-type');
            console.log(`Content-Type: ${contentType}`);
            
            const text = await response.text();
            console.log(`Preview: ${text.substring(0, 100).replace(/\n/g, ' ')}`);
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

fetchDiyanetContent();
