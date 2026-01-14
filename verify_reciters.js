
async function verifyReciters() {
    const reciters = [
        'ar.shuraim',
        'ar.mahermuaiqly',
        'ar.basfar',
        'ar.ahmedajamy',
        'ar.nasserqatami',
        'ar.yasseraldossari',
        'ar.alafasy' // Control
    ];

    for (const id of reciters) {
        // Check Surah 1 with this reciter
        const url = `https://api.alquran.cloud/v1/surah/1/${id}`;
        try {
            const response = await fetch(url);
            if (response.ok) {
                console.log(`✅ ${id} is VALID`);
            } else {
                console.log(`❌ ${id} is INVALID (Status: ${response.status})`);
            }
        } catch (e) {
            console.log(`⚠️ ${id} Error: ${e.message}`);
        }
    }
}

verifyReciters();
