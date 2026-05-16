const PREVIEW_PLANS = {
  prayer_rhythm: {
    title: 'Bugunku namaz ritmin hazir',
    subtitle: 'Tek sakin adimla bugunu bos gecirmemeye odaklan.',
    steps: [
      {
        label: 'Vakit odagi',
        text: 'Siradaki namaz icin 10 dakika once sakin bir hatirlatma kur.',
      },
      {
        label: 'Kisa zikir',
        text: '33 kez Subhanallah ile bugunun ritmini yavaslat.',
      },
      {
        label: 'Hatirlatma',
        text: 'Gun icinde sadece bir vakti bilerek ve sakin tamamlamayi hedefle.',
      },
    ],
  },
  quran_learning: {
    title: 'Bugunku Kuran ve dua adimin hazir',
    subtitle: 'Uzun bir ders degil; kisa, anlasilir ve surdurulebilir bir bag.',
    steps: [
      {
        label: 'Kisa okuma',
        text: 'Fatiha veya Ihlas suresini anlamina dikkat ederek oku.',
      },
      {
        label: 'Dua',
        text: 'Bugun kalbini toparlamak icin tek bir samimi dua sec.',
      },
      {
        label: 'Anlam adimi',
        text: 'Okudugun ayetten aklinda kalacak bir kelimeyi not et.',
      },
    ],
  },
  family_consistency: {
    title: 'Aile ritmin icin ilk halka hazir',
    subtitle: 'Buyuk hedefler yerine bugun birlikte atilacak tek sakin adim.',
    steps: [
      {
        label: 'Aile daveti',
        text: 'Bir kisiyi bugunku kisa dua ritmine nazikce davet et.',
      },
      {
        label: 'Ortak dua',
        text: 'Ailece veya bir dostunla ayni niyet icin kisa bir dua belirle.',
      },
      {
        label: 'Kucuk hedef',
        text: 'Bugun sadece bir ortak hatirlatma veya dua mesaji yeterli.',
      },
    ],
  },
};

export const getHuzurRitmiPreview = (goal = 'prayer_rhythm') => (
  PREVIEW_PLANS[goal] || PREVIEW_PLANS.prayer_rhythm
);

export const buildHuzurRitmiAnalyticsPayload = (goal = 'prayer_rhythm', extra = {}) => ({
  source: 'huzur_ritmi_preview',
  primary_goal: PREVIEW_PLANS[goal] ? goal : 'prayer_rhythm',
  preview_version: 'v1',
  ...extra,
});

export default {
  getHuzurRitmiPreview,
  buildHuzurRitmiAnalyticsPayload,
};
