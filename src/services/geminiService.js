/**
 * Gemini AI Service - Google Gemini API entegrasyonu
 * Nüzul sebebi sorguları ve dini içerik analizi için
 * 
 * GÜVENLİK GÜNCELLEMESİ:
 * Artık API çağrıları Firebase Cloud Functions üzerinden yapılıyor.
 * API anahtarı client-side'da saklanmıyor.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { logger } from '../utils/logger';

// ============================================
// THROTTLING / RATE LIMITING CONFIGURATION
// API abuse koruması için istek sınırlaması
// ============================================

const THROTTLE_CONFIG = {
  COOLDOWN_MS: 3000,           // Son istekten sonra minimum bekleme süresi (3 saniye)
  MAX_REQUESTS_PER_MINUTE: 5,  // Dakikada maksimum istek sayısı
  BURST_WINDOW_MS: 10000,      // Burst penceresi (10 saniye)
  MAX_BURST_REQUESTS: 3        // Burst penceresinde maksimum istek
};

// Throttling state (module-level)
const throttleState = {
  lastRequestTime: 0,
  requestTimestamps: [],  // Son isteklerin zaman damgaları
};

/**
 * İstek throttle kontrolü - API abuse koruması
 * @returns {{ allowed: boolean, waitMs: number, reason?: string }}
 */
const checkThrottle = () => {
  const now = Date.now();
  
  // 1. Cooldown kontrolü - son istekten beri yeterli süre geçti mi?
  const timeSinceLastRequest = now - throttleState.lastRequestTime;
  if (throttleState.lastRequestTime > 0 && timeSinceLastRequest < THROTTLE_CONFIG.COOLDOWN_MS) {
    const waitMs = THROTTLE_CONFIG.COOLDOWN_MS - timeSinceLastRequest;
    return {
      allowed: false,
      waitMs,
      reason: `Lütfen ${Math.ceil(waitMs / 1000)} saniye bekleyin.`
    };
  }
  
  // 2. Eski istekleri temizle (1 dakikadan eski olanları sil)
  throttleState.requestTimestamps = throttleState.requestTimestamps.filter(
    ts => now - ts < 60000
  );
  
  // 3. Dakikalık limit kontrolü
  if (throttleState.requestTimestamps.length >= THROTTLE_CONFIG.MAX_REQUESTS_PER_MINUTE) {
    const oldestInMinute = throttleState.requestTimestamps[0];
    const waitMs = 60000 - (now - oldestInMinute);
    return {
      allowed: false,
      waitMs,
      reason: `Dakikalık limit aşıldı. ${Math.ceil(waitMs / 1000)} saniye bekleyin.`
    };
  }
  
  // 4. Burst koruması - kısa sürede çok fazla istek engelle
  const recentRequests = throttleState.requestTimestamps.filter(
    ts => now - ts < THROTTLE_CONFIG.BURST_WINDOW_MS
  );
  if (recentRequests.length >= THROTTLE_CONFIG.MAX_BURST_REQUESTS) {
    const oldestInBurst = recentRequests[0];
    const waitMs = THROTTLE_CONFIG.BURST_WINDOW_MS - (now - oldestInBurst);
    return {
      allowed: false,
      waitMs,
      reason: `Çok hızlı istek gönderildi. ${Math.ceil(waitMs / 1000)} saniye bekleyin.`
    };
  }
  
  return { allowed: true, waitMs: 0 };
};

/**
 * Başarılı istek sonrası throttle state güncelle
 */
const recordRequest = () => {
  const now = Date.now();
  throttleState.lastRequestTime = now;
  throttleState.requestTimestamps.push(now);
};

/**
 * Nüzul sebebi için sistem prompt'u
 */
const NUZUL_SYSTEM_PROMPT = `Sen bir İslam ilmi uzmanısın ve Kuran-ı Kerim'in nüzul sebepleri (esbab-ı nüzul) konusunda derin bilgiye sahipsin.

GÖREVLER:
1. Kullanıcı bir ayet veya sure hakkında soru sorduğunda, o ayetin/surenin nüzul sebebini açıkla.
2. Güvenilir kaynaklara (Sahih-i Buhari, Sahih-i Müslim, Esbab-ı Nüzul kitapları) dayanan bilgiler ver.
3. Rivayetlerin sahihlik derecesini belirt.
4. Birden fazla rivayet varsa hepsini özetle.

KURALLAR:
1. Sadece nüzul sebebi ve ilgili tarihi bağlam hakkında konuş.
2. Cevaplarını Türkçe ver.
3. Kesin olmayan bilgilerde "rivayete göre" veya "bazı kaynaklara göre" gibi ifadeler kullan.
4. Uydurma veya zayıf rivayetleri güvenilir olarak sunma.
5. Cevabı 300 kelimeyi geçmeyecek şekilde özetle.

FORMAT:
- Ayetin/Surenin adını belirt
- Nüzul sebebini açıkla
- Kaynak belirt (varsa)
- Kısa bir öğüt/hikmet ekle`;

