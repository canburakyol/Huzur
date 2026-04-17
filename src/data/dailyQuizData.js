export const QUIZ_CATEGORIES = {
  SIYER: 'Siyer',
  FIKIH: 'Fıkıh',
  KURAN: 'Kuran-ı Kerim',
  HADIS: 'Hadis'
};

export const DAILY_QUIZ_QUESTIONS = [
  { id: 'q1', category: QUIZ_CATEGORIES.SIYER, question: 'Peygamber Efendimiz (s.a.v) hangi yılda doğmuştur?', options: ['570', '571', '610', '622'], answer: 1 },
  { id: 'q2', category: QUIZ_CATEGORIES.KURAN, question: 'Kur\'an-ı Kerim\'in en uzun suresi hangisidir?', options: ['Yasin', 'Mülk', 'Bakara', 'Al-i İmran'], answer: 2 },
  { id: 'q3', category: QUIZ_CATEGORIES.FIKIH, question: 'Aşağıdakilerden hangisi abdestin farzlarından biri değildir?', options: ['Yüzü yıkamak', 'Kolları yıkamak', 'Ağza su vermek', 'Ayakları yıkamak'], answer: 2 },
  { id: 'q4', category: QUIZ_CATEGORIES.HADIS, question: '"Ameller niyetlere göredir." hadisini kim rivayet etmiştir?', options: ['Buhari', 'Tirmizi', 'Ebu Davud', 'İbn Mace'], answer: 0 },
  { id: 'q5', category: QUIZ_CATEGORIES.SIYER, question: 'İlk vahiy nerede inmiştir?', options: ['Sevr Mağarası', 'Hira Mağarası', 'Kabe', 'Mescid-i Nebevi'], answer: 1 },
  { id: 'q6', category: QUIZ_CATEGORIES.KURAN, question: 'Kur\'an-ı Kerim kaç cüzden oluşur?', options: ['20', '30', '40', '114'], answer: 1 },
  { id: 'q7', category: QUIZ_CATEGORIES.FIKIH, question: 'Namazda Fatiha suresinden sonra okunan sureye ne ad verilir?', options: ['Besmele', 'Zamm-ı Sure', 'Sübhaneke', 'Tahiyyat'], answer: 1 },
  { id: 'q8', category: QUIZ_CATEGORIES.SIYER, question: 'Hz. Muhammed\'in (s.a.v) süt annesinin adı nedir?', options: ['Hz. Amine', 'Hz. Hatice', 'Halime', 'Hz. Fatıma'], answer: 2 },
  { id: 'q9', category: QUIZ_CATEGORIES.KURAN, question: '"Besmele" ile başlamayan tek sure hangisidir?', options: ['Fatiha', 'Tevbe', 'Yasin', 'Mülk'], answer: 1 },
  { id: 'q10', category: QUIZ_CATEGORIES.HADIS, question: '"Cennet annelerin ayakları altındadır." sözü kime aittir?', options: ['Hz. Ebubekir', 'Hz. Ömer', 'Hz. Muhammed (s.a.v)', 'Hz. Ali'], answer: 2 },
  { id: 'q11', category: QUIZ_CATEGORIES.FIKIH, question: 'Cuma namazı kimlere farzdır?', options: ['Sadece erkeklere', 'Sadece kadınlara', 'Herkese', 'Sadece yaşlılara'], answer: 0 },
  { id: 'q12', category: QUIZ_CATEGORIES.KURAN, question: 'Kur\'an-ı Kerim\'de adı geçen tek kadın kimdir?', options: ['Hz. Hatice', 'Hz. Ayşe', 'Hz. Meryem', 'Hz. Asiye'], answer: 2 },
  { id: 'q13', category: QUIZ_CATEGORIES.SIYER, question: 'Müslümanların ilk kıblesi neresidir?', options: ['Kabe', 'Mescid-i Aksa', 'Kuba Mescidi', 'Mescid-i Nebevi'], answer: 1 },
  { id: 'q14', category: QUIZ_CATEGORIES.FIKIH, question: 'Hangi durumda teyemmüm yapılır?', options: ['Su bulunmadığında', 'Zaman daraldığında', 'Yolculukta', 'Kış aylarında'], answer: 0 },
  { id: 'q15', category: QUIZ_CATEGORIES.HADIS, question: '"Kolaylaştırınız, zorlaştırmayınız..." hadisinin devamı nedir?', options: ['Korkutmayınız, müjdeleyiniz', 'Gülümseyiniz, ağlatmayınız', 'Müjdeleyiniz, nefret ettirmeyiniz', 'Öğretiniz, gizlemeyiniz'], answer: 2 }
];

// Günlük deterministik rastgele soru seçici
export const getDailyQuestions = () => {
  const today = new Date().toDateString();
  const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Seçilen soruları tutacak array
  const selected = [];
  const available = [...DAILY_QUIZ_QUESTIONS];
  
  // Günün tohumuyla rastgele 5 soru seç
  for(let i = 0; i < 5; i++) {
    if (available.length === 0) break;
    const index = (seed + i * 13) % available.length;
    selected.push(available[index]);
    available.splice(index, 1);
  }
  
  return selected;
};
