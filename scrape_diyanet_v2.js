
async function scrapeDiyanet() {
    const urls = [
        'https://kuran.diyanet.gov.tr/tefsir/fatiha-suresi/1-ayet-tefsiri',
        'https://kuran.diyanet.gov.tr/tefsir/1-sure/1-ayet-tefsiri',
        'https://kuran.diyanet.gov.tr/tefsir/fatiha-suresi/1-ayet'
    ];

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    for (const url of urls) {
        console.log(`\nFetching ${url}...`);
        try {
            const response = await fetch(url, { headers });
            if (response.ok) {
                const html = await response.text();
                if (html.includes('Hata - My ASP.NET Application')) {
                    console.log('Got ASP.NET Error Page');
                } else {
                    console.log('Got Valid Page!');
                    const idx = html.indexOf("Rahmân ve rahîm");
                    if (idx !== -1) {
                        console.log('Found phrase!');
                        console.log(html.substring(idx - 200, idx + 200));
                    } else {
                        console.log('Phrase not found, but page seems valid.');
                        console.log(html.substring(0, 200));
                    }
                }
            } else {
                console.log(`Status: ${response.status}`);
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

scrapeDiyanet();
