export interface GreetingCategory {
  id: string;
  titleKey: string;
  icon: string;
  descKey: string;
}

// Concrete Stitch palette colors are required because cards are rasterized by html2canvas.
export interface GreetingCard {
  id: string;
  titleKey: string;
  messageKey: string;
  bgGradient: string;
  textColor: string;
  decoration: string;
}

export const GREETING_CATEGORIES: GreetingCategory[] = [
  { id: 'cuma', titleKey: 'greetingCards.categories.cuma.title', icon: '🕌', descKey: 'greetingCards.categories.cuma.desc' },
  { id: 'kandil', titleKey: 'greetingCards.categories.kandil.title', icon: '🕯️', descKey: 'greetingCards.categories.kandil.desc' },
  { id: 'ramazan', titleKey: 'greetingCards.categories.ramazan.title', icon: '🌙', descKey: 'greetingCards.categories.ramazan.desc' },
  { id: 'bayram', titleKey: 'greetingCards.categories.bayram.title', icon: '🎉', descKey: 'greetingCards.categories.bayram.desc' },
  { id: 'ozel-gunler', titleKey: 'greetingCards.categories.ozel-gunler.title', icon: '📅', descKey: 'greetingCards.categories.ozel-gunler.desc' },
  { id: 'dogum', titleKey: 'greetingCards.categories.dogum.title', icon: '🎂', descKey: 'greetingCards.categories.dogum.desc' },
  { id: 'gecmis-olsun', titleKey: 'greetingCards.categories.gecmis-olsun.title', icon: '💐', descKey: 'greetingCards.categories.gecmis-olsun.desc' },
  { id: 'taziye', titleKey: 'greetingCards.categories.taziye.title', icon: '🤲', descKey: 'greetingCards.categories.taziye.desc' },
  { id: 'hayirli-isler', titleKey: 'greetingCards.categories.hayirli-isler.title', icon: '🏠', descKey: 'greetingCards.categories.hayirli-isler.desc' }
];

export const RAMAZAN_CARDS: GreetingCard[] = [
  { id: 'ramazan1', titleKey: 'greetingCards.cards.ramazan1.title', messageKey: 'greetingCards.cards.ramazan1.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 50%, #1b3022 100%)', textColor: '#aa8343', decoration: '🌙✨' },
  { id: 'ramazan2', titleKey: 'greetingCards.cards.ramazan2.title', messageKey: 'greetingCards.cards.ramazan2.message', bgGradient: 'linear-gradient(135deg, #434843 0%, #434843 100%)', textColor: '#f5f2e9', decoration: '🍽️🤲' },
  { id: 'ramazan3', titleKey: 'greetingCards.cards.ramazan3.title', messageKey: 'greetingCards.cards.ramazan3.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#f5f2e9', decoration: '🌃🌙' },
  { id: 'ramazan4', titleKey: 'greetingCards.cards.ramazan4.title', messageKey: 'greetingCards.cards.ramazan4.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#aa8343', decoration: '✨🤲✨' }
];

export const BAYRAM_CARDS: GreetingCard[] = [
  { id: 'bayram1', titleKey: 'greetingCards.cards.bayram1.title', messageKey: 'greetingCards.cards.bayram1.message', bgGradient: 'linear-gradient(135deg, #8daa91 0%, #8daa91 100%)', textColor: '#f5f2e9', decoration: '🎉🌙🎊' },
  { id: 'bayram2', titleKey: 'greetingCards.cards.bayram2.title', messageKey: 'greetingCards.cards.bayram2.message', bgGradient: 'linear-gradient(135deg, #8daa91 0%, #8daa91 100%)', textColor: '#f5f2e9', decoration: '🐑🤲✨' },
  { id: 'bayram3', titleKey: 'greetingCards.cards.bayram3.title', messageKey: 'greetingCards.cards.bayram3.message', bgGradient: 'linear-gradient(135deg, #aa8343 0%, #b3261e 100%)', textColor: '#f5f2e9', decoration: '🎈🎉🎈' },
  { id: 'bayram4', titleKey: 'greetingCards.cards.bayram4.title', messageKey: 'greetingCards.cards.bayram4.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#aa8343', decoration: '🕌🤲🕌' }
];

