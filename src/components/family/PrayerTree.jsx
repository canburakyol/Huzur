import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gamificationService } from '../../services/gamificationService';

const PrayerTree = () => {
  const { t } = useTranslation();
  const [prayersDone, setPrayersDone] = useState(0); // Bu demo state, normalde props veya service'den gelir
  const [animating, setAnimating] = useState(false);

  const handleWaterTree = async () => {
    setAnimating(true);
    // Servis çağrısı
    await gamificationService.updateStreak('fajr'); // Örnek: Sabah namazı
    
    setTimeout(() => {
      setPrayersDone(prev => prev + 1);
      setAnimating(false);
    }, 1500);
  };

  // Ağaç büyüklüğü (max 5 aşama)
  const treeStage = Math.min(5, Math.floor(prayersDone / 10) + 1);

  return (
    <div className="prayer-tree-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h3>🌳 {t('family.prayerTreeTitle')}</h3>
      <p>{t('family.prayerTreeDesc')}</p>

      <div className={`tree-visual stage-${treeStage}`} style={{ 
        height: '200px', 
        display: 'flex', 
        alignItems: 'end', 
        justifyContent: 'center',
        margin: '20px 0',
        transition: 'transform 0.5s'
      }}>
        {/* Basit emoji ağaç visual - İleride SVG veya Lottie olabilir */}
        <span style={{ fontSize: `${50 + (treeStage * 20)}px` }}>
          {treeStage === 1 ? '🌱' : treeStage === 2 ? '🌿' : '🌳'}
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p>💧 {prayersDone} {t('family.waterDrops')}</p>
      </div>

      <button 
        className={`btn btn-primary ${animating ? 'pulse' : ''}`}
        onClick={handleWaterTree}
        disabled={animating}
        style={{ borderRadius: '50px', padding: '15px 30px' }}
      >
        {animating ? t('family.watering') : t('family.waterTreeAction')}
      </button>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#888' }}>
        {t('family.treeTip')}
      </div>
    </div>
  );
};

export default PrayerTree;
