import { useEffect, useState } from 'react';
import {
  Award,
  Book,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Coins,
  Compass,
  Crown,
  GraduationCap,
  Hash,
  Heart,
  Home,
  Library,
  Map,
  MapPin,
  MessageCircle,
  Mic,
  Mic2,
  Moon,
  Palette,
  PlayCircle,
  Quote,
  ScrollText,
  Settings,
  Sparkles,
  Star,
  Target,
  Tv,
  Type,
  User,
  Wind,
  X,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGamification } from '../hooks/useGamification';
import { APP_VERSION } from '../constants';
import { getPrimaryGoalConfig, getStoredPrimaryGoal } from '../utils/primaryGoal';
import './Navigation.css';

const CORE_MENU_ITEMS = [
  { id: 'dailyTasks', icon: <Target size={20} />, labelKey: 'menu.dailyTasks', component: 'dailyTasks' },
  { id: 'spiritualJourney', icon: <Award size={20} />, labelKey: 'journey.title', component: 'spiritualJourney' },
  { id: 'routineBuilder', icon: <ClipboardList size={20} />, labelKey: 'routine.title', component: 'routineBuilder' },
  { id: 'dailyQuiz', icon: <Brain size={20} />, labelKey: 'quiz.title', component: 'dailyQuiz' },
  { id: 'family', icon: <Home size={20} />, labelKey: 'family.title', component: 'family' }
];

const GOAL_MENU_ITEMS = {
  prayer_rhythm: [
    { id: 'prayers', icon: <Heart size={20} />, labelKey: 'menu.prayers', component: 'prayers' },
    { id: 'adhkar', icon: <Sparkles size={20} />, labelKey: 'features.adhkar', component: 'adhkar' },
    { id: 'muezzinSelector', icon: <Mic size={20} />, labelKey: 'menu.muezzinSelector', component: 'muezzinSelector' }
  ],
  quran_learning: [
    { id: 'quran', icon: <BookOpen size={20} />, labelKey: 'features.quran', component: 'quran' },
    { id: 'wordByWord', icon: <Type size={20} />, labelKey: 'menu.wordByWord', component: 'wordByWord' },
    { id: 'tajweedTutor', icon: <Mic2 size={20} />, labelKey: 'menu.tajweedTutor', component: 'tajweedTutor' }
  ],
  family_consistency: [
    { id: 'social', icon: <Sparkles size={20} />, labelKey: 'social.title', component: 'social' },
    { id: 'hatim', icon: <BookOpen size={20} />, labelKey: 'menu.hatim', component: 'hatimCoach' },
    { id: 'settings', icon: <Settings size={20} />, labelKey: 'menu.settings', component: 'settings' }
  ]
};

const EXPLORE_MENU_ITEMS = [
  { id: 'huzurMode', icon: <Moon size={20} />, labelKey: 'menu.huzurMode', component: 'huzurMode' },
  { id: 'nuzulExplorer', icon: <ScrollText size={20} />, labelKey: 'menu.nuzulExplorer', component: 'nuzulExplorer' },
  { id: 'prayerTeacher', icon: <GraduationCap size={20} />, labelKey: 'menu.prayerTeacher', component: 'prayerTeacher' },
  { id: 'library', icon: <Library size={20} />, labelKey: 'menu.library', component: 'library' },
  { id: 'tespihat', icon: <Compass size={20} />, labelKey: 'menu.tespihat', component: 'tespihat' },
  { id: 'agenda', icon: <Calendar size={20} />, labelKey: 'menu.agenda', component: 'agenda' },
  { id: 'multimedia', icon: <PlayCircle size={20} />, labelKey: 'menu.multimedia', component: 'multimedia' },
  { id: 'theme', icon: <Palette size={20} />, labelKey: 'menu.theme', component: 'theme' },
  { id: 'imsakiye', icon: <Moon size={20} />, labelKey: 'menu.imsakiye', component: 'imsakiye' },
  { id: 'zikirmatik', icon: <Hash size={20} />, labelKey: 'menu.zikirmatik', component: 'zikirmatik' },
  { id: 'deedJournal', icon: <ClipboardList size={20} />, labelKey: 'menu.deedJournal', component: 'deedJournal' },
  { id: 'liveBroadcast', icon: <Tv size={20} />, labelKey: 'menu.liveBroadcast', component: 'liveBroadcast' },
  { id: 'hikmetname', icon: <Quote size={20} />, labelKey: 'menu.hikmetname', component: 'hikmetname' },
  { id: 'esmaUlHusna', icon: <Sparkles size={20} />, labelKey: 'menu.esmaUlHusna', component: 'esmaUlHusna' },
  { id: 'hadiths', icon: <Book size={20} />, labelKey: 'menu.hadiths', component: 'hadiths' },
  { id: 'zakat', icon: <Coins size={20} />, labelKey: 'menu.zakat', component: 'zakat' },
  { id: 'weeklySermon', icon: <Mic size={20} />, labelKey: 'menu.weeklySermon', component: 'weeklySermon' },
  { id: 'support', icon: <MessageCircle size={20} />, labelKey: 'menu.support', component: 'support' },
  { id: 'quranMemorize', icon: <Brain size={20} />, labelKey: 'menu.quranMemorize', component: 'quranMemorize' },
  { id: 'mosque', icon: <MapPin size={20} />, labelKey: 'menu.mosque', component: 'mosque' },
  { id: 'missedPrayers', icon: <Clock size={20} />, labelKey: 'menu.missedPrayers', component: 'missedPrayers' },
  { id: 'islamicMeditation', icon: <Wind size={20} />, labelKey: 'menu.islamicMeditation', component: 'islamicMeditation' },
  { id: 'seerahMap', icon: <Map size={20} />, labelKey: 'menu.seerahMap', component: 'seerahMap' },
  { id: 'settings', icon: <Settings size={20} />, labelKey: 'menu.settings', component: 'settings' },
  { id: 'fontSettings', icon: <Type size={20} />, labelKey: 'menu.fontSettings', component: 'fontSettings' },
  { id: 'pro', icon: <Crown size={20} />, labelKey: 'menu.goPro', component: 'pro' }
];

