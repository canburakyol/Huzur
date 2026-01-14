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
console.log('Listing models with API Key:', apiKey.substring(0, 10) + '...');

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(API_URL, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    try {
      const jsonResponse = JSON.parse(responseBody);
      if (jsonResponse.models) {
        console.log('Available Models:');
        jsonResponse.models.forEach(model => {
          if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
            console.log(`- ${model.name}`);
          }
        });
      } else {
        console.error('Error listing models:', jsonResponse);
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', responseBody);
    }
  });
}).on('error', (error) => {
  console.error('Request Error:', error);
});
