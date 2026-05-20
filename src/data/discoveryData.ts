export const DISCOVERY_CARD_TYPES = {
  AYAH: 'ayah',
  HADITH: 'hadith',
  ESMA: 'esma',
  DUA: 'dua',
  HIKMET: 'hikmet',
  FACT: 'fact'
} as const;

export type DiscoveryCardType = typeof DISCOVERY_CARD_TYPES[keyof typeof DISCOVERY_CARD_TYPES];

export interface DiscoveryCard {
  id: string;
  type: DiscoveryCardType;
  icon: string;
  label: string;
  title: string;
  source: string;
  xp: number;
  action?: string;
}

export interface CardTypeConfig {
  gradient: string;
  bgColor: string;
}

export const DISCOVERY_CARDS: DiscoveryCard[] = [
  { id: 'ayah_1', type: DISCOVERY_CARD_TYPES.AYAH, icon: '🕋', label: 'Günün Ayeti', title: '"Şüphesiz Allah, sabredenlerle beraberdir."', source: 'Bakara, 2:153', xp: 5, action: '/kuran' },
  { id: 'ayah_2', type: DISCOVERY_CARD_TYPES.AYAH, icon: '🕋', label: 'Günün Ayeti', title: '"Şüphesiz her güçlükle bir kolaylık vardır."', source: 'İnşirah, 94:6', xp: 5, action: '/kuran' },
  { id: 'ayah_3', type: DISCOVERY_CARD_TYPES.AYAH, icon: '🕋', label: 'Günün Ayeti', title: '"Rabbiniz, dua edin bana, icabet edeyim size, dedi."', source: 'Mü\'min, 40:60', xp: 5, action: '/kuran' },
  { id: 'ayah_4', type: DISCOVERY_CARD_TYPES.AYAH, icon: '🕋', label: 'Günün Ayeti', title: '"Allah, bir kimseye gücünün yeteceğinden başkasını yüklemez."', source: 'Bakara, 2:286', xp: 5, action: '/kuran' },
  { id: 'ayah_5', type: DISCOVERY_CARD_TYPES.AYAH, icon: '🕋', label: 'Günün Ayeti', title: '"De ki: Rabbim affet ve merhamet et. Sen merhamet edenlerin en hayırlısısın."', source: 'Mü\'minûn, 23:118', xp: 5, action: '/kuran' },
  { id: 'ayah_6', type: DISCOVERY_CARD_TYPES.AYAH, icon: '🕋', label: 'Günün Ayeti', title: '"Kim Allah\'a güvenirse O, ona yeter."', source: 'Talâk, 65:3', xp: 5, action: '/kuran' },
  { id: 'ayah_7', type: DISCOVERY_CARD_TYPES.AYAH, icon: '🕋', label: 'Günün Ayeti', title: '"Biz insanı en güzel biçimde yarattık."', source: 'Tîn, 95:4', xp: 5, action: '/kuran' },
  { id: 'ayah_8', type: DISCOVERY_CARD_TYPES.AYAH, icon: '🕋', label: 'Günün Ayeti', title: '"Gerçekten namaz, hayâsızlıktan ve kötülükten alıkoyar."', source: 'Ankebût, 29:45', xp: 5, action: '/kuran' },
  { id: 'ayah_9', type: DISCOVERY_CARD_TYPES.AYAH, icon: '🕋', label: 'Günün Ayeti', title: '"O, gökleri ve yeri altı günde yarattı ve Arş\'ın üzerine kuruldu."', source: 'Hûd, 11:7', xp: 5, action: '/kuran' },
  { id: 'ayah_10', type: DISCOVERY_CARD_TYPES.AYAH, icon: '🕋', label: 'Günün Ayeti', title: '"Allah adaleti, iyilik yapmayı, yakınlara yardım etmeyi emreder."', source: 'Nahl, 16:90', xp: 5, action: '/kuran' },
  { id: 'hadith_1', type: DISCOVERY_CARD_TYPES.HADITH, icon: '📜', label: 'Günün Hadisi', title: '"Kolaylaştırın, zorlaştırmayın; müjdeleyin, nefret ettirmeyin."', source: 'Buhârî & Müslim', xp: 5, action: '/hadis' },
  { id: 'hadith_2', type: DISCOVERY_CARD_TYPES.HADITH, icon: '📜', label: 'Günün Hadisi', title: '"Güler yüzle kardeşini karşılaman da sadakadır."', source: 'Tirmizî', xp: 5, action: '/hadis' },
  { id: 'hadith_3', type: DISCOVERY_CARD_TYPES.HADITH, icon: '📜', label: 'Günün Hadisi', title: '"İnsanların en hayırlısı, insanlara en çok faydalı olandır."', source: 'Taberânî', xp: 5, action: '/hadis' },
  { id: 'hadith_4', type: DISCOVERY_CARD_TYPES.HADITH, icon: '📜', label: 'Günün Hadisi', title: '"Dua ibadetin ta kendisidir."', source: 'Tirmizî', xp: 5, action: '/hadis' },
  { id: 'hadith_5', type: DISCOVERY_CARD_TYPES.HADITH, icon: '📜', label: 'Günün Hadisi', title: '"Kim iyi bir çığır açarsa, onunla amel edenlerin sevabı da ona yazılır."', source: 'Müslim', xp: 5, action: '/hadis' },
  { id: 'hadith_6', type: DISCOVERY_CARD_TYPES.HADITH, icon: '📜', label: 'Günün Hadisi', title: '"Sabır, acı bir olayın ilk anında gösterilendir."', source: 'Buhârî', xp: 5, action: '/hadis' },
  { id: 'hadith_7', type: DISCOVERY_CARD_TYPES.HADITH, icon: '📜', label: 'Günün Hadisi', title: '"Şüphesiz ameller niyetlere göredir."', source: 'Buhârî & Müslim', xp: 5, action: '/hadis' },
  { id: 'hadith_8', type: DISCOVERY_CARD_TYPES.HADITH, icon: '📜', label: 'Günün Hadisi', title: '"Müslüman, elinden ve dilinden müslümanların emin olduğu kimsedir."', source: 'Buhârî', xp: 5, action: '/hadis' },
  { id: 'esma_1', type: DISCOVERY_CARD_TYPES.ESMA, icon: '✨', label: 'Günün Esması', title: 'Er-Rahmân — Sonsuz merhamet sahibi, dünyada inanan inanmayan herkese merhamet eden.', source: 'Esma-ül Hüsna #1', xp: 5, action: '/esma' },
  { id: 'esma_2', type: DISCOVERY_CARD_TYPES.ESMA, icon: '✨', label: 'Günün Esması', title: 'El-Vedûd — Çok seven, sevilmeye en lâyık olan, kullarını seven.', source: 'Esma-ül Hüsna #47', xp: 5, action: '/esma' },
  { id: 'esma_3', type: DISCOVERY_CARD_TYPES.ESMA, icon: '✨', label: 'Günün Esması', title: 'Es-Sabûr — Ceza vermekte acele etmeyen, çok sabırlı.', source: 'Esma-ül Hüsna #99', xp: 5, action: '/esma' },
  { id: 'esma_4', type: DISCOVERY_CARD_TYPES.ESMA, icon: '✨', label: 'Günün Esması', title: 'El-Gaffâr — Günahları çokça bağışlayan, tekrar tekrar affeden.', source: 'Esma-ül Hüsna #15', xp: 5, action: '/esma' },
  { id: 'esma_5', type: DISCOVERY_CARD_TYPES.ESMA, icon: '✨', label: 'Günün Esması', title: 'El-Kerîm — Sonsuz cömertlik sahibi, ikramı bol olan.', source: 'Esma-ül Hüsna #42', xp: 5, action: '/esma' },
  { id: 'esma_6', type: DISCOVERY_CARD_TYPES.ESMA, icon: '✨', label: 'Günün Esması', title: 'Eş-Şekûr — Az amele çok karşılık veren, şükredenlerin şükrünü kabul eden.', source: 'Esma-ül Hüsna #35', xp: 5, action: '/esma' },
  { id: 'esma_7', type: DISCOVERY_CARD_TYPES.ESMA, icon: '✨', label: 'Günün Esması', title: 'El-Latîf — Lütfu bol olan, kullarına en ince detaylarla iyilik eden.', source: 'Esma-ül Hüsna #30', xp: 5, action: '/esma' },
  { id: 'dua_1', type: DISCOVERY_CARD_TYPES.DUA, icon: '🤲', label: 'Günün Duası', title: '"Rabbena atina fid-dünya haseneten ve fil-ahireti haseneten ve kına azaben-nar."', source: 'Bakara, 2:201', xp: 5, action: '/dualar' },
  { id: 'dua_2', type: DISCOVERY_CARD_TYPES.DUA, icon: '🤲', label: 'Günün Duası', title: '"Rabbi zidnî ilmâ" — Rabbim! İlmimi artır.', source: 'Tâhâ, 20:114', xp: 5, action: '/dualar' },
  { id: 'dua_3', type: DISCOVERY_CARD_TYPES.DUA, icon: '🤲', label: 'Günün Duası', title: '"Rabbi innî limâ enzelte ileyye min hayrin fakîr."', source: 'Kasas, 28:24', xp: 5, action: '/dualar' },
  { id: 'dua_4', type: DISCOVERY_CARD_TYPES.DUA, icon: '🤲', label: 'Günün Duası', title: '"Hasbiyallahu lâ ilâhe illâ hû, aleyhi tevekkeltü."', source: 'Tevbe, 9:129', xp: 5, action: '/dualar' },
  { id: 'dua_5', type: DISCOVERY_CARD_TYPES.DUA, icon: '🤲', label: 'Günün Duası', title: '"Allahümma innî es\'elüke\'l-afiyete fid-dünya vel-ahire."', source: 'Ebû Davud', xp: 5, action: '/dualar' },
  { id: 'hikmet_1', type: DISCOVERY_CARD_TYPES.HIKMET, icon: '🌙', label: 'Günün Hikmeti', title: '"Sabır, zaferin anahtarıdır." — Hz. Ali (r.a.)', source: 'Hikmet', xp: 5, action: '/hikmetname' },
  { id: 'hikmet_2', type: DISCOVERY_CARD_TYPES.HIKMET, icon: '🌙', label: 'Günün Hikmeti', title: '"İlim meclisleri cennet bahçeleridir." — Hz. Muhammed (s.a.v.)', source: 'Tirmizî', xp: 5, action: '/hikmetname' },
  { id: 'hikmet_3', type: DISCOVERY_CARD_TYPES.HIKMET, icon: '🌙', label: 'Günün Hikmeti', title: '"Kendini bilen, Rabbini bilir." — İmam Gazâlî', source: 'Hikmet', xp: 5, action: '/hikmetname' },
  { id: 'hikmet_4', type: DISCOVERY_CARD_TYPES.HIKMET, icon: '🌙', label: 'Günün Hikmeti', title: '"Kalbin huzuru Allah\'ı zikretmektedir."', source: 'Ra\'d, 13:28', xp: 5, action: '/hikmetname' },
  { id: 'hikmet_5', type: DISCOVERY_CARD_TYPES.HIKMET, icon: '🌙', label: 'Günün Hikmeti', title: '"İnsanın değeri, bildikleriyle değil, yaşadıklarıyladır." — Mevlânâ', source: 'Hikmet', xp: 5, action: '/hikmetname' },
  { id: 'fact_1', type: DISCOVERY_CARD_TYPES.FACT, icon: '💡', label: 'Biliyor muydun?', title: 'Kuran-ı Kerim\'de toplam 6.236 ayet bulunmaktadır.', source: 'İslam Bilgisi', xp: 5 },
  { id: 'fact_2', type: DISCOVERY_CARD_TYPES.FACT, icon: '💡', label: 'Biliyor muydun?', title: 'Kuran\'da en uzun sure Bakara suresidir (286 ayet).', source: 'İslam Bilgisi', xp: 5 },
  { id: 'fact_3', type: DISCOVERY_CARD_TYPES.FACT, icon: '💡', label: 'Biliyor muydun?', title: 'Beş vakit namazda toplam 17 rekat farz, 12 rekat sünnet bulunur.', source: 'İslam Bilgisi', xp: 5 },
  { id: 'fact_4', type: DISCOVERY_CARD_TYPES.FACT, icon: '💡', label: 'Biliyor muydun?', title: 'Kâbe\'nin yüksekliği 13,1 metredir ve örtüsü (Kisve) her yıl yenilenir.', source: 'İslam Bilgisi', xp: 5 },
  { id: 'fact_5', type: DISCOVERY_CARD_TYPES.FACT, icon: '💡', label: 'Biliyor muydun?', title: '"Sübhanallah" demek, terazinin yarısını doldurmaya denktir.', source: 'Müslim', xp: 5 },
  { id: 'fact_6', type: DISCOVERY_CARD_TYPES.FACT, icon: '💡', label: 'Biliyor muydun?', title: 'İslam\'da ilk ezan Hz. Bilal tarafından okunmuştur.', source: 'İslam Bilgisi', xp: 5 },
  { id: 'fact_7', type: DISCOVERY_CARD_TYPES.FACT, icon: '💡', label: 'Biliyor muydun?', title: 'Kuran\'da ismi geçen 25 peygamber vardır.', source: 'İslam Bilgisi', xp: 5 }
];

