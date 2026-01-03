import { Suspense, lazy } from 'react';
import AdPopup from './AdPopup';

// Lazy Load Components
const Zikirmatik = lazy(() => import('./Zikirmatik'));
const QiblaCompass = lazy(() => import('./QiblaCompass'));
const QuranRadio = lazy(() => import('./QuranRadio'));
const MosqueFinder = lazy(() => import('./MosqueFinder'));
const ReligiousDays = lazy(() => import('./ReligiousDays'));
const Imsakiye = lazy(() => import('./Imsakiye'));
const PrayerTracker = lazy(() => import('./PrayerTracker'));
const FastingTracker = lazy(() => import('./FastingTracker'));
const Hadiths = lazy(() => import('./Hadiths'));
const Adhkar = lazy(() => import('./Adhkar'));
const ZakatCalculator = lazy(() => import('./ZakatCalculator'));
const HatimTracker = lazy(() => import('./HatimTracker'));
const Settings = lazy(() => import('./Settings'));
const Prayers = lazy(() => import('./Prayers'));
const Quran = lazy(() => import('./Quran'));
const Assistant = lazy(() => import('./Assistant'));
const Community = lazy(() => import('./Community'));
const PrayerTeacher = lazy(() => import('./PrayerTeacher'));
const Library = lazy(() => import('./Library'));
const Tespihat = lazy(() => import('./Tespihat'));
const Agenda = lazy(() => import('./Agenda'));
const Multimedia = lazy(() => import('./Multimedia'));
const GreetingCards = lazy(() => import('./GreetingCards'));
const ThemeSelector = lazy(() => import('./ThemeSelector'));
const DeedJournal = lazy(() => import('./DeedJournal'));
const LiveBroadcast = lazy(() => import('./LiveBroadcast'));
const ZikirWorld = lazy(() => import('./ZikirWorld'));
const Hikmetname = lazy(() => import('./Hikmetname'));
const EsmaUlHusna = lazy(() => import('./EsmaUlHusna'));
const WeeklySermon = lazy(() => import('./WeeklySermon'));
const Support = lazy(() => import('./Support'));
const QuranMemorize = lazy(() => import('./QuranMemorize'));
const HuzurMode = lazy(() => import('./HuzurMode'));
const DailyTasks = lazy(() => import('./DailyTasks'));
const FontSettings = lazy(() => import('./FontSettings'));
const NuzulExplorer = lazy(() => import('./NuzulExplorer'));
const WordByWord = lazy(() => import('./WordByWord'));
const TajweedTutor = lazy(() => import('./TajweedTutor'));
const ProUpgrade = lazy(() => import('./ProUpgrade'));

/**
 * FeatureManager Component
 * Handles rendering of active features as an overlay
 */
const FeatureManager = ({ activeFeature, setActiveFeature }) => {
  if (!activeFeature) return null;

  const closeFeature = () => setActiveFeature(null);
  const goToPro = () => setActiveFeature('pro');

  const featureMap = {
    zikirmatik: <Zikirmatik onClose={closeFeature} />,
    qibla: <QiblaCompass onClose={closeFeature} />,
    radio: <QuranRadio onClose={closeFeature} />,
    mosque: <MosqueFinder onClose={closeFeature} />,
    calendar: <ReligiousDays onClose={closeFeature} />,
    imsakiye: <Imsakiye onClose={closeFeature} />,
    tracker: <PrayerTracker onClose={closeFeature} />,
    fasting: <FastingTracker onClose={closeFeature} />,
    hadiths: <Hadiths onClose={closeFeature} />,
    adhkar: <Adhkar onClose={closeFeature} />,
    zakat: <ZakatCalculator onClose={closeFeature} />,
    hatim: <HatimTracker onClose={closeFeature} />,
    settings: <Settings onClose={closeFeature} />,
    prayerTeacher: <PrayerTeacher onClose={closeFeature} />,
    library: <Library onClose={closeFeature} />,
    tespihat: <Tespihat onClose={closeFeature} />,
    agenda: <Agenda onClose={closeFeature} />,
    multimedia: <Multimedia onClose={closeFeature} />,
    greetingCards: <GreetingCards onClose={closeFeature} />,
    theme: <ThemeSelector onClose={closeFeature} />,
    deedJournal: <DeedJournal onClose={closeFeature} />,
    prayers: <Prayers onClose={closeFeature} />,
    liveBroadcast: <LiveBroadcast onClose={closeFeature} />,
    zikirWorld: <ZikirWorld onClose={closeFeature} />,
    hikmetname: <Hikmetname onClose={closeFeature} />,
    esmaUlHusna: <EsmaUlHusna onClose={closeFeature} />,
    weeklySermon: <WeeklySermon onClose={closeFeature} />,
    support: <Support onClose={closeFeature} />,
    quranMemorize: <QuranMemorize onClose={closeFeature} />,
    huzurMode: <HuzurMode onClose={closeFeature} />,
    dailyTasks: <DailyTasks onClose={closeFeature} />,
    fontSettings: <FontSettings onClose={closeFeature} />,
    nuzulExplorer: <NuzulExplorer onClose={closeFeature} onUpgrade={goToPro} />,
    wordByWord: <WordByWord onClose={closeFeature} onUpgrade={goToPro} />,
    tajweedTutor: <TajweedTutor onClose={closeFeature} />,
    pro: <ProUpgrade onClose={closeFeature} />
  };

  return (
    <div className="app-container">
      <AdPopup />
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Yükleniyor...</div>}>
        {featureMap[activeFeature] || null}
      </Suspense>
    </div>
  );
};

export default FeatureManager;
