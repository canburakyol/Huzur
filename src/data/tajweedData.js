// Tecvid Kuralları Verisi - Diyanet & MEB Standartlarına Uygun
export const TAJWEED_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

export const tajweedData = [
  // --- BAŞLANGIÇ SEVİYESİ (LEVEL 1: TEMEL VE SAKİN NUN KURALLARI) ---
  {
    id: 'med_tabii',
    level: TAJWEED_LEVELS.BEGINNER,
    title: 'tajweed.rules.med_tabii.title',
    color: '#8B5CF6', 
    description: 'tajweed.rules.med_tabii.desc',
    rule: 'tajweed.rules.med_tabii.rule',
    letters: ['ا', 'و', 'ي'],
    examples: [
      { text: "قَالَ", transliteration: "Kâle", explanation: "tajweed.rules.med_tabii.examples.0.explanation", surah: 2, ayah: 30 },
      { text: "يَقُولُ", transliteration: "Yekûlü", explanation: "tajweed.rules.med_tabii.examples.1.explanation", surah: 2, ayah: 8 }
    ]
  },
  {
    id: 'izhar',
    level: TAJWEED_LEVELS.BEGINNER,
    title: 'tajweed.rules.izhar.title',
    color: '#3498db',
    description: 'tajweed.rules.izhar.desc',
    rule: 'tajweed.rules.izhar.rule',
    letters: ['أ', 'ه', 'ع', 'ح', 'غ', 'خ'],
    examples: [
      { text: "مِنْ خَوْفٍ", transliteration: "Min havf", explanation: "tajweed.rules.izhar.examples.0.explanation", surah: 106, ayah: 4 },
      { text: "عَذَابٌ أَلِيمٌ", transliteration: "Azâbun elîm", explanation: "tajweed.rules.izhar.examples.1.explanation", surah: 2, ayah: 10 }
    ]
  },
  {
    id: 'idgam_meal_gunne',
    level: TAJWEED_LEVELS.BEGINNER,
    title: 'tajweed.rules.idgam_meal_gunne.title',
    color: '#EF4444', 
    description: 'tajweed.rules.idgam_meal_gunne.desc',
    rule: 'tajweed.rules.idgam_meal_gunne.rule',
    letters: ['ي', 'م', 'ن', 'و'],
    makhrajImage: '/assets/tajweed/makhraj_nasal.png',
    examples: [
      { text: "مَن يَقُولُ", transliteration: "Meyyekûlü", explanation: "tajweed.rules.idgam_meal_gunne.examples.0.explanation", surah: 2, ayah: 8 },
      { text: "مِن مَالٍ", transliteration: "Mimmâlin", explanation: "tajweed.rules.idgam_meal_gunne.examples.1.explanation", surah: 111, ayah: 2 }
    ]
  },
  {
    id: 'idgam-bila-gunne',
    level: TAJWEED_LEVELS.BEGINNER,
    title: 'tajweed.rules.idgam-bila-gunne.title',
    color: '#e74c3c',
    description: 'tajweed.rules.idgam-bila-gunne.desc',
    rule: 'tajweed.rules.idgam-bila-gunne.rule',
    letters: ['ل', 'ر'],
    examples: [
      { text: "مِن رَبِّهِمْ", transliteration: "Mirrabbihim", explanation: "tajweed.rules.idgam-bila-gunne.examples.0.explanation", surah: 2, ayah: 5 },
      { text: "هُدًى لِلْمُتَّقِينَ", transliteration: "Hüdel-lil-müttekîn", explanation: "tajweed.rules.idgam-bila-gunne.examples.1.explanation", surah: 2, ayah: 2 }
    ]
  },
  {
    id: 'ihfa',
    level: TAJWEED_LEVELS.BEGINNER,
    title: 'tajweed.rules.ihfa.title',
    color: '#9b59b6',
    description: 'tajweed.rules.ihfa.desc',
    rule: 'tajweed.rules.ihfa.rule',
    letters: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'],
    makhrajImage: '/assets/tajweed/makhraj_nasal.png',
    examples: [
      { text: "أَنزَلْنَا", transliteration: "Enzelnâ", explanation: "tajweed.rules.ihfa.examples.0.explanation", surah: 97, ayah: 1 },
      { text: "مِن شَرِّ", transliteration: "Min şerri", explanation: "tajweed.rules.ihfa.examples.1.explanation", surah: 113, ayah: 2 }
    ]
  },
  {
    id: 'iklab',
    level: TAJWEED_LEVELS.BEGINNER,
    title: 'tajweed.rules.iklab.title',
    color: '#f1c40f',
    description: 'tajweed.rules.iklab.desc',
    rule: 'tajweed.rules.iklab.rule',
    letters: ['ب'],
    makhrajImage: '/assets/tajweed/makhraj_nasal.png',
    examples: [
      { text: "مِن بَعْدِ", transliteration: "Mim ba'di", explanation: "tajweed.rules.iklab.examples.0.explanation", surah: 2, ayah: 27 },
      { text: "سَمِيعٌ بَصِيرٌ", transliteration: "Semîum basîr", explanation: "tajweed.rules.iklab.examples.1.explanation", surah: 22, ayah: 75 }
    ]
  },

  // --- ORTA SEVİYE (LEVEL 2: KALKALE VE DİĞERLERİ) ---
  {
    id: 'kalkale',
    level: TAJWEED_LEVELS.INTERMEDIATE,
    title: 'tajweed.rules.kalkale.title',
    color: '#e67e22',
    description: 'tajweed.rules.kalkale.desc',
    rule: 'tajweed.rules.kalkale.rule',
    letters: ['ق', 'ط', 'ب', 'ج', 'د'],
    examples: [
      { text: "قُلْ أَعُوذُ", transliteration: "Kul eûzü", explanation: "tajweed.rules.kalkale.examples.0.explanation", surah: 113, ayah: 1 },
      { text: "لَمْ يَلِدْ", transliteration: "Lem yelid", explanation: "tajweed.rules.kalkale.examples.1.explanation", surah: 112, ayah: 3 }
    ]
  },
  {
    id: 'ra_hukmu',
    level: TAJWEED_LEVELS.INTERMEDIATE,
    title: 'tajweed.rules.ra_hukmu.title',
    color: '#718096',
    description: 'tajweed.rules.ra_hukmu.desc',
    rule: 'tajweed.rules.ra_hukmu.rule',
    letters: ['ر'],
    examples: [
      { text: "رَبِّ الْعَالَمِينَ", transliteration: "Rabbil âlemîn", explanation: "tajweed.rules.ra_hukmu.examples.0.explanation", surah: 1, ayah: 2 }
    ]
  },

  // --- İLERİ SEVİYE (LEVEL 3: FER'İ MEDLER) ---
  {
    id: 'med_muttasil',
    level: TAJWEED_LEVELS.ADVANCED,
    title: 'tajweed.rules.med_muttasil.title',
    color: '#10B981',
    description: 'tajweed.rules.med_muttasil.desc',
    rule: 'tajweed.rules.med_muttasil.rule',
    letters: ['ا', 'و', 'ي'],
    examples: [
      { text: "جَآءَ", transliteration: "Câee", explanation: "tajweed.rules.med_muttasil.examples.0.explanation", surah: 110, ayah: 1 }
    ]
  }
];

export const getTajweedRule = (id) => tajweedData.find(r => r.id === id);
export const getRulesByLevel = (level) => tajweedData.filter(r => r.level === level);

export default tajweedData;
