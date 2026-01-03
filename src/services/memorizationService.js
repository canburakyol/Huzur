/**
 * Hafızlık Takip Servisi
 * Spaced Repetition (Aralıklı Tekrar) Sistemi
 */

const MEMORIZATION_KEY = 'huzur_memorization_data';

/**
 * Ezber verilerini getir
 */
export const getMemorizationData = () => {
  try {
    const data = localStorage.getItem(MEMORIZATION_KEY);
    return data ? JSON.parse(data) : { surahs: [] };
  } catch {
    return { surahs: [] };
  }
};

/**
 * Ezber verilerini kaydet
 */
const saveMemorizationData = (data) => {
  localStorage.setItem(MEMORIZATION_KEY, JSON.stringify(data));
};

/**
 * Yeni bir sureyi ezber listesine ekle
 */
export const startMemorizing = (surahNumber) => {
  const data = getMemorizationData();
  
  if (data.surahs.find(s => s.number === surahNumber)) {
    return false; // Zaten listede
  }

  const newSurah = {
    number: surahNumber,
    startedAt: new Date().toISOString(),
    status: 'learning', // learning, reviewing, memorized
    progress: 0, // 0-100
    memorizedAyahs: [], // [1, 2, 3]
    nextReviewDate: null,
    level: 0, // Leitner box level (0-5)
    lastReviewDate: null
  };

  data.surahs.push(newSurah);
  saveMemorizationData(data);
  return true;
};

/**
 * Bir ayeti ezberlendi olarak işaretle
 */
export const markAyahMemorized = (surahNumber, ayahNumber, totalAyahs) => {
  const data = getMemorizationData();
  const surah = data.surahs.find(s => s.number === surahNumber);

  if (!surah) return false;

  if (!surah.memorizedAyahs.includes(ayahNumber)) {
    surah.memorizedAyahs.push(ayahNumber);
    surah.progress = Math.round((surah.memorizedAyahs.length / totalAyahs) * 100);
    
    // Tüm ayetler bittiyse statüsü güncelle
    if (surah.memorizedAyahs.length === totalAyahs) {
      surah.status = 'reviewing';
      surah.level = 1;
      // İlk tekrar: Yarın
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      surah.nextReviewDate = tomorrow.toISOString();
    }
    
    surah.lastActivity = new Date().toISOString();
    saveMemorizationData(data);
    return true;
  }
  
  return false;
};

/**
 * Tekrar yapıldı (Spaced Repetition mantığı)
 * quality: 1 (Zor), 2 (Orta), 3 (Kolay)
 */
export const reviewSurah = (surahNumber, quality) => {
  const data = getMemorizationData();
  const surah = data.surahs.find(s => s.number === surahNumber);

  if (!surah) return false;

  // Sonraki tekrar zamanını hesapla (Basitleştirilmiş SM-2)
  let intervalDays = 1;
  
  if (quality === 1) {
    surah.level = 1; // Başa dön
    intervalDays = 1;
  } else if (quality === 2) {
    surah.level = Math.max(1, surah.level); // Aynı kal
    intervalDays = Math.pow(2, surah.level); // 2^level gün
  } else {
    surah.level += 1; // İlerle
    intervalDays = Math.pow(2.5, surah.level); // 2.5^level gün
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + Math.round(intervalDays));
  
  surah.nextReviewDate = nextDate.toISOString();
  surah.lastReviewDate = new Date().toISOString();
  
  if (surah.level >= 5) {
    surah.status = 'memorized';
  }

  saveMemorizationData(data);
  return { nextReview: nextDate, level: surah.level };
};

/**
 * Bugün tekrar edilmesi gereken sureleri getir
 */
export const getDueReviews = () => {
  const data = getMemorizationData();
  const now = new Date();
  
  return data.surahs.filter(s => {
    if (s.status !== 'reviewing' && s.status !== 'memorized') return false;
    if (!s.nextReviewDate) return true;
    return new Date(s.nextReviewDate) <= now;
  });
};

/**
 * İstatistikleri getir
 */
export const getMemorizationStats = () => {
  const data = getMemorizationData();
  const totalSurahs = data.surahs.length;
  const memorizedSurahs = data.surahs.filter(s => s.status === 'memorized').length;
  const totalAyahs = data.surahs.reduce((acc, s) => acc + s.memorizedAyahs.length, 0);
  
  return {
    totalSurahs,
    memorizedSurahs,
    totalAyahs,
    learningCount: data.surahs.filter(s => s.status === 'learning').length,
    reviewCount: getDueReviews().length
  };
};

export default {
  getMemorizationData,
  startMemorizing,
  markAyahMemorized,
  reviewSurah,
  getDueReviews,
  getMemorizationStats
};
