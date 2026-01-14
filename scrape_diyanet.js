
async function scrapeDiyanet() {
    const url = 'https://kuran.diyanet.gov.tr/tefsir/fatiha-suresi/1-ayet-tefsiri';
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        const searchPhrase = "Rahmân ve rahîm";
        const idx = html.indexOf(searchPhrase);
        if (idx !== -1) {
            console.log('Found phrase!');
            // Print context to identify the container class/id
            console.log(html.substring(idx - 500, idx + 500));
        } else {
            console.log('Phrase not found.');
            // Print some HTML to see what we got
            console.log(html.substring(0, 500));
        }

    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

scrapeDiyanet();