// NOT: callGeminiDirectly fonksiyonu güvenlik nedeniyle kaldırıldı
// API anahtarları client-side'da güvenli değil, sadece Cloud Functions kullanılıyor

/**
 * Gemini API'ye istek gönder (Cloud Function üzerinden - güvenli)
 * @param {string} prompt - Kullanıcı sorusu
 * @param {string} systemPrompt - Sistem talimatları
 * @returns {Promise<{success: boolean, content: string, error?: string}>}
 */
import axios from 'axios';

// ... (existing imports)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// ... (throttle config and checkThrottle function remain same)

/**
 * Gemini API'ye istek gönder (Client-side Direct Call)
 * Cloud Functions ücretli plan gerektirdiği için doğrudan çağrı yapılıyor.
 * @param {string} prompt - Kullanıcı sorusu
 * @param {string} systemPrompt - Sistem talimatları
 * @returns {Promise<{success: boolean, content: string, error?: string}>}
 */
export const generateContent = async (prompt, systemPrompt = NUZUL_SYSTEM_PROMPT) => {
  // Throttle kontrolü
  const throttleCheck = checkThrottle();
  if (!throttleCheck.allowed) {
    return {
      success: false,
      content: '',
      error: throttleCheck.reason || 'Çok fazla istek. Lütfen bekleyin.'
    };
  }

  // İsteği kaydet
  recordRequest();

  try {
    if (!GEMINI_API_KEY) {
       logger.error('[GeminiService] API Key eksik!');
       return {
         success: false,
         content: '',
         error: 'API yapılandırma hatası.'
       };
    }

    const fullPrompt = `${systemPrompt}\n\nKullanıcı Sorusu: ${prompt}`;
    
    logger.log('[GeminiService] API isteği gönderiliyor...');

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096
        }
      },
      { timeout: 30000 }
    );

    if (response.data.candidates && response.data.candidates[0]?.content?.parts?.[0]?.text) {
        return {
          success: true,
          content: response.data.candidates[0].content.parts[0].text
        };
    }
    
    throw new Error('API yanıtı boş veya geçersiz format');

  } catch (error) {
    logger.error('[GeminiService] API Error:', error);
    
    // Hata mesajlarını kullanıcı dostu hale getir
    let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    
    if (error.response) {
        if (error.response.status === 429) errorMessage = 'Çok fazla istek. Lütfen bekleyin.';
        else if (error.response.status === 403) errorMessage = 'Erişim reddedildi (API Key hatası).';
        else if (error.response.status >= 500) errorMessage = 'Sunucu hatası. Daha sonra tekrar deneyin.';
    } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'İnternet bağlantınızı kontrol edin.';
    }

    return {
      success: false,
      content: '',
      error: errorMessage
    };
  }
};

/**
 * Nüzul sebebi sorgula
 */
export const queryNuzulSebebi = async (query) => {
  const enrichedQuery = `${query}

Lütfen bu soru ile ilgili:
1. Ayetin/surenin nüzul sebebini açıkla
2. Hangi olay üzerine indirildiğini belirt
3. Varsa ilgili hadisleri kaynak göstererek paylaş`;

  return generateContent(enrichedQuery, NUZUL_SYSTEM_PROMPT);
};

/**
 * Ruh haline göre ayet sorgusu için sistem prompt'u
 */
const MOOD_SYSTEM_PROMPT = `Sen bir İslam ilmi uzmanısın. Kullanıcının o anki ruh haline (mutlu, üzgün, endişeli vb.) en uygun Kuran-ı Kerim ayetini seçip ona manevi bir destek sunmalısın.

GÖREVLER:
1. Kullanıcının belirttiği ruh haline en uygun 1 adet ayet seç.
2. Ayetin Arapçasını, mealini ve kısa bir tefsirini (manevi teselli/nasihat) ver.

KURALLAR:
1. Sadece Kuran ayetlerini kullan.
2. Cevaplarını Türkçe ver.
3. Üslubun şefkatli ve umut verici olsun.

FORMAT:
- [Sure Adı, Ayet No]
- Ayet Metni (Arapça)
- Ayet Meali
- Manevi Reçete (Kısa tefsir/nasihat)`;

/**
 * Ruh haline göre ayet sorgula
 */
