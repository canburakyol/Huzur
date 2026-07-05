import { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Compass,
  Crown,
  Hash,
  Heart,
  Home,
  MessageCircle,
  Mic,
  Moon,
  Palette,
  Settings,
  Sparkles,
  Star,
  Target,
  Type,
  User,
  X,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGamification } from '../hooks/useGamification';
import { APP_VERSION } from '../constants';
import { getPrimaryGoalConfig, getStoredPrimaryGoal } from '../utils/primaryGoal';
import './app-shell/Navigation.css';

const CORE_MENU_ITEMS = [
  { id: 'prayers', icon: <Heart size={20} />, labelKey: 'menu.prayers', component: 'prayers' },
  { id: 'tracker', icon: <CheckCircle2 size={20} />, labelKey: 'features.tracker', component: 'tracker' },
  { id: 'dailyTasks', icon: <Target size={20} />, labelKey: 'menu.dailyTasks', component: 'dailyTasks' },
  { id: 'routineBuilder', icon: <ClipboardList size={20} />, labelKey: 'routine.title', component: 'routineBuilder' },
  { id: 'zikirmatik', icon: <Hash size={20} />, labelKey: 'menu.zikirmatik', component: 'zikirmatik' },
  { id: 'duaTracker', icon: <Sparkles size={20} />, labelKey: 'features.duaTracker', component: 'duaTracker' }
];

const GOAL_MENU_ITEMS = {
  prayer_rhythm: [
    { id: 'missedPrayers', icon: <Clock size={20} />, labelKey: 'menu.missedPrayers', component: 'missedPrayers' },
    { id: 'imsakiye', icon: <Moon size={20} />, labelKey: 'menu.imsakiye', component: 'imsakiye' },
    { id: 'qibla', icon: <Compass size={20} />, labelKey: 'features.qibla', component: 'qibla' }
  ],
  quran_learning: [
    { id: 'quran', icon: <BookOpen size={20} />, labelKey: 'features.quran', component: 'quran' },
    { id: 'hatim', icon: <BookOpen size={20} />, labelKey: 'menu.hatim', component: 'hatimCoach' },
    { id: 'adhkar', icon: <Sparkles size={20} />, labelKey: 'features.adhkar', component: 'adhkar' },
    { id: 'tespihat', icon: <Compass size={20} />, labelKey: 'menu.tespihat', component: 'tespihat' }
  ],
  family_consistency: [
    { id: 'family', icon: <Home size={20} />, labelKey: 'family.title', component: 'family' },
    { id: 'spiritualJourney', icon: <Award size={20} />, labelKey: 'journey.title', component: 'spiritualJourney' },
    { id: 'quran', icon: <BookOpen size={20} />, labelKey: 'features.quran', component: 'quran' },
    { id: 'dailyTasks', icon: <Target size={20} />, labelKey: 'menu.dailyTasks', component: 'dailyTasks' }
  ]
};

const SUPPORT_MENU_ITEMS = [
  { id: 'quran', icon: <BookOpen size={20} />, labelKey: 'features.quran', component: 'quran' },
  { id: 'qibla', icon: <Compass size={20} />, labelKey: 'features.qibla', component: 'qibla' },
  { id: 'imsakiye', icon: <Moon size={20} />, labelKey: 'menu.imsakiye', component: 'imsakiye' },
  { id: 'adhkar', icon: <Sparkles size={20} />, labelKey: 'features.adhkar', component: 'adhkar' },
  { id: 'tespihat', icon: <Compass size={20} />, labelKey: 'menu.tespihat', component: 'tespihat' },
  { id: 'esmaUlHusna', icon: <Sparkles size={20} />, labelKey: 'menu.esmaUlHusna', component: 'esmaUlHusna' }
];

const SYSTEM_MENU_ITEMS = [
  { id: 'theme', icon: <Palette size={20} />, labelKey: 'menu.theme', component: 'theme' },
  { id: 'fontSettings', icon: <Type size={20} />, labelKey: 'menu.fontSettings', component: 'fontSettings' },
  { id: 'muezzinSelector', icon: <Mic size={20} />, labelKey: 'menu.muezzinSelector', component: 'muezzinSelector' },
  { id: 'settings', icon: <Settings size={20} />, labelKey: 'menu.settings', component: 'settings' },
  { id: 'support', icon: <MessageCircle size={20} />, labelKey: 'menu.support', component: 'support' },
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
    onSelectFeature(item.component, 'hamburger_menu');
  };

  const topBadges = badgeDetails.slice(0, 3);
  const goalItems = GOAL_MENU_ITEMS[primaryGoal] || GOAL_MENU_ITEMS.prayer_rhythm;
  const shownItemIds = new Set([...CORE_MENU_ITEMS, ...goalItems].map((item) => item.id));
  const supportItems = SUPPORT_MENU_ITEMS.filter((item) => !shownItemIds.has(item.id));

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
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--surface-action-soft)', border: '1px solid var(--menu-border)', color: 'var(--menu-text)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
              >
                <X size={18} />
              </button>

              <div className="hamburger-logo-area">
                <div>
                  <h2 className="hamburger-title">{t('app.name')}</h2>
                  <div style={{ fontSize: '0.7rem', color: 'var(--menu-muted)', opacity: 0.9, fontWeight: '800', letterSpacing: '0.5px' }}>
                    {t('app.tagline').toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="hamburger-profile-section">
                <div className="hamburger-avatar-box">
                  <User size={28} color="var(--brand-primary)" />
                </div>
                <div className="hamburger-user-info">
                  <div className="hamburger-username">{currentTitle}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="hamburger-level-badge" style={{ background: 'var(--surface-action-soft)', color: 'var(--primary)' }}>
                      {t('gamification.level', 'Seviye')} {currentLevel}
                    </span>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-warm)' }}>
                      <Star size={12} fill="currentColor" /> {points ?? 0} XP
                    </div>
                  </div>
                </div>
                {isPro ? (
                  <div style={{ background: 'var(--surface-warm-soft)', padding: '8px', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>
                    <Crown size={20} color="var(--brand-warm)" fill="var(--brand-warm)" />
                  </div>
                ) : null}
              </div>

              <div style={{ marginTop: '12px', padding: '12px 14px', background: 'var(--surface-card)', borderRadius: '16px', border: '1px solid var(--menu-border)' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: '900', color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Ana odak
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--menu-text)' }}>
                  {primaryGoalConfig.label}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                {topBadges.map((badge, index) => (
                  <div key={index} style={{ background: 'var(--surface-action-soft)', color: 'var(--menu-text)', padding: '4px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '800', border: '1px solid var(--menu-border)' }}>
                    {badge?.icon || 'B'} {badge?.id ? t(`badges.${badge.id}.name`, badge.name || badge.id) : t('common.badge', 'Rozet')}
                  </div>
                ))}
              </div>
            </div>

            <div className="hamburger-scroll-area">
              {renderSection('Gunluk ibadet rutini', 'Huzur artik ana olarak bu akisa odaklanir.', CORE_MENU_ITEMS, 0)}
              {renderSection('Sana ozel destek', primaryGoalConfig.label, goalItems, CORE_MENU_ITEMS.length)}
              {renderSection('Temel araclar', 'Ritmi bozmadan lazim olan yardimci ekranlar.', supportItems, CORE_MENU_ITEMS.length + goalItems.length)}
              {renderSection('Ayarlar ve destek', null, SYSTEM_MENU_ITEMS, CORE_MENU_ITEMS.length + goalItems.length + supportItems.length)}
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
