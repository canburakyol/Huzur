
import axios from 'axios';

const API_URL = 'https://api.aladhan.com/v1/timings';
const LAT = 41.0082; // Istanbul
const LON = 28.9784;
const METHOD = 13; // Diyanet

async function compareYears() {
    try {
        // 31 Dec 2024
        const ts2024 = 1735646400; 
        const res2024 = await axios.get(`${API_URL}/${ts2024}`, {
            params: { latitude: LAT, longitude: LON, method: METHOD }
        });
        
        // 31 Dec 2025
        const ts2025 = 1767182400;
        const res2025 = await axios.get(`${API_URL}/${ts2025}`, {
            params: { latitude: LAT, longitude: LON, method: METHOD }
        });

        console.log('--- 31 Dec 2024 ---');
        console.log('Asr:', res2024.data.data.timings.Asr);
        console.log('Maghrib:', res2024.data.data.timings.Maghrib);

        console.log('--- 31 Dec 2025 ---');
        console.log('Asr:', res2025.data.data.timings.Asr);
        console.log('Maghrib:', res2025.data.data.timings.Maghrib);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

compareYears();
