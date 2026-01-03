
import axios from 'axios';

const API_URL = 'https://api.aladhan.com/v1/timings';
const LAT = 38.4237; // Izmir
const LON = 27.1428;
const METHOD = 13; // Diyanet

async function checkIzmir() {
    try {
        const timestamp = 1735646400; // 31 Dec 2024
        const response = await axios.get(`${API_URL}/${timestamp}`, {
            params: { latitude: LAT, longitude: LON, method: METHOD }
        });

        console.log('--- Izmir 31 Dec 2024 ---');
        console.log('Asr:', response.data.data.timings.Asr);
        console.log('Maghrib:', response.data.data.timings.Maghrib);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkIzmir();
