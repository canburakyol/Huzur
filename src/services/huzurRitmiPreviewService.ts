type PreviewStep = {
  label: string;
  text: string;
};

type PreviewPlan = {
  title: string;
  subtitle: string;
  steps: PreviewStep[];
};

const PREVIEW_PLANS: Record<string, PreviewPlan> = {
  prayer_rhythm: {
    title: 'Bugunku ibadet rutinin hazir',
    subtitle: 'Namaz, zikir ve kisa gunluk adimi tek sade akista tut.',
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
    title: 'Bugunku Kuran ve dua rutinin hazir',
    subtitle: 'Kisa okuma ve duayi gunluk ibadet ritmine bagla.',
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
    title: 'Ailece ibadet rutinin hazir',
    subtitle: 'Sosyal akisa dagilmadan bugun birlikte atilacak tek sakin adim.',
    steps: [
      {
        label: 'Ortak niyet',
        text: 'Ailece bugun icin tek namaz, dua veya zikir niyeti belirle.',
      },
      {
        label: 'Ortak dua',
        text: 'Ayni niyet icin kisa bir dua okuyup gunluk rutini baslat.',
      },
      {
        label: 'Kucuk hedef',
        text: 'Bugun sadece bir ortak hatirlatma ve tamamlanan tek adim yeterli.',
      },
    ],
  },
};

export const getHuzurRitmiPreview = (goal = 'prayer_rhythm'): PreviewPlan => (
  PREVIEW_PLANS[goal] || PREVIEW_PLANS.prayer_rhythm
);

export const buildHuzurRitmiAnalyticsPayload = (goal = 'prayer_rhythm', extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  source: 'huzur_ritmi_preview',
  primary_goal: PREVIEW_PLANS[goal] ? goal : 'prayer_rhythm',
  preview_version: 'daily_ibadah_v2',
  ...extra,
});

export default {
  getHuzurRitmiPreview,
  buildHuzurRitmiAnalyticsPayload,
};
