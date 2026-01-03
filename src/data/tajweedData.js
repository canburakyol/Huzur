export const tajweedData = [
  {
    id: 'idgam_meal_gunne',
    title: 'tajweed.rules.idgam_meal_gunne.title',
    color: '#EF4444', // Kırmızı
    description: 'tajweed.rules.idgam_meal_gunne.desc',
    rule: 'tajweed.rules.idgam_meal_gunne.rule',
    letters: ['ي', 'م', 'ن', 'و'],
    examples: [
      { text: "مَن يَقُولُ", transliteration: "Meyyekûlü", explanation: "tajweed.rules.idgam_meal_gunne.examples.0.explanation", surah: 2, ayah: 8 },
      { text: "مِن مَالٍ", transliteration: "Mimmâlin", explanation: "tajweed.rules.idgam_meal_gunne.examples.1.explanation", surah: 111, ayah: 2 }
    ]
  },
  {
    id: 'idgam-bila-gunne',
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
    title: 'tajweed.rules.ihfa.title',
    color: '#9b59b6',
    description: 'tajweed.rules.ihfa.desc',
    rule: 'tajweed.rules.ihfa.rule',
    letters: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'f', 'q', 'k'],
    examples: [
      { text: "أَنزَلْنَا", transliteration: "Enzelnâ", explanation: "tajweed.rules.ihfa.examples.0.explanation", surah: 97, ayah: 1 },
      { text: "مِن شَرِّ", transliteration: "Min şerri", explanation: "tajweed.rules.ihfa.examples.1.explanation", surah: 113, ayah: 2 }
    ]
  },
  {
    id: 'izhar',
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
    id: 'iklab',
    title: 'tajweed.rules.iklab.title',
    color: '#f1c40f',
    description: 'tajweed.rules.iklab.desc',
    rule: 'tajweed.rules.iklab.rule',
    letters: ['ب'],
    examples: [
      { text: "مِن بَعْدِ", transliteration: "Mim ba'di", explanation: "tajweed.rules.iklab.examples.0.explanation", surah: 2, ayah: 27 },
      { text: "سَمِيعٌ بَصِيرٌ", transliteration: "Semîum basîr", explanation: "tajweed.rules.iklab.examples.1.explanation", surah: 22, ayah: 75 }
    ]
  },
  {
    id: 'kalkale',
    title: 'tajweed.rules.kalkale.title',
    color: '#e67e22',
    description: 'tajweed.rules.kalkale.desc',
    rule: 'tajweed.rules.kalkale.rule',
    letters: ['ق', 'ط', 'b', 'j', 'd'],
    examples: [
      { text: "قُلْ أَعُوذُ", transliteration: "Kul eûzü", explanation: "tajweed.rules.kalkale.examples.0.explanation", surah: 113, ayah: 1 },
      { text: "لَمْ يَلِدْ", transliteration: "Lem yelid", explanation: "tajweed.rules.kalkale.examples.1.explanation", surah: 112, ayah: 3 }
    ]
  }
];

export const getTajweedRule = (id) => tajweedData.find(r => r.id === id);

export default tajweedData;
