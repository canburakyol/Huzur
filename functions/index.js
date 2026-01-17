const functions = require('firebase-functions');
const axios = require('axios');

// Gemini API endpoint
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Gemini AI Proxy Function
 * API anahtarını client'dan gizler
 */
exports.queryGemini = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    
    // 1. Authentication kontrolü
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Bu işlem için giriş yapmanız gerekiyor.'
      );
    }

    // 2. Input validation
    if (!data.prompt || typeof data.prompt !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Geçersiz prompt.'
      );
    }

    try {
      // 3. Gemini API çağrısı
      // Config: firebase functions:config:set gemini.apikey="AIza..."
      const apiKey = functions.config().gemini?.apikey;
      
      if (!apiKey) {
        console.error('Gemini API Key bulunamadı!');
        throw new functions.https.HttpsError(
          'internal',
          'Sunucu yapılandırma hatası (API Key eksik).'
        );
      }

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
          contents: [
            {
              parts: [{ text: data.prompt }]
            }
          ],
          generationConfig: data.generationConfig || {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        },
        {
          timeout: 30000 // 30 saniye timeout
        }
      );

      // 4. Response döndür
      if (response.data.candidates && response.data.candidates[0]?.content?.parts?.[0]?.text) {
        return {
          success: true,
          content: response.data.candidates[0].content.parts[0].text
        };
      }

      // Safety filter kontrolü
      if (response.data.candidates?.[0]?.finishReason === 'SAFETY') {
        return {
          success: false,
          error: 'Bu soru güvenlik filtreleri tarafından engellendi.'
        };
      }

      throw new Error('Beklenmeyen API yanıtı');

    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 429) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'Çok fazla istek. Lütfen bekleyin.'
        );
      }
      
      if (error.response?.status === 403) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'API anahtarı geçersiz.'
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Bir hata oluştu. Lütfen tekrar deneyin.'
      );
    }
  });
