// Günlük Fıkıh Kartları Verileri
export const FIQH_CATEGORIES = [
  { id: 'namaz', name: 'Namaz', icon: '🕌', color: '#2ecc71' },
  { id: 'oruc', name: 'Oruç', icon: '🌙', color: '#9b59b6' },
  { id: 'zekat', name: 'Zekât', icon: '💰', color: '#f39c12' },
  { id: 'hac', name: 'Hac', icon: '🕋', color: '#1abc9c' },
  { id: 'temizlik', name: 'Temizlik', icon: '💧', color: '#3498db' },
  { id: 'helal-haram', name: 'Helal-Haram', icon: '⚖️', color: '#e74c3c' }
];

export const FIQH_CARDS = [
  // Namaz
  {
    id: 1,
    category: 'namaz',
    title: 'Namazda Kıbleyi Şaşırmak',
    question: 'Namaz kılarken kıbleyi yanlış yöne döndüğümüzü anlarsak ne yapmalıyız?',
    answer: 'Namaz esnasında kıbleyi yanlış tarafa döndüğümüzü anlarsak, hemen kıbleye dönmeli ve namaza devam etmeliyiz. Namaz bozulmaz.',
    source: 'Hanefi Fıkhı',
    level: 'Temel'
  },
  {
    id: 2,
    category: 'namaz',
    title: 'Secdede Eller Nereye Konulur?',
    question: 'Secdeye giderken eller mi önce yere değmeli, dizler mi?',
    answer: 'Hanefi mezhebine göre önce dizler, sonra eller yere konulur. Kalkışta ise önce eller, sonra dizler kaldırılır.',
    source: 'Hanefi Fıkhı',
    level: 'Temel'
  },
  {
    id: 3,
    category: 'namaz',
    title: 'Farz Namazın Vakti Geçerse',
    question: 'Farz namaz vakti geçerse ne yapılır?',
    answer: 'Farz namazı vaktinde kılmak farzdır. Vakti geçerse, ilk fırsatta kaza edilmesi gerekir. Kaza namazı da farz hükmündedir.',
    source: 'İslam Fıkhı',
    level: 'Temel'
  },
  // Oruç
  {
    id: 4,
    category: 'oruc',
    title: 'Oruçluyken Diş Macunu Kullanmak',
    question: 'Oruçluyken diş fırçalamak orucu bozar mı?',
    answer: 'Diş macununu yutmamak şartıyla oruç bozulmaz. Ancak ihtiyaten sahur ve iftar arasında misvak kullanmak veya macunsuz fırçalamak tavsiye edilir.',
    source: 'Hanefi Fıkhı',
    level: 'Temel'
  },
  {
    id: 5,
    category: 'oruc',
    title: 'Oruçluyken İğne Yaptırmak',
    question: 'Oruçluyken iğne yaptırmak orucu bozar mı?',
    answer: 'Kas içine veya deri altına yapılan iğneler (ağrı kesici, antibiyotik vb.) orucu bozmaz. Ancak besleyici iğneler ve serumlar orucu bozar.',
    source: 'Diyanet İşleri Başkanlığı',
    level: 'Orta'
  },
  // Temizlik
  {
    id: 6,
    category: 'temizlik',
    title: 'Gusül Gerektiren Haller',
    question: 'Hangi durumlarda gusül abdesti almak farzdır?',
    answer: '1) Cünüplük, 2) Hayız (adet) halinin sona ermesi, 3) Nifas (lohusalık) halinin sona ermesi. Bu durumlarda namaz kılmak ve Kur\'an okumak için gusül şarttır.',
    source: 'İslam Fıkhı',
    level: 'Temel'
  },
  {
    id: 7,
    category: 'temizlik',
    title: 'Abdesti Bozan Durumlar',
    question: 'Hangi durumlar abdesti bozar?',
    answer: '1) Önden veya arkadan herhangi bir şeyin çıkması, 2) Vücuttan kan, irin vb. akması, 3) Aklı gideren durumlar (uyku, bayılma), 4) Kahkaha ile gülmek (namaz içinde).',
    source: 'Hanefi Fıkhı',
    level: 'Temel'
  },
  // Helal-Haram
  {
    id: 8,
    category: 'helal-haram',
    title: 'Jelatin Helal mi?',
    question: 'Gıdalardaki jelatin helal midir?',
    answer: 'Jelatin, hayvansal veya bitkisel kaynaklı olabilir. Balık veya bitkisel kaynaklı jelatin helaldir. Domuz kaynaklı jelatin kesinlikle haramdır. Sığır/koyun jelatini ise helal kesim şartına bağlıdır.',
    source: 'Diyanet Fetva Kurulu',
    level: 'Orta'
  }
];

// Günün kartını belirle (tarih bazlı)
export const getTodayCard = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return FIQH_CARDS[dayOfYear % FIQH_CARDS.length];
};