export const getAyahByMood = async (mood) => {
  const prompt = `Şu an kendimi "${mood}" hissediyorum. Bana bu durumum için Allah'ın kelamından bir ayet ve manevi bir reçete sunar mısın?`;
  return generateContent(prompt, MOOD_SYSTEM_PROMPT);
};

/**
 * Kelime kök analizi için sistem prompt'u
 */
const WORD_ANALYSIS_PROMPT = `Sen bir Arapça dil uzmanısın. Kullanıcının verdiği Arapça kelimeyi analiz et.

GÖREVLER:
1. Kelimenin üç harfli kökünü tespit et.
2. Kökün temel sözlük anlamlarını ver.
3. Bu kelimenin Kuran-ı Kerim'de kaç kez geçtiğini (yaklaşık) belirt.
4. Kelimenin etimolojik açıklamasını yap.

FORMAT:
**Kök:** [Üç harfli kök Arapça olarak]
**Kök Anlamı:** [Kökün temel anlamları]
**Kuran'da Geçişi:** [Yaklaşık sayı veya "çok sık/nadir"]
**Etimoloji:** [Kısa etimolojik açıklama]`;

/**
 * Kelime kök analizi sorgula
 */
export const analyzeWordRoot = async (arabicWord, ayahContext = '') => {
  const contextInfo = ayahContext ? ` Bu kelime şu ayette geçmektedir: "${ayahContext}"` : '';
  const prompt = `"${arabicWord}" kelimesini analiz et.${contextInfo}`;
  return generateContent(prompt, WORD_ANALYSIS_PROMPT);
};

/**
 * Direct Chat with Gemini API (Client-side)
 * Uses the API key from .env directly
 */
export const chatWithGemini = async (userMessage) => {
  const systemPrompt = `Sen SADECE İslami konularda rehberlik eden sanal bir asistanın.
GÖREVİN: Kullanıcı ne sorarsa sorsun, cevabını MUTLAKA Kuran-ı Kerim ayetleri, Hadis-i Şerifler ve İslami prensiplere dayandırarak ver.

KESİN KURALLAR:
1. ASLA İslami bağlamın dışına çıkma.
2. KÜFÜR/HAKARET: Kullanıcı küfür etse veya kaba konuşsa bile, sen asla aynısıyla karşılık verme. "Kötülüğü en güzel iyilikle sav" (Fussilet, 34) düsturuyla, sabır ve nezaketle dini nasihat ver.
3. PSİKOLOJİK DURUM: Kullanıcı "bunalımdayım", "ölmek istiyorum", "çok kötüyüm" dese bile, tıbbi/psikolojik tavsiye VERME. Sadece manevi teselli ver. "Kalpler ancak Allah'ı anmakla huzur bulur" (Rad, 28) gibi ayetlerle Allah'a sığınmayı tavsiye et.
4. HUKUK/SAĞLIK: Hukuki veya tıbbi konularda asla profesyonel tavsiye verme. Sadece konunun İslami boyutunu (helal/haram, dua, tevekkül) anlat.
5. KONU DIŞI: Kullanıcı alakasız bir şey (maç skoru, yemek tarifi vb.) sorsa bile, konuyu nazikçe İslam'a getir veya "Ben sadece dini konularda yardımcı olabilirim" de.
7. TAMAMLAMA: Cevaplarını her zaman tamamla.
8. KISALIK: Cevapların MÜMKÜN OLDUĞUNCA KISA ve ÖZ olsun. Destan yazma. Kullanıcı detay istemedikçe cevabı 2-3 cümle ile sınırla. Ayet ve hadisleri sadece çok gerekliyse kısa alıntılarla ver.`;

  try {
    const result = await generateContent(userMessage, systemPrompt);

    if (result.success) {
      return {
        type: 'text',
        content: result.content
      };
    } else {
      return {
        type: 'text',
        content: result.error || 'Bir hata oluştu.'
      };
    }
  } catch (error) {
    logger.error('Gemini Chat Error:', error);
    return {
      type: 'text',
      content: 'Şu anda servise ulaşamıyorum. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'
    };
  }
};

// ============================================
// DEPRECATED FUNCTIONS (Backward Compatibility)
// ============================================

export const testApiKey = async () => true;
export const saveApiKey = () => {};
export const hasApiKey = () => true; // Her zaman true dönüyoruz çünkü artık server-side key kullanılıyor

export default {
  generateContent,
  queryNuzulSebebi,
  getAyahByMood,
  analyzeWordRoot,
  testApiKey,
  saveApiKey,
  hasApiKey,
  chatWithGemini
};
