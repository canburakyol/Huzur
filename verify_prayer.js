
import axios from 'axios';

const API_URL = 'https://api.aladhan.com/v1/timings';
const LAT = 41.0082; // Istanbul
const LON = 28.9784;
const METHOD = 13; // Diyanet

async function checkTimes() {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        console.log(`Fetching prayer times for Istanbul (Lat: ${LAT}, Lon: ${LON}) using Method ${METHOD}...`);
        
        const response = await axios.get(`${API_URL}/${timestamp}`, {
            params: {
                latitude: LAT,
                longitude: LON,
                method: METHOD
            }
        });

        const data = response.data.data;
        console.log('--- API Response (Aladhan Method 13) ---');
        console.log('Date:', data.date.readable);
        console.log('Hijri:', data.date.hijri.date);
        console.log('Fajr:', data.timings.Fajr);
        console.log('Sunrise:', data.timings.Sunrise);
        console.log('Dhuhr:', data.timings.Dhuhr);
        console.log('Asr:', data.timings.Asr);
        console.log('Maghrib:', data.timings.Maghrib);
        console.log('Isha:', data.timings.Isha);
        console.log('Method:', data.meta.method.name);
        console.log('Params:', JSON.stringify(data.meta.method.params));
        console.log('Offsets:', JSON.stringify(data.meta.offset));
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTimes();