function HamburgerMenu({ onSelectFeature, currentFeature, externalOpen, onClose, isPro }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { level, points, badgeDetails = [] } = useGamification();
  const currentLevel = typeof level === 'object' ? (level?.level ?? 1) : (Number(level) || 1);
  const currentTitle = typeof level === 'object' ? (level?.title || 'Huzur Yolcusu') : 'Huzur Yolcusu';
  const primaryGoal = getStoredPrimaryGoal();
  const primaryGoalConfig = getPrimaryGoalConfig(primaryGoal);

  useEffect(() => {
    if (externalOpen) {
      const timer = setTimeout(() => setIsOpen(true), 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [externalOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleItemClick = (item) => {
    handleClose();
    onSelectFeature(item.component);
  };

  const topBadges = badgeDetails.slice(0, 3);
  const goalItems = GOAL_MENU_ITEMS[primaryGoal] || GOAL_MENU_ITEMS.prayer_rhythm;

  const renderSection = (title, subtitle, items, offset = 0) => (
    <div style={{ marginBottom: '22px' }}>
      <div style={{ padding: '0 6px 10px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: '0.76rem', color: 'var(--nav-text-muted)', fontWeight: '600', lineHeight: '1.45' }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      <div className="nav-grid">
        {items.map((item, index) => {
          const isActive = currentFeature === item.component;
          let label = item.labelKey ? t(item.labelKey, item.label || item.component) : (item.label || item.component);
          let icon = item.icon;

          if (item.id === 'pro' && isPro) {
            label = t('menu.proMembership');
            icon = <CheckCircle2 size={20} color="var(--accent-gold)" />;
          }

          return (
            <div
              key={`${title}-${item.id}`}
              className={`nav-item reveal-stagger ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(item)}
              style={{ '--delay': `${(offset + index) * 0.03}s` }}
            >
              <div className="nav-icon-box">
                {icon}
              </div>
              <span className="nav-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div className="hamburger-overlay" onClick={handleClose}>
          <div className="hamburger-menu" onClick={(event) => event.stopPropagation()}>
            <div className="hamburger-header">
              <button
                onClick={handleClose}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
              >
                <X size={18} />
              </button>

              <div className="hamburger-logo-area">
                <div>
                  <h2 className="hamburger-title" style={{ color: 'white' }}>{t('app.name')}</h2>
                  <div style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: '800', letterSpacing: '0.5px' }}>
                    {t('app.tagline').toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="hamburger-profile-section">
                <div className="hamburger-avatar-box">
                  <User size={28} color="white" />
                </div>
                <div className="hamburger-user-info">
                  <div className="hamburger-username">{currentTitle}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="hamburger-level-badge" style={{ background: 'var(--accent-gold)', color: 'white' }}>
                      {t('gamification.level', 'Seviye')} {currentLevel}
                    </span>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold-shimmer)' }}>
                      <Star size={12} fill="currentColor" /> {points ?? 0} XP
                    </div>
                  </div>
                </div>
                {isPro ? (
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <Crown size={20} color="#fcd34d" fill="#fcd34d" />
                  </div>
                ) : null}
              </div>

              <div style={{ marginTop: '12px', padding: '12px 14px', background: 'rgba(0,0,0,0.16)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: '900', color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Ana odak
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff' }}>
                  {primaryGoalConfig.label}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                {topBadges.map((badge, index) => (
                  <div key={index} style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '800', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {badge?.icon || 'B'} {badge?.id ? t(`badges.${badge.id}.name`, badge.name || badge.id) : t('common.badge', 'Rozet')}
                  </div>
                ))}
              </div>
            </div>

            <div className="hamburger-scroll-area">
              {renderSection('Cekirdek deneyim', 'Her gun geri gelmek icin once buradaki akisla ilerle.', CORE_MENU_ITEMS, 0)}
              {renderSection('Sana ozel oneriler', primaryGoalConfig.label, goalItems, CORE_MENU_ITEMS.length)}
              {renderSection('Diger ozellikler', 'Ihtiyac duydugunda kesfet; ilk deneyimi kalabaliklastirmiyoruz.', EXPLORE_MENU_ITEMS, CORE_MENU_ITEMS.length + goalItems.length)}
            </div>

            <div className="hamburger-footer">
              <span>v{APP_VERSION}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {t('menu.settings')} <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HamburgerMenu;
