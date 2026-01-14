import { lazy } from 'react';

export const featureConfig = {
  zikirmatik: {
    component: lazy(() => import('../components/Zikirmatik')),
    category: 'IBADET'
  },
  qibla: {
    component: lazy(() => import('../components/QiblaCompass')),
    category: 'CORE'
  },
  radio: {
    component: lazy(() => import('../components/QuranRadio')),
    category: 'MEDIA'
  },
  mosque: {
    component: lazy(() => import('../components/MosqueFinder')),
    category: 'TOOLS'
  },
  calendar: {
    component: lazy(() => import('../components/ReligiousDays')),
    category: 'TOOLS'
  },
  imsakiye: {
    component: lazy(() => import('../components/Imsakiye')),
    category: 'TOOLS'
  },
  tracker: {
    component: lazy(() => import('../components/PrayerTracker')),
    category: 'IBADET'
  },
  fasting: {
    component: lazy(() => import('../components/FastingTracker')),
    category: 'IBADET'
  },
  hadiths: {
    component: lazy(() => import('../components/Hadiths')),
    category: 'CONTENT'
  },
  adhkar: {
    component: lazy(() => import('../components/Adhkar')),
    category: 'IBADET'
  },
  zakat: {
    component: lazy(() => import('../components/ZakatCalculator')),
    category: 'TOOLS'
  },
  hatim: {
    component: lazy(() => import('../components/HatimTracker')),
    category: 'IBADET'
  },
  settings: {
    component: lazy(() => import('../components/Settings')),
    category: 'SYSTEM'
  },
  prayerTeacher: {
    component: lazy(() => import('../components/PrayerTeacher')),
    category: 'EDUCATION'
  },
  library: {
    component: lazy(() => import('../components/Library')),
    category: 'CONTENT'
  },
  tespihat: {
    component: lazy(() => import('../components/Tespihat')),
    category: 'IBADET'
  },
  agenda: {
    component: lazy(() => import('../components/Agenda')),
    category: 'TOOLS'
  },
  multimedia: {
    component: lazy(() => import('../components/Multimedia')),
    category: 'MEDIA'
  },
  greetingCards: {
    component: lazy(() => import('../components/GreetingCards')),
    category: 'SOCIAL'
  },
  theme: {
    component: lazy(() => import('../components/ThemeSelector')),
    category: 'SYSTEM'
  },
  deedJournal: {
    component: lazy(() => import('../components/DeedJournal')),
    category: 'IBADET'
  },
  prayers: {
    component: lazy(() => import('../components/Prayers')),
    category: 'CORE'
  },
  liveBroadcast: {
    component: lazy(() => import('../components/LiveBroadcast')),
    category: 'MEDIA'
  },
  zikirWorld: {
    component: lazy(() => import('../components/ZikirWorld')),
    category: 'SOCIAL'
  },
  hikmetname: {
    component: lazy(() => import('../components/Hikmetname')),
    category: 'CONTENT'
  },
  esmaUlHusna: {
    component: lazy(() => import('../components/EsmaUlHusna')),
    category: 'IBADET'
  },
  weeklySermon: {
    component: lazy(() => import('../components/WeeklySermon')),
    category: 'CONTENT'
  },
  support: {
    component: lazy(() => import('../components/Support')),
    category: 'SYSTEM'
  },
  quranMemorize: {
    component: lazy(() => import('../components/QuranMemorize')),
    category: 'EDUCATION'
  },
  huzurMode: {
    component: lazy(() => import('../components/HuzurMode')),
    category: 'LIFESTYLE'
  },
  dailyTasks: {
    component: lazy(() => import('../components/DailyTasks')),
    category: 'LIFESTYLE'
  },
  fontSettings: {
    component: lazy(() => import('../components/FontSettings')),
    category: 'SYSTEM'
  },
  nuzulExplorer: {
    component: lazy(() => import('../components/NuzulExplorer')),
    category: 'EDUCATION',
    hasUpgrade: true
  },
  wordByWord: {
    component: lazy(() => import('../components/WordByWord')),
    category: 'EDUCATION',
    hasUpgrade: true
  },
  tajweedTutor: {
    component: lazy(() => import('../components/TajweedTutor')),
    category: 'EDUCATION'
  },
  hatimCoach: {
    component: lazy(() => import('../components/HatimCoach')),
    category: 'IBADET'
  },
  family: {
    component: lazy(() => import('../components/FamilyMode')),
    category: 'LIFESTYLE'
  },
  muezzinSelector: {
    component: lazy(() => import('../components/MuezzinSelector')),
    category: 'SYSTEM'
  },
  pro: {
    component: lazy(() => import('../components/ProUpgrade')),
    category: 'SYSTEM'
  },
  missedPrayers: {
    component: lazy(() => import('../components/MissedPrayers')),
    category: 'IBADET'
  },
  islamicMeditation: {
    component: lazy(() => import('../components/IslamicMeditation')),
    category: 'LIFESTYLE'
  },
  seerahMap: {
    component: lazy(() => import('../components/SeerahMap')),
    category: 'EDUCATION'
  },
  spiritualCoach: {
    component: lazy(() => import('../components/SpiritualCoach')),
    category: 'AI'
  },
  prayerCircle: {
    component: lazy(() => import('../components/PrayerCircle')),
    category: 'SOCIAL'
  },
  assistant: {
    component: lazy(() => import('../components/Assistant')),
    category: 'AI'
  },
  community: {
    component: lazy(() => import('../components/Community')),
    category: 'SOCIAL'
  },
  quran: {
    component: lazy(() => import('../components/Quran')),
    category: 'CORE'
  }
};
