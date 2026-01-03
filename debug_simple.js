
import axios from 'axios';

const API_URL = 'https://api.aladhan.com/v1/timings';
const LAT = 41.0082; // Istanbul
const LON = 28.9784;
const METHOD = 13; // Diyanet

async function checkTimes() {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        
        const response = await axios.get(`${API_URL}/${timestamp}`, {
            params: {
                latitude: LAT,
                longitude: LON,
                method: METHOD
            }
        });

        const timings = response.data.data.timings;
        console.log('Fajr:', timings.Fajr);
        console.log('Sunrise:', timings.Sunrise);
        console.log('Dhuhr:', timings.Dhuhr);
        console.log('Asr:', timings.Asr);
        console.log('Maghrib:', timings.Maghrib);
        console.log('Isha:', timings.Isha);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTimes();
