import { getSurahComplete } from './src/services/quranService.js';

// Mock fetch since we are running in node (or use a polyfill if needed, but I'll just use a simple fetch replacement or run this in browser console via subagent if possible. 
// Actually, I can't run this easily in node without fetch.
// Better to create a small HTML file or just use the browser subagent to run a script in the console.

// Let's use the browser subagent to run this in the console of the running app.
console.log("Debugging Quran API...");
getSurahComplete(1).then(data => {
    console.log("Surah 1 Data:", data);
    if (data && data.ayahs && data.ayahs.length > 0) {
        console.log("First Ayah:", data.ayahs[0]);
    } else {
        console.error("No ayahs found!");
    }
}).catch(err => console.error("Error:", err));
