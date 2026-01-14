const fetch = require('node-fetch');

async function checkRepo() {
    try {
        console.log('Checking diyanet-bid/Kuran repo contents...');
        const res = await fetch('https://api.github.com/repos/diyanet-bid/Kuran/contents');
        if (!res.ok) {
            console.log('Repo not found or private. Status:', res.status);
            return;
        }
        const data = await res.json();
        console.log('Root contents:', data.map(f => f.name));

        // Check for app folder
        const appFolder = data.find(f => f.name === 'app');
        if (appFolder) {
            console.log(`\nChecking ${appFolder.name} folder...`);
            const res2 = await fetch(appFolder.url);
            const data2 = await res2.json();
            
            const apiFolder = data2.find(f => f.name === 'api');
            if (apiFolder) {
                console.log(`\nChecking ${apiFolder.name} folder...`);
                const res3 = await fetch(apiFolder.url);
                const data3 = await res3.json();
                console.log(`${apiFolder.name} contents:`, data3.map(f => f.name));
                
                const quranFolder = data3.find(f => f.name === 'quran');
                if (quranFolder) {
                     console.log(`\nChecking ${quranFolder.name} folder...`);
                     const res4 = await fetch(quranFolder.url);
                     const data4 = await res4.json();
                     console.log(`${quranFolder.name} contents:`, data4.map(f => f.name));
                     
                     // Check surah folder
                     const surahFolder = data4.find(f => f.name === 'surah');
                     if (surahFolder) {
                         console.log(`\nChecking ${surahFolder.name} folder...`);
                         const res5 = await fetch(surahFolder.url);
                         const data5 = await res5.json();
                         console.log(`${surahFolder.name} contents:`, data5.map(f => f.name));
                         
                         // Check [id] folder
                         const idFolder = data5.find(f => f.name.startsWith('['));
                         if (idFolder) {
                             console.log(`\nChecking ${idFolder.name} folder...`);
                             const res6 = await fetch(idFolder.url);
                             const data6 = await res6.json();
                             const routeFile = data6.find(f => f.name === 'route.ts');
                             if (routeFile) {
                                 console.log(`Reading ${routeFile.name}...`);
                                 const res7 = await fetch(routeFile.download_url);
                                 const content = await res7.text();
                                 console.log('Content:', content.substring(0, 500));
                                 
                                 const apiUrlMatch = content.match(/https?:\/\/[^\s'"`]+/);
                                if (apiUrlMatch) {
                                    console.log('Found URL:', apiUrlMatch[0]);
                                }
                             }
                         }
                     }
                }
            }
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

if (typeof fetch === 'undefined') {
    import('node-fetch').then(mod => {
        global.fetch = mod.default;
        checkRepo();
    });
} else {
    checkRepo();
}
