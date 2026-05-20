export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const QUIZ_CATEGORIES = {
  SIYER: 'Siyer',
  FIKIH: 'Fıkıh',
  KURAN: 'Kuran-ı Kerim',
  HADIS: 'Hadis'
} as const;

export const DAILY_QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 'q1', category: QUIZ_CATEGORIES.SIYER, question: 'Peygamber Efendimiz (s.a.v) hangi yılda doğmuştur?', options: ['570', '571', '610', '622'], answer: 1, explanation: 'Hz. Muhammed (s.a.v), Fil Vakası\'ndan yaklaşık 50 gün sonra, Miladi 571 yılında Mekke\'de dünyaya gelmiştir.' },
  { id: 'q2', category: QUIZ_CATEGORIES.KURAN, question: 'Kur\'an-ı Kerim\'in en uzun suresi hangisidir?', options: ['Yasin', 'Mülk', 'Bakara', 'Al-i İmran'], answer: 2, explanation: 'Bakara Suresi 286 ayetten oluşur ve Kuran\'ın en uzun suresidir. Medine\'de inmiştir.' },
  { id: 'q3', category: QUIZ_CATEGORIES.FIKIH, question: 'Aşağıdakilerden hangisi abdestin farzlarından biri değildir?', options: ['Yüzü yıkamak', 'Kolları yıkamak', 'Ağza su vermek', 'Ayakları yıkamak'], answer: 2, explanation: 'Abdestin 4 farzı vardır: Yüzü yıkamak, kolları yıkamak, başın dörtte birini mesh etmek ve ayakları yıkamak. Ağza su vermek sünnettir.' },
  { id: 'q4', category: QUIZ_CATEGORIES.HADIS, question: '"Ameller niyetlere göredir." hadisini kim rivayet etmiştir?', options: ['Buhari', 'Tirmizi', 'Ebu Davud', 'İbn Mace'], answer: 0, explanation: 'Bu hadis-i şerif, Hz. Ömer (r.a.)\'den rivayet edilmiş ve Sahih-i Buhari\'nin ilk hadisidir. "Ameller niyetlere göredir" anlamına gelir.' },
  { id: 'q5', category: QUIZ_CATEGORIES.SIYER, question: 'İlk vahiy nerede inmiştir?', options: ['Sevr Mağarası', 'Hira Mağarası', 'Kabe', 'Mescid-i Nebevi'], answer: 1, explanation: 'İlk vahiy, 610 yılında Hira Mağarası\'nda Cebrail (a.s.) tarafından getirilmiştir. Alak Suresi\'nin ilk 5 ayeti nazil olmuştur.' },
  { id: 'q6', category: QUIZ_CATEGORIES.KURAN, question: 'Kur\'an-ı Kerim kaç cüzden oluşur?', options: ['20', '30', '40', '114'], answer: 1, explanation: 'Kuran-ı Kerim 30 cüzden oluşur. Her cüz yaklaşık 20 sayfadır ve Ramazan ayında her gün bir cüz okunması gelenektir.' },
  { id: 'q7', category: QUIZ_CATEGORIES.FIKIH, question: 'Namazda Fatiha suresinden sonra okunan sureye ne ad verilir?', options: ['Besmele', 'Zamm-ı Sure', 'Sübhaneke', 'Tahiyyat'], answer: 1, explanation: 'Fatiha\'dan sonra okunan kısa sureye "Zamm-ı Sure" denir. Namazın vaciplerinden biridir ve her rekatta okunur.' },
  { id: 'q8', category: QUIZ_CATEGORIES.SIYER, question: 'Hz. Muhammed\'in (s.a.v) süt annesinin adı nedir?', options: ['Hz. Amine', 'Hz. Hatice', 'Halime', 'Hz. Fatıma'], answer: 2, explanation: 'Hz. Muhammed (s.a.v), gelenek gereği çöl havasının sağlıklı olması için Halime es-Sa\'diye\'ye sütanneliğe verilmiştir ve 4-5 yıl yanında kalmıştır.' },
  { id: 'q9', category: QUIZ_CATEGORIES.KURAN, question: '"Besmele" ile başlamayan tek sure hangisidir?', options: ['Fatiha', 'Tevbe', 'Yasin', 'Mülk'], answer: 1, explanation: 'Tevbe (Berat) Suresi, besmele ile başlamayan tek suredir. Bunun sebebi, bu surenin müşriklere karşı sert uyarılar içermesidir.' },
  { id: 'q10', category: QUIZ_CATEGORIES.HADIS, question: '"Cennet annelerin ayakları altındadır." sözü kime aittir?', options: ['Hz. Ebubekir', 'Hz. Ömer', 'Hz. Muhammed (s.a.v)', 'Hz. Ali'], answer: 2, explanation: 'Bu hadis-i şerif Hz. Muhammed\'e (s.a.v) aittir. Annelerin değerini ve haklarını vurgulayan en önemli hadislerden biridir.' },
  { id: 'q11', category: QUIZ_CATEGORIES.FIKIH, question: 'Cuma namazı kimlere farzdır?', options: ['Sadece erkeklere', 'Sadece kadınlara', 'Herkese', 'Sadece yaşlılara'], answer: 0, explanation: 'Cuma namazı, hür, akıllı, ergen, mukim ve sağlıklı erkeklere farzdır. Kadınlar, yolcular ve hastalar için farz değildir.' },
  { id: 'q12', category: QUIZ_CATEGORIES.KURAN, question: 'Kur\'an-ı Kerim\'de adı geçen tek kadın kimdir?', options: ['Hz. Hatice', 'Hz. Ayşe', 'Hz. Meryem', 'Hz. Asiye'], answer: 2, explanation: 'Hz. Meryem, Kuran\'da adı geçen tek kadındır. Kuran\'da 34 kez ismi zikredilir ve Meryem Suresi onun adıyla anılır.' },
  { id: 'q13', category: QUIZ_CATEGORIES.SIYER, question: 'Müslümanların ilk kıblesi neresidir?', options: ['Kabe', 'Mescid-i Aksa', 'Kuba Mescidi', 'Mescid-i Nebevi'], answer: 1, explanation: 'Müslümanların ilk kıblesi Mescid-i Aksa (Kudüs) idi. 17 ay sonra kıble Kabe\'ye (Mekke) çevrilmiştir.' },
  { id: 'q14', category: QUIZ_CATEGORIES.FIKIH, question: 'Hangi durumda teyemmüm yapılır?', options: ['Su bulunmadığında', 'Zaman daraldığında', 'Yolculukta', 'Kış aylarında'], answer: 0, explanation: 'Teyemmüm, su bulunamadığında veya hastalık gibi sebeplerle su kullanılamadığında temiz toprak veya taş ile yapılan sembolik abdesttir.' },
  { id: 'q15', category: QUIZ_CATEGORIES.HADIS, question: '"Kolaylaştırınız, zorlaştırmayınız..." hadisinin devamı nedir?', options: ['Korkutmayınız, müjdeleyiniz', 'Gülümseyiniz, ağlatmayınız', 'Müjdeleyiniz, nefret ettirmeyiniz', 'Öğretiniz, gizlemeyiniz'], answer: 2, explanation: 'Bu hadis-i şerifin tam metni: "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz." İnsanları dinden soğutacak davranışlardan kaçınılmasını öğütler.' }
];

export const getDailyQuestions = (): QuizQuestion[] => {
  const today = new Date().toDateString();
  const seed = today.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

  const selected: QuizQuestion[] = [];
  const available = [...DAILY_QUIZ_QUESTIONS];

  for (let i = 0; i < 5; i++) {
    if (available.length === 0) break;
    const index = (seed + i * 13) % available.length;
    selected.push(available[index]);
    available.splice(index, 1);
  }

  return selected;
};
