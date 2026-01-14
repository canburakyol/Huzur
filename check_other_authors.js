
async function checkOtherAuthors() {
    const authors = [
        { id: 26, name: 'Suat Yildirim' },
        { id: 38, name: 'Mustafa Islamoglu' },
        { id: 51, name: 'Ali Riza Safa' },
        { id: 22, name: 'Muhammed Esed' } // Known for detailed notes
    ];

    for (const author of authors) {
        try {
            console.log(`\n--- Checking ${author.name} (ID: ${author.id}) ---`);
            const response = await fetch(`https://api.acikkuran.com/surah/1/verse/2?author=${author.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.translation) {
                    const text = data.data.translation.text;
                    console.log(`Length: ${text.length} chars`);
                    console.log(`Preview: ${text.substring(0, 100)}...`);
                    if (data.data.translation.footnotes) {
                        console.log(`Footnotes: ${JSON.stringify(data.data.translation.footnotes).substring(0, 200)}...`);
                    }
                }
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

checkOtherAuthors();