export const KANDIL_CARDS: GreetingCard[] = [
  { id: 'kandil1', titleKey: 'greetingCards.cards.kandil1.title', messageKey: 'greetingCards.cards.kandil1.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#aa8343', decoration: '🕯️✨🕯️' },
  { id: 'kandil2', titleKey: 'greetingCards.cards.kandil2.title', messageKey: 'greetingCards.cards.kandil2.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#f5f2e9', decoration: '🌙✨🤲' },
  { id: 'kandil3', titleKey: 'greetingCards.cards.kandil3.title', messageKey: 'greetingCards.cards.kandil3.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 50%, #1b3022 100%)', textColor: '#aa8343', decoration: '✨🌌✨' },
  { id: 'kandil4', titleKey: 'greetingCards.cards.kandil4.title', messageKey: 'greetingCards.cards.kandil4.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #8daa91 50%, #8daa91 100%)', textColor: '#f5f2e9', decoration: '🤲✨🤲' }
];

export const CUMA_CARDS: GreetingCard[] = [
  { id: 'cuma1', titleKey: 'greetingCards.cards.cuma1.title', messageKey: 'greetingCards.cards.cuma1.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #8daa91 100%)', textColor: '#f5f2e9', decoration: '🕌🤲🕌' },
  { id: 'cuma2', titleKey: 'greetingCards.cards.cuma2.title', messageKey: 'greetingCards.cards.cuma2.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#aa8343', decoration: '☀️🕌✨' },
  { id: 'cuma3', titleKey: 'greetingCards.cards.cuma3.title', messageKey: 'greetingCards.cards.cuma3.message', bgGradient: 'linear-gradient(135deg, #434843 0%, #1b3022 100%)', textColor: '#f5f2e9', decoration: '🤲✨🤲' },
  { id: 'cuma4', titleKey: 'greetingCards.cards.cuma4.title', messageKey: 'greetingCards.cards.cuma4.message', bgGradient: 'linear-gradient(135deg, #8daa91 0%, #8daa91 100%)', textColor: '#f5f2e9', decoration: '💚🕌💚' },
  { id: 'cuma5', titleKey: 'greetingCards.cards.cuma5.title', messageKey: 'greetingCards.cards.cuma5.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 50%, #1b3022 100%)', textColor: '#aa8343', decoration: '🌙🕌🌙' },
  { id: 'cuma6', titleKey: 'greetingCards.cards.cuma6.title', messageKey: 'greetingCards.cards.cuma6.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#f5f2e9', decoration: '📿✨📿' },
  { id: 'cuma7', titleKey: 'greetingCards.cards.cuma7.title', messageKey: 'greetingCards.cards.cuma7.message', bgGradient: 'linear-gradient(135deg, #8daa91 0%, #8daa91 100%)', textColor: '#f5f2e9', decoration: '🤲🕌🤲' },
  { id: 'cuma8', titleKey: 'greetingCards.cards.cuma8.title', messageKey: 'greetingCards.cards.cuma8.message', bgGradient: 'linear-gradient(135deg, #8daa91 0%, #8daa91 100%)', textColor: '#f5f2e9', decoration: '🕌☀️🕌' }
];

export const DOGUM_GUNU_CARDS: GreetingCard[] = [
  { id: 'dogum1', titleKey: 'greetingCards.cards.dogum1.title', messageKey: 'greetingCards.cards.dogum1.message', bgGradient: 'linear-gradient(135deg, #8daa91 0%, #8daa91 100%)', textColor: '#434843', decoration: '🎂🎈🎁' },
  { id: 'dogum2', titleKey: 'greetingCards.cards.dogum2.title', messageKey: 'greetingCards.cards.dogum2.message', bgGradient: 'linear-gradient(135deg, #8daa91 0%, #b3261e 100%)', textColor: '#f5f2e9', decoration: '🎉✨🎊' }
];

export const GECMIS_OLSUN_CARDS: GreetingCard[] = [
  { id: 'gecmis1', titleKey: 'greetingCards.cards.gecmis1.title', messageKey: 'greetingCards.cards.gecmis1.message', bgGradient: 'linear-gradient(135deg, #8daa91 0%, #8daa91 100%)', textColor: '#434843', decoration: '💐🤲🌸' },
  { id: 'gecmis2', titleKey: 'greetingCards.cards.gecmis2.title', messageKey: 'greetingCards.cards.gecmis2.message', bgGradient: 'linear-gradient(135deg, #8daa91 0%, #8daa91 100%)', textColor: '#f5f2e9', decoration: '🤲✨💚' }
];

