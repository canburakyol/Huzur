const MIN_PARTIAL_MATCH_LENGTH = 12;

export const ASSISTANT_FAQ_ITEMS = [
  {
    key: 'assistant.questions.q1',
    answer: 'Namaz için önce abdest alınır, vakit girdikten sonra kıbleye dönülüp niyet edilir. İftitah tekbiri ile başlanır; kıyam, rüku, secde ve oturuşlar sırasıyla tamamlanır, son oturuşta tahiyyat okunup selam verilerek namaz bitirilir.',
  },
  {
    key: 'assistant.questions.q2',
    answer: 'Bilerek yemek veya içmek, cinsel ilişki, sigara içmek ve besleyici iğne yaptırmak orucu bozar. İhtilaflı durumlarda güvenilir bir ilmihal kaynağına veya din görevlisine danışmak en güvenli yoldur.',
  },
  {
    key: 'assistant.questions.q3',
    answer: 'Zekat; fakirlere, miskinlere, borçlulara, yolda kalmışlara ve Tevbe suresi 60. ayette sayılan diğer hak sahiplerine verilir. Anne, baba, dede, nine, çocuk ve torunlara zekat verilmez.',
  },
  {
    key: 'assistant.questions.q4',
    answer: 'Abdestte niyet edilir; eller, ağız, burun, yüz ve kollar yıkanır. Baş mesh edilir, ardından ayaklar topuklarla birlikte yıkanarak abdest tamamlanır.',
  },
  {
    key: 'assistant.questions.q5',
    answer: "Kur'an okumak ibadettir; her harfine sevap vardır. Düzenli ve anlayarak okumak kalbi diri tutar, huzur verir ve kişinin dini bilgisini güçlendirir.",
  },
  {
    key: 'assistant.questions.q6',
    answer: "Peygamberimiz Hz. Muhammed (sav), 571 yılında Mekke'de doğdu; 40 yaşında peygamberlikle görevlendirildi. Mekke ve Medine dönemlerinde İslam'ı tebliğ etti, 632 yılında Medine'de vefat etti.",
  },
];

export const normalizeAssistantFaqText = (value) => (
  String(value || '')
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

export const findAssistantFaqItem = (query, t) => {
  const normalizedQuery = normalizeAssistantFaqText(query);
  if (!normalizedQuery) {
    return null;
  }

  const itemsWithText = ASSISTANT_FAQ_ITEMS.map((item) => ({
    ...item,
    normalizedQuestion: normalizeAssistantFaqText(t(item.key)),
  }));

  const directMatch = itemsWithText.find((item) => item.normalizedQuestion === normalizedQuery);
  if (directMatch) {
    return directMatch;
  }

  if (normalizedQuery.length < MIN_PARTIAL_MATCH_LENGTH) {
    return null;
  }

  return itemsWithText.find((item) => (
    item.normalizedQuestion.includes(normalizedQuery) ||
    normalizedQuery.includes(item.normalizedQuestion)
  )) || null;
};

export const getAssistantFaqAnswer = (query, t) => {
  const matchedItem = findAssistantFaqItem(query, t);
  if (matchedItem) {
    return matchedItem.answer;
  }

  return t(
    'assistant.betaUnknownQuestion',
    'Bu bolum su an hazir soru-cevap modunda calisiyor. Asagidaki ornek sorulardan birini secebilirsiniz.'
  );
};
