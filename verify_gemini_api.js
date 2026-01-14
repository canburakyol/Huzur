import fs from 'fs';
import path from 'path';
import https from 'https';

// Read .env file to get the API key
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);

if (!match) {
  console.error('API Key not found in .env');
  process.exit(1);
}

const apiKey = match[1].trim();
console.log('Testing with API Key:', apiKey.substring(0, 10) + '...');

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

const systemPrompt = `Sen bir test asistanısın. Sadece "Test başarılı" de.`;
const userMessage = "Merhaba";

const data = JSON.stringify({
  contents: [{
    parts: [{ text: `${systemPrompt}\n\nKullanıcı Sorusu: ${userMessage}` }]
  }],
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024
  }
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(API_URL, options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    try {
      const jsonResponse = JSON.parse(responseBody);
      if (jsonResponse.candidates && jsonResponse.candidates[0].content) {
        console.log('Response:', jsonResponse.candidates[0].content.parts[0].text);
        console.log('Verification SUCCESS');
      } else {
        console.error('Invalid response format:', jsonResponse);
        console.log('Verification FAILED');
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', responseBody);
      console.log('Verification FAILED');
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
  console.log('Verification FAILED');
});

req.write(data);
req.end();