export const TAZIYE_CARDS: GreetingCard[] = [
  { id: 'taziye1', titleKey: 'greetingCards.cards.taziye1.title', messageKey: 'greetingCards.cards.taziye1.message', bgGradient: 'linear-gradient(135deg, #434843 0%, #434843 100%)', textColor: '#f5f2e9', decoration: '🤲🕊️🤲' },
  { id: 'taziye2', titleKey: 'greetingCards.cards.taziye2.title', messageKey: 'greetingCards.cards.taziye2.message', bgGradient: 'linear-gradient(135deg, #434843 0%, #434843 100%)', textColor: '#f5f2e9', decoration: '🕊️✨🕊️' }
];

export const HAYIRLI_ISLER_CARDS: GreetingCard[] = [
  { id: 'hayirli1', titleKey: 'greetingCards.cards.hayirli1.title', messageKey: 'greetingCards.cards.hayirli1.message', bgGradient: 'linear-gradient(135deg, #aa8343 0%, #b3261e 100%)', textColor: '#f5f2e9', decoration: '🏠🎉✨' },
  { id: 'hayirli2', titleKey: 'greetingCards.cards.hayirli2.title', messageKey: 'greetingCards.cards.hayirli2.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#aa8343', decoration: '🚗🏡✨' },
  { id: 'hayirli3', titleKey: 'greetingCards.cards.hayirli3.title', messageKey: 'greetingCards.cards.hayirli3.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#f5f2e9', decoration: '💼🤲✨' }
];

export const OZEL_GUNLER_CARDS: GreetingCard[] = [
  { id: 'arefe1', titleKey: 'greetingCards.cards.arefe1.title', messageKey: 'greetingCards.cards.arefe1.message', bgGradient: 'linear-gradient(135deg, #aa8343 0%, #b3261e 100%)', textColor: '#f5f2e9', decoration: '🌙🤲🌙' },
  { id: 'hicri1', titleKey: 'greetingCards.cards.hicri1.title', messageKey: 'greetingCards.cards.hicri1.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 100%)', textColor: '#aa8343', decoration: '🌙✨📅' },
  { id: 'asure1', titleKey: 'greetingCards.cards.asure1.title', messageKey: 'greetingCards.cards.asure1.message', bgGradient: 'linear-gradient(135deg, #8daa91 0%, #8daa91 100%)', textColor: '#f5f2e9', decoration: '🍲🤲🍲' },
  { id: 'ucaylar1', titleKey: 'greetingCards.cards.ucaylar1.title', messageKey: 'greetingCards.cards.ucaylar1.message', bgGradient: 'linear-gradient(135deg, #434843 0%, #1b3022 100%)', textColor: '#f5f2e9', decoration: '🌙🌙🌙' },
  { id: 'teravih1', titleKey: 'greetingCards.cards.teravih1.title', messageKey: 'greetingCards.cards.teravih1.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #1b3022 50%, #1b3022 100%)', textColor: '#aa8343', decoration: '🕌🤲🕌' },
  { id: 'mukabele1', titleKey: 'greetingCards.cards.mukabele1.title', messageKey: 'greetingCards.cards.mukabele1.message', bgGradient: 'linear-gradient(135deg, #1b3022 0%, #8daa91 100%)', textColor: '#f5f2e9', decoration: '📖✨📖' }
];

export const getCardsByCategory = (categoryId: string): GreetingCard[] => {
  switch (categoryId) {
    case 'ramazan': return RAMAZAN_CARDS;
    case 'bayram': return BAYRAM_CARDS;
    case 'kandil': return KANDIL_CARDS;
    case 'cuma': return CUMA_CARDS;
    case 'ozel-gunler': return OZEL_GUNLER_CARDS;
    case 'dogum': return DOGUM_GUNU_CARDS;
    case 'gecmis-olsun': return GECMIS_OLSUN_CARDS;
    case 'taziye': return TAZIYE_CARDS;
    case 'hayirli-isler': return HAYIRLI_ISLER_CARDS;
    default: return [];
  }
};
