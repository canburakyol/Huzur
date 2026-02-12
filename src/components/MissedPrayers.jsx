import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Save, RotateCcw, Minus, Plus, History } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';

const MISSED_PRAYER_CALC_KEY = 'missedPrayerCalc';
const MISSED_PRAYER_COUNTS_KEY = 'missedPrayerCounts';

const MissedPrayers = ({ onClose }) => {
  const { t } = useTranslation();
  
  // Helper to load saved calc params
  const loadSavedCalc = () => {
    return storageService.getItem(MISSED_PRAYER_CALC_KEY, null);
  };

  const savedCalcData = loadSavedCalc();

  // State for calculation - Initialize lazily
  const [birthDate, setBirthDate] = useState(savedCalcData?.birthDate || '');
  const [pubertyAge, setPubertyAge] = useState(savedCalcData?.pubertyAge || 12);
  const [isCalculated, setIsCalculated] = useState(!!savedCalcData);

  // State for counts - Initialize lazily from localStorage
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

  // Save counts whenever they change
  useEffect(() => {
    storageService.setItem(MISSED_PRAYER_COUNTS_KEY, missedCounts);
  }, [missedCounts]);

  const calculateMissed = () => {
    if (!birthDate) return;

    const birth = new Date(birthDate);
    const today = new Date();
    const pubertyDate = new Date(birth.getFullYear() + parseInt(pubertyAge), birth.getMonth(), birth.getDate());
    
    // Calculate days passed since puberty
    const diffTime = Math.abs(today - pubertyDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      // Ask user if they want to overwrite existing counts
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
      
      // Save calculation parameters
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
    { id: 'fajr', label: t('prayer.fajr'), color: '#FBBF24', icon: '☀️' },
    { id: 'dhuhr', label: t('prayer.dhuhr'), color: '#3B82F6', icon: '🌤️' },
    { id: 'asr', label: t('prayer.asr'), color: '#F59E0B', icon: '🌥️' },
    { id: 'maghrib', label: t('prayer.maghrib'), color: '#8B5CF6', icon: '🌅' },
    { id: 'isha', label: t('prayer.isha'), color: '#1E40AF', icon: '🌙' },
    { id: 'witr', label: 'Vitir', color: '#10B981', icon: '✨' }
  ];

  return (
    <div className="missed-prayers-container animate-fadeIn">
      {/* Header */}
      <div className="missed-header" style={{
          paddingTop: 'calc(20px + env(safe-area-inset-top))'
      }}>
        <IslamicBackButton onClick={onClose} size="medium" />
        <div className="header-content">
          <h1>🕌 {t('missedPrayers.title')}</h1>
          <p className="subtitle">Kaza borçlarınızı planlı bir şekilde takip edin</p>
        </div>
      </div>

      <div className="missed-content">
        {/* Calculator Section */}
        {!isCalculated ? (
          <div className="card-outer glass-card item-stagger">
            <div className="card-header">
              <Calculator size={20} color="var(--primary-color)" />
              <h3>{t('missedPrayers.calculatorTitle')}</h3>
            </div>
            
            <div className="input-group">
              <label>{t('missedPrayers.birthDate')}</label>
              <div className="input-wrapper">
                <input 
                  type="date" 
                  value={birthDate} 
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="themed-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label>{t('missedPrayers.pubertyAge')}</label>
              <div className="input-wrapper">
                <select 
                  value={pubertyAge} 
                  onChange={(e) => setPubertyAge(e.target.value)}
                  className="themed-select"
                >
                  {[...Array(6)].map((_, i) => (
                    <option key={i} value={10 + i}>{10 + i} Yaş</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={calculateMissed}
              className="calculate-btn"
              disabled={!birthDate}
            >
              <History size={18} />
              {t('missedPrayers.calculate')}
            </button>
            <p className="calc-note">Doğum tarihiniz ve ergenlik yaşınıza göre kaza namazlarınız otomatik hesaplanır.</p>
          </div>
        ) : (
          <div className="tracker-view animate-slideUp">
             <div className="tracker-summary glass-card">
                <div className="summary-header">
                  <h3>{t('missedPrayers.trackerTitle')}</h3>
                  <button onClick={() => setIsCalculated(false)} className="recalc-btn">
                    <RotateCcw size={14} />
                    {t('missedPrayers.recalculate')}
                  </button>
                </div>
                <div className="summary-stats">
                  <div className="stat-item">
                     <span className="stat-value">{Object.values(missedCounts).reduce((a, b) => a + b, 0)}</span>
                     <span className="stat-label">Toplam Kaza</span>
                  </div>
                </div>
             </div>

             <div className="missed-grid">
               {prayers.map((prayer, index) => (
                 <div key={prayer.id} className="missed-card glass-card item-stagger" style={{ 
                   animationDelay: `${index * 0.05}s`,
                   borderLeft: `4px solid ${prayer.color}`
                 }}>
                   <div className="prayer-info">
                     <span className="prayer-icon">{prayer.icon}</span>
                     <span className="prayer-label">{prayer.label}</span>
                   </div>
                   
                   <div className="counter-controls">
                     <button 
                       onClick={() => updateCount(prayer.id, -1)}
                       className="control-btn minus"
                     >
                       <Minus size={16} />
                     </button>
                     
                     <div className="count-display">
                       <span className="count-number">{missedCounts[prayer.id]}</span>
                     </div>

                     <button 
                       onClick={() => updateCount(prayer.id, 1)}
                       className="control-btn plus"
                     >
                       <Plus size={16} />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="tracker-footer">
               <div className="info-box">
                 <History size={14} />
                 <span>{t('missedPrayers.note')}</span>
               </div>
             </div>
          </div>
        )}
      </div>

      <style>{`
        .missed-prayers-container {
          min-height: 100vh;
          background: var(--bg-gradient-start);
          padding-bottom: 40px;
        }

        .missed-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .header-content h1 {
          font-size: 1.4rem;
          margin: 0;
          color: var(--text-color);
        }

        .subtitle {
          font-size: 0.85rem;
          color: var(--text-color-muted);
          margin: 4px 0 0 0;
        }

        .missed-content {
          padding: 16px;
          max-width: 500px;
          margin: 0 auto;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 18px;
          color: var(--text-color);
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          font-size: 13px;
          color: var(--text-color-muted);
          margin-bottom: 8px;
          font-weight: 600;
        }

        .input-wrapper {
          position: relative;
        }

        .themed-input, .themed-select {
          width: 100%;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px;
          color: var(--text-color);
          font-size: 15px;
          outline: none;
          transition: border-color 0.3s;
        }

        .themed-input:focus, .themed-select:focus {
          border-color: var(--primary-color);
        }

        .themed-select option {
          background: #1a5c45;
          color: white;
        }

        .calculate-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          transition: transform 0.2s;
        }

        .calculate-btn:active { transform: scale(0.98); }
        .calculate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .calc-note {
          margin-top: 15px;
          font-size: 12px;
          color: var(--text-color-muted);
          text-align: center;
          line-height: 1.4;
        }

        /* Tracker View */
        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .summary-header h3 { margin: 0; font-size: 16px; }

        .recalc-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-color-muted);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }

        .summary-stats {
          text-align: center;
          padding: 10px 0;
        }

        .stat-value {
          display: block;
          font-size: 32px;
          font-weight: 800;
          color: var(--primary-color);
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-color-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .missed-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }

        .missed-card {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.03);
        }

        .prayer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .prayer-icon { font-size: 18px; }
        .prayer-label { font-weight: 600; font-size: 15px; }

        .counter-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .count-display {
          min-width: 60px;
          text-align: center;
        }

        .count-number {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-color);
        }

        .control-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .control-btn.minus { background: rgba(239, 68, 68, 0.8); }
        .control-btn.plus { background: rgba(16, 185, 129, 0.8); }
        .control-btn:active { transform: scale(0.9); opacity: 1; }

        .tracker-footer {
          margin-top: 24px;
          padding: 0 10px;
        }

        .info-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 15px;
          background: rgba(212, 175, 55, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          color: var(--text-color-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .item-stagger { animation: slideUp 0.3s ease-out backwards; }
      `}</style>
    </div>
  );
};

export default MissedPrayers;

