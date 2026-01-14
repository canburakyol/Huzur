
async function checkTafsirContent() {
    const authors = [
        { id: 21, name: 'Ibn Kathir' },
        { id: 14, name: 'Elmalili Hamdi Yazir' },
        { id: 107, name: 'Mehmet Okuyan' }
    ];

    for (const author of authors) {
        try {
            console.log(`\n--- Checking ${author.name} (ID: ${author.id}) ---`);
            // Check Fatiha 1:2 (usually has some commentary in tafsirs)
            const response = await fetch(`https://api.acikkuran.com/surah/1/verse/2?author=${author.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.translation) {
                    const text = data.data.translation.text;
                    console.log(`Length: ${text.length} chars`);
                    console.log(`Preview: ${text.substring(0, 100)}...`);
                    
                    // Check for footnotes if any
                    if (data.data.translation.footnotes) {
                        console.log(`Footnotes: ${JSON.stringify(data.data.translation.footnotes)}`);
                    }
                }
            } else {
                console.log(`Failed to fetch: ${response.status}`);
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

checkTafsirContent();
