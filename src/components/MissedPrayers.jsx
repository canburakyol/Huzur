import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Calculator, Save, RotateCcw, Minus, Plus, History, 
    Sunrise, Sun, CloudSun, Sunset, Moon, Sparkles, 
    Calendar, User, CheckCircle2, Info, ChevronRight,
    TrendingUp, Award
} from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';
import './Navigation.css';

const MISSED_PRAYER_CALC_KEY = 'missedPrayerCalc';
const MISSED_PRAYER_COUNTS_KEY = 'missedPrayerCounts';

const MissedPrayers = ({ onClose }) => {
  const { t } = useTranslation();
  
  const loadSavedCalc = () => {
    return storageService.getItem(MISSED_PRAYER_CALC_KEY, null);
  };

  const savedCalcData = loadSavedCalc();

  const [birthDate, setBirthDate] = useState(savedCalcData?.birthDate || '');
  const [pubertyAge, setPubertyAge] = useState(savedCalcData?.pubertyAge || 12);
  const [isCalculated, setIsCalculated] = useState(!!savedCalcData);

  const [missedCounts, setMissedCounts] = useState(() => {
    return storageService.getItem(MISSED_PRAYER_COUNTS_KEY, {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
      witr: 0
    });
  });

  useEffect(() => {
    storageService.setItem(MISSED_PRAYER_COUNTS_KEY, missedCounts);
  }, [missedCounts]);

  const calculateMissed = () => {
    if (!birthDate) return;

    const birth = new Date(birthDate);
    const today = new Date();
    const pubertyDate = new Date(birth.getFullYear() + parseInt(pubertyAge), birth.getMonth(), birth.getDate());
    
    const diffTime = Math.abs(today - pubertyDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      if (isCalculated && !window.confirm(t('missedPrayers.confirmRecalculate'))) {
        return;
      }

      const newCounts = {
        fajr: diffDays,
        dhuhr: diffDays,
        asr: diffDays,
        maghrib: diffDays,
        isha: diffDays,
        witr: diffDays
      };
      
      setMissedCounts(newCounts);
      setIsCalculated(true);
      storageService.setItem(MISSED_PRAYER_CALC_KEY, { birthDate, pubertyAge });
    }
  };

  const updateCount = (prayer, change) => {
    setMissedCounts(prev => {
      const newCount = Math.max(0, prev[prayer] + change);
      return { ...prev, [prayer]: newCount };
    });
  };

  const prayers = [
    { id: 'fajr', label: t('prayer.fajr'), color: '#f59e0b', icon: <Sunrise size={20} /> },
    { id: 'dhuhr', label: t('prayer.dhuhr'), color: '#3b82f6', icon: <Sun size={20} /> },
    { id: 'asr', label: t('prayer.asr'), color: '#f97316', icon: <CloudSun size={20} /> },
    { id: 'maghrib', label: t('prayer.maghrib'), color: '#8b5cf6', icon: <Sunset size={20} /> },
    { id: 'isha', label: t('prayer.isha'), color: '#1e40af', icon: <Moon size={20} /> },
    { id: 'witr', label: t('prayer.witr', 'Vitir'), color: '#10b981', icon: <Sparkles size={20} /> }
  ];

  const totalMissed = Object.values(missedCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <IslamicBackButton onClick={onClose} size="medium" />
        <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                {t('missedPrayers.title')}
            </h2>
            <p className="settings-desc">{t('missedPrayers.subtitle', 'Kaza borçlarınızı planlı bir şekilde takip edin')}</p>
        </div>
      </div>

      <div className="missed-content">
        {!isCalculated ? (
          <div className="settings-group">
            <div className="settings-group-title">{t('missedPrayers.calculatorTitle')}</div>
            
            <div className="settings-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--nav-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> {t('missedPrayers.birthDate')}
                    </label>
                    <input 
                        type="date" 
                        value={birthDate} 
                        onChange={(e) => setBirthDate(e.target.value)}
                        style={{ width: '100%', padding: '12px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '12px', color: 'var(--nav-text)', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--nav-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} /> {t('missedPrayers.pubertyAge')}
                    </label>
                    <select 
                        value={pubertyAge} 
                        onChange={(e) => setPubertyAge(e.target.value)}
                        style={{ width: '100%', padding: '12px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '12px', color: 'var(--nav-text)', outline: 'none' }}
                    >
                        {[...Array(6)].map((_, i) => (
                            <option key={i} value={10 + i}>{10 + i} {t('common.age', 'Yaş')}</option>
                        ))}
                    </select>
                </div>

                <button 
                  onClick={calculateMissed}
                  style={{ 
                    width: '100%', padding: '16px', background: 'var(--nav-accent)', color: 'white', 
                    border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1rem', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
                  }}
                  disabled={!birthDate}
                >
                  <TrendingUp size={20} />
                  {t('missedPrayers.calculate')}
                </button>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                    <Info size={14} />
                    <p style={{ fontSize: '11px', margin: 0 }}>{t('missedPrayers.calcNote', 'Kaza namazlarınız otomatik olarak hesaplanır.')}</p>
                </div>
            </div>
          </div>
        ) : (
          <div className="tracker-view animate-slideUp">
             {/* Stats Card */}
             <div className="settings-card" style={{ background: 'var(--nav-accent)', color: 'white', border: 'none', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', opacity: 0.9 }}>{t('missedPrayers.totalMissed', 'Toplam Kaza Borcu')}</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', margin: '4px 0' }}>{totalMissed}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Award size={12} /> {t('missedPrayers.keepGoing', 'İstikrarla devam edin')}
                        </div>
                    </div>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={40} />
                    </div>
                </div>
             </div>

             <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '12px 0 24px' }}>
                <button onClick={() => setIsCalculated(false)} className="hamburger-pro-badge" style={{ background: 'var(--nav-hover)', color: 'var(--nav-text-muted)', border: '1px solid var(--nav-border)', boxShadow: 'none' }}>
                    <RotateCcw size={12} /> {t('missedPrayers.recalculate')}
                </button>
             </div>

             <div className="settings-group">
                <div className="settings-group-title">{t('missedPrayers.prayerList', 'Namaz Listesi')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {prayers.map((prayer) => (
                        <div key={prayer.id} className="settings-card" style={{ padding: '16px' }}>
                            <div className="settings-card-left">
                                <div className="settings-icon-box" style={{ background: 'var(--nav-hover)', color: prayer.color }}>
                                    {prayer.icon}
                                </div>
                                <div>
                                    <div className="settings-label">{prayer.label}</div>
                                    <div className="settings-desc">{missedCounts[prayer.id]} {t('common.remaining', 'Kalan')}</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <button 
                                    onClick={() => updateCount(prayer.id, -1)}
                                    className="kaza-btn minus"
                                >
                                    <Minus size={16} />
                                </button>
                                
                                <span className={`kaza-count ${missedCounts[prayer.id] === 0 ? 'zero' : ''}`}>
                                    {missedCounts[prayer.id]}
                                </span>

                                <button 
                                    onClick={() => updateCount(prayer.id, 1)}
                                    className="kaza-btn plus"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             <div className="settings-card" style={{ background: 'var(--nav-hover)', border: 'none' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Info size={18} color="var(--nav-text-muted)" />
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                        {t('missedPrayers.note')}
                    </p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissedPrayers;

