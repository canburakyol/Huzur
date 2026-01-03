
import axios from 'axios';

const API_URL = 'https://api.aladhan.com/v1/timings';
const LAT = 41.0082; // Istanbul
const LON = 28.9784;
const METHOD = 13; // Diyanet

async function checkTimes() {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        console.log(`Checking for date: ${new Date().toISOString()}`);
        
        const response = await axios.get(`${API_URL}/${timestamp}`, {
            params: {
                latitude: LAT,
                longitude: LON,
                method: METHOD
            }
        });

        const data = response.data.data;
        console.log(JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTimes();
