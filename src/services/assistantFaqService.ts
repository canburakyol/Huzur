type TFn = (key: string, fallback?: string) => string;

export type FaqItem = {
  key: string;
  answer: string;
  normalizedQuestion?: string;
};

export const ASSISTANT_FAQ_ITEMS: FaqItem[] = [
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
  {
    key: 'assistant.questions.q7',
    answer: 'Gusül abdesti (boy abdesti) alırken niyet edilir ve sırasıyla ağza bolca su verilip çalkalanır (mazmaza), burna su çekilip temizlenir (istinşak) ve tüm vücut kuru yer kalmayacak şekilde tamamen yıkanır.',
  },
  {
    key: 'assistant.questions.q8',
    answer: 'Teheccüd namazı, yatsı namazından sonra gece uyuyup uyanarak kılınan iki ila sekiz rekatlık nafile bir namazdır. Gecenin son üçte birinde kılınması çok faziletlidir.',
  },
  {
    key: 'assistant.questions.q9',
    answer: "Kaçırılan farz namazlar, kaza niyetiyle kılınır. Örneğin; \"Niyet ettim vaktine yetişip de kılamadığım ilk sabah namazının farzını kaza etmeye\" denilerek kılınır. Sadece farzlar ve vitir namazı kaza edilir.",
  },
  {
    key: 'assistant.questions.q10',
    answer: 'Namazda farzın geciktirilmesi veya vacibin unutulması ya da geciktirilmesi durumunda yapılan düzeltme secdesidir. Son oturuşta salli-barik dualarından sonra sağa selam verilip iki kez secdeye gidilerek yapılır.',
  },
  {
    key: 'assistant.questions.q11',
    answer: 'Sadaka, Allah rızası için yapılan her türlü maddi ve manevi yardımdır. Belaları defeder, günahları temizler, kalbe huzur verir ve toplumsal yardımlaşmayı artırır.',
  },
  {
    key: 'assistant.questions.q12',
    answer: 'Ramazan ayında gücü yeten her Müslümanın vermesi vacip olan sadakadır. İhtiyaç sahiplerine Ramazan bayramından önce ulaştırılır. Zekat verilebilecek kişilere fitre de verilebilir.',
  },
  {
    key: 'assistant.questions.q13',
    answer: 'Dinen sefer sayılan bir mesafeye (yaklaşık 90 km) yolculuk eden kişi, gittiği yerde 15 günden az kalacaksa seferi sayılır. Seferi olan kişi 4 rekatlık farz namazları 2 rekat olarak kılar.',
  },
  {
    key: 'assistant.questions.q14',
    answer: "Farz ve vaciplerin dışında Allah'a yakınlaşmak amacıyla kılınan namazlardır. Duha (kuşluk), Teheccüd, Evvabin, Tahiyyetü'l-mescid ve Hacet namazları en bilinen nafile namazlardandır.",
  },
  {
    key: 'assistant.questions.q15',
    answer: "Tövbe, günahtan pişman olup bir daha yapmamaya karar vermektir. İçtenlikle af diledikten sonra iki rekat tövbe namazı kılmak ve Allah'a yalvarmak sünnettir.",
  },
  {
    key: 'assistant.questions.q16',
    answer: "Bin aydan daha hayırlı olduğu Kur'an'da bildirilen Kadir Gecesi'nde bolca Kur'an okunmalı, tövbe edilmeli, kaza ve nafile namazlar kılınmalı ve dua edilmelidir.",
  },
  {
    key: 'assistant.questions.q17',
    answer: 'Hac, gücü yeten, maddi ve bedeni durumu elverişli olan her Müslümana ömründe bir defa farzdır. Mekke\'deki kutsal mekanları (Kabe, Arafat vb.) belirli günlerde ziyaret ederek eda edilir.',
  },
  {
    key: 'assistant.questions.q18',
    answer: 'Kurban kesmek, belirli mali güce sahip olan Müslümanlar üzerine vacip olan bir ibadettir. Kurban Bayramı günlerinde Allah rızası için usulüne uygun şekilde kurbanlık hayvan kesilerek gerçekleştirilir.',
  },
  {
    key: 'assistant.questions.q19',
    answer: 'Dua ederken abdestli olmak, kıbleye dönmek, elleri açmak, hamd ve salavatla başlayıp bitirmek, içtenlikle ve kabul olacağına inanarak istemek duanın adabındandır.',
  },
  {
    key: 'assistant.questions.q20',
    answer: "Sünnet, Peygamberimiz (sav)'in söz, fiil and takrirlerinin (onaylarının) genel adıdır. Hadis ise bu sünneti bizlere aktaran sözlü ve yazılı rivayetlerin her biridir.",
  },
  {
    key: 'assistant.questions.q21',
    answer: "Allah'ın güzel isimlerini öğrenmek, ezberlemek ve dualarda bu isimlerle O'na yönelmek kalbe genişlik verir, duaların kabulüne vesile olur ve imanı kuvvetlendirir.",
  },
  {
    key: 'assistant.questions.q22',
    answer: 'İnsanların birbirleri üzerindeki haklarıdır. Allah\'ın affetmediği günahlar arasındadır. Kurtulmak için hak sahibini bulup helallik almak, eğer vefat ettiyse onun adına hayır dua etmek gerekir.',
  },
  {
    key: 'assistant.questions.q23',
    answer: 'Cemaatle kılınan namaz, tek başına kılınan namazdan yirmi yedi derece daha faziletlidir. Müslümanlar arasındaki birlik, beraberlik, yardımlaşma ve sevgiyi pekiştirir.',
  },
  {
    key: 'assistant.questions.q24',
    answer: "Peygamber Efendimiz (sav)'e dua etmek ve O'na esenlik dilemektir (Örn: \"Allahümme salli ala Muhammed\"). Salavat getirene Allah rahmet eder ve Peygamberimizin şefaatine nail olur.",
  },
  {
    key: 'assistant.questions.q25',
    answer: 'Kandil gecelerinde gündüzleri oruç tutmak, geceleri ise Kur\'an okumak, tövbe istiğfar etmek, kaza ve nafile namazları kılmak, Peygamberimize salavat getirmek tavsiye edilir.',
  },
];

