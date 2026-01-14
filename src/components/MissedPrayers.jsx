import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Save, RotateCcw, Minus, Plus, History } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';

const MissedPrayers = ({ onClose }) => {
  const { t } = useTranslation();
  
  // Helper to load saved calc params
  const loadSavedCalc = () => {
    const saved = localStorage.getItem('missedPrayerCalc');
    return saved ? JSON.parse(saved) : null;
  };

  const savedCalcData = loadSavedCalc();

  // State for calculation - Initialize lazily
  const [birthDate, setBirthDate] = useState(savedCalcData?.birthDate || '');
  const [pubertyAge, setPubertyAge] = useState(savedCalcData?.pubertyAge || 12);
  const [isCalculated, setIsCalculated] = useState(!!savedCalcData);

  // State for counts - Initialize lazily from localStorage
  const [missedCounts, setMissedCounts] = useState(() => {
    const saved = localStorage.getItem('missedPrayerCounts');
    return saved ? JSON.parse(saved) : {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
      witr: 0
    };
  });

  // Save counts whenever they change
  useEffect(() => {
    localStorage.setItem('missedPrayerCounts', JSON.stringify(missedCounts));
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
      localStorage.setItem('missedPrayerCalc', JSON.stringify({ birthDate, pubertyAge }));
    }
  };

  const updateCount = (prayer, change) => {
    setMissedCounts(prev => {
      const newCount = Math.max(0, prev[prayer] + change);
      return { ...prev, [prayer]: newCount };
    });
  };

  const prayers = [
    { id: 'fajr', label: t('prayer.fajr') },
    { id: 'dhuhr', label: t('prayer.dhuhr') },
    { id: 'asr', label: t('prayer.asr') },
    { id: 'maghrib', label: t('prayer.maghrib') },
    { id: 'isha', label: t('prayer.isha') },
    { id: 'witr', label: 'Vitir' } // Vitir is separate
  ];

  return (
    <div className="app-container" style={{ background: 'var(--bg-color)', minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <IslamicBackButton onClick={onClose} />
        <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--primary-color)' }}>{t('missedPrayers.title')}</h2>
      </div>

      {/* Calculator Section */}
      {!isCalculated ? (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--primary-color)' }}>
            <Calculator size={24} />
            <h3 style={{ margin: 0 }}>{t('missedPrayers.calculatorTitle')}</h3>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-color)' }}>{t('missedPrayers.birthDate')}</label>
            <input 
              type="date" 
              value={birthDate} 
              onChange={(e) => setBirthDate(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-color)' }}>{t('missedPrayers.pubertyAge')}</label>
            <select 
              value={pubertyAge} 
              onChange={(e) => setPubertyAge(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            >
              {[...Array(6)].map((_, i) => (
                <option key={i} value={10 + i}>{10 + i}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={calculateMissed}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <History size={18} />
            {t('missedPrayers.calculate')}
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(255,255,255,0.95)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{t('missedPrayers.trackerTitle')}</h3>
              <button 
                onClick={() => setIsCalculated(false)}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={14} />
                <span style={{ fontSize: '12px' }}>{t('missedPrayers.recalculate')}</span>
              </button>
           </div>

           <div style={{ display: 'grid', gap: '12px' }}>
             {prayers.map(prayer => (
               <div key={prayer.id} style={{ 
                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                 padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)'
               }}>
                 <div style={{ fontWeight: '600', color: 'var(--text-color)', width: '80px' }}>{prayer.label}</div>
                 
                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-color)', flex: 1, textAlign: 'center' }}>
                   {missedCounts[prayer.id]}
                 </div>

                 <div style={{ display: 'flex', gap: '8px' }}>
                   <button 
                     onClick={() => updateCount(prayer.id, -1)}
                     style={{ 
                       width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                       background: '#e74c3c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                     }}
                   >
                     <Minus size={18} />
                   </button>
                   <button 
                     onClick={() => updateCount(prayer.id, 1)}
                     style={{ 
                       width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                       background: '#2ecc71', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                     }}
                   >
                     <Plus size={18} />
                   </button>
                 </div>
               </div>
             ))}
           </div>
           
           <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
             {t('missedPrayers.note')}
           </div>
        </div>
      )}
    </div>
  );
};

export default MissedPrayers;