export const CARD_TYPE_CONFIG: Record<DiscoveryCardType, CardTypeConfig> = {
  [DISCOVERY_CARD_TYPES.AYAH]: { gradient: 'linear-gradient(135deg, #065f46, #047857)', bgColor: '#065f46' },
  [DISCOVERY_CARD_TYPES.HADITH]: { gradient: 'linear-gradient(135deg, #1e3a5f, #2563eb)', bgColor: '#1e3a5f' },
  [DISCOVERY_CARD_TYPES.ESMA]: { gradient: 'linear-gradient(135deg, #5b21b6, #7c3aed)', bgColor: '#5b21b6' },
  [DISCOVERY_CARD_TYPES.DUA]: { gradient: 'linear-gradient(135deg, #92400e, #d97706)', bgColor: '#92400e' },
  [DISCOVERY_CARD_TYPES.HIKMET]: { gradient: 'linear-gradient(135deg, #374151, #6b7280)', bgColor: '#374151' },
  [DISCOVERY_CARD_TYPES.FACT]: { gradient: 'linear-gradient(135deg, #0e7490, #06b6d4)', bgColor: '#0e7490' }
};

export function getDailyDiscoveryCards(): DiscoveryCard[] {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

  const byType: Record<string, DiscoveryCard[]> = {};
  DISCOVERY_CARDS.forEach(card => {
    if (!byType[card.type]) byType[card.type] = [];
    byType[card.type].push(card);
  });

  const types = Object.keys(byType);
  const selected: DiscoveryCard[] = [];

  for (let i = 0; i < 3; i++) {
    const typeIndex = (dayOfYear + i) % types.length;
    const type = types[typeIndex];
    const cards = byType[type];
    const cardIndex = dayOfYear % cards.length;
    selected.push(cards[cardIndex]);
  }

  return selected;
}