export const normalizeAssistantFaqText = (value: string | undefined | null): string => (
  String(value || '')
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

export const findAssistantFaqItem = (query: string, t: TFn): FaqItem | null => {
  const normalizedQuery = normalizeAssistantFaqText(query);
  if (!normalizedQuery) {
    return null;
  }

  const itemsWithText = ASSISTANT_FAQ_ITEMS.map((item) => ({
    ...item,
    normalizedQuestion: normalizeAssistantFaqText(t(item.key)),
  }));

  // 1. Direct match
  const directMatch = itemsWithText.find((item) => item.normalizedQuestion === normalizedQuery);
  if (directMatch) {
    return directMatch;
  }

  // Stemming helper
  const getStem = (w: string) => (w.length > 4 ? w.slice(0, 4) : w);

  // Tokenize and stem query words (longer than 2 characters)
  const queryStems = normalizedQuery.split(' ')
    .filter((w) => w.length > 2)
    .map(getStem);

  if (queryStems.length === 0) {
    return itemsWithText[0];
  }

  let bestItem: FaqItem | null = null;
  let maxJaccard = 0;

  for (const item of itemsWithText) {
    const questionStems = item.normalizedQuestion.split(' ')
      .filter((w) => w.length > 2)
      .map(getStem);

    if (questionStems.length === 0) continue;

    // Calculate Jaccard similarity (Intersection size / Union size)
    const intersection = queryStems.filter((s) => questionStems.includes(s));
    const intersectionSize = new Set(intersection).size;
    const unionSize = new Set([...queryStems, ...questionStems]).size;

    const jaccard = intersectionSize / unionSize;

    if (jaccard > maxJaccard) {
      maxJaccard = jaccard;
      bestItem = item;
    }
  }

  return bestItem || itemsWithText[0];
};

export const getAssistantFaqAnswer = (query: string, t: TFn): string => {
  const matchedItem = findAssistantFaqItem(query, t);
  if (matchedItem) {
    return matchedItem.answer;
  }

  return t(
    'assistant.betaUnknownQuestion',
    'Bu soru su an hazir cevap listesinde yok. Alttaki ornek sorulardan birini secebilirsiniz.'
  );
};
