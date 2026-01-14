const fetch = require('node-fetch');

async function checkArchive() {
    try {
        // Try to list files in the item
        console.log('Checking archive item metadata...');
        const res = await fetch('https://archive.org/metadata/kuran-kitapligi-40-kitap-pdf');
        const data = await res.json();
        
        if (data.files) {
            const jsonFiles = data.files.filter(f => f.name.endsWith('.json'));
            console.log('JSON Files found:', jsonFiles.map(f => f.name));
            
            if (jsonFiles.length > 0) {
                const file = jsonFiles[0];
                console.log(`\nFound JSON: ${file.name} (${file.size} bytes)`);
                const downloadUrl = `https://archive.org/download/kuran-kitapligi-40-kitap-pdf/${file.name}`;
                console.log('Download URL:', downloadUrl);
                
                // Check if we can fetch it
                /*
                const res2 = await fetch(downloadUrl, { method: 'HEAD' });
                console.log('Download Status:', res2.status);
                */
            }
        } else {
            console.log('No files found in metadata.');
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

if (typeof fetch === 'undefined') {
    import('node-fetch').then(mod => {
        global.fetch = mod.default;
        checkArchive();
    });
} else {
    checkArchive();
}
