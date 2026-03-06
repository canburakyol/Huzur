import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Heart, X, Play, Pause, Music, HeartHandshake } from 'lucide-react';
import { MOODS } from '../data/moodData';
import { getAudioUrlSync } from '../services/quranService';
import IslamicBackButton from './shared/IslamicBackButton';

const MoodSelector = ({ onClose }) => {
  const { t } = useTranslation();
  const [selectedMood, setSelectedMood] = useState(null);
  const [playingUrl, setPlayingUrl] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);

  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
      }
    };
  }, [audioPlayer]);

  const toggleAudio = (url) => {
    if (playingUrl === url) {
      audioPlayer.pause();
      setPlayingUrl(null);
    } else {
      if (audioPlayer) {
        audioPlayer.pause();
      }
      const newAudio = new Audio(url);
      newAudio.play();
      newAudio.onended = () => setPlayingUrl(null);
      setAudioPlayer(newAudio);
      setPlayingUrl(url);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  return (
    <div className="settings-container reveal-stagger" style={{ paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <IslamicBackButton onClick={onClose} size="medium" />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
            {t('mood.title', 'Ruh Hali')}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
            {t('mood.subtitle', 'Ruh haline şifa ayetleri seçelim')}
          </p>
        </div>
      </div>

      {!selectedMood ? (
        <>
          <div className="settings-card reveal-stagger" style={{ 
              padding: '32px 24px', marginBottom: '24px', textAlign: 'center', flexDirection: 'column', alignItems: 'center' 
          }}>
            <div className="settings-icon-box" style={{ 
                width: '72px', height: '72px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '20px' 
            }}>
              <HeartHandshake size={32} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '950', color: 'var(--nav-text)' }}>
                {t('mood.ask', 'Bugün Nasıl Hissediyorsun?')}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                {t('mood.helperText', 'Hissiyatına göre sana özel ayetleri bulalım.')}
            </p>
          </div>

          <div className="reveal-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {Object.values(MOODS).map((mood, index) => (
              <button
                key={mood.id}
                className="settings-card"
                onClick={() => handleMoodSelect(mood)}
                style={{ 
                    flexDirection: 'column', padding: '24px 16px', gap: '12px',
                    background: 'var(--nav-hover)', border: '1px solid var(--nav-border)',
                    '--delay': `${index * 0.05}s`
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>{mood.emoji}</span>
                <span style={{ 
                    fontSize: '0.85rem', fontWeight: '900', color: 'var(--nav-text)',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>{t(`mood.labels.${mood.id}`, mood.label)}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="reveal-stagger">
          <div className="settings-card reveal-stagger" style={{ 
              padding: '24px', marginBottom: '24px', background: selectedMood.color + '20',
              border: `2px solid ${selectedMood.color}`, gap: '16px'
          }}>
            <span style={{ fontSize: '2.5rem' }}>{selectedMood.emoji}</span>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '950', color: 'var(--nav-text)' }}>
                    {t(`mood.labels.${selectedMood.id}`, selectedMood.label)}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                    {t('mood.selectedHeader', 'Bu ruh haline özel şifa ayetleri:')}
                </p>
            </div>
          </div>

          <div className="reveal-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedMood.ayahs.map((item, index) => {
              const audioUrl = getAudioUrlSync(item.surahNumber, item.ayah);
              const isPlaying = playingUrl === audioUrl;

              return (
                <div key={index} className="settings-card" style={{ 
                    padding: '24px', flexDirection: 'column', alignItems: 'stretch',
                    '--delay': `${index * 0.1}s`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ 
                        background: 'var(--nav-hover)', padding: '6px 14px', borderRadius: '10px',
                        fontSize: '0.8rem', fontWeight: '900', color: 'var(--nav-accent)'
                    }}>
                        {item.surah}, {item.ayah}
                    </div>
                    <button 
                      className={`settings-icon-box ${isPlaying ? 'pulse' : ''}`}
                      onClick={() => toggleAudio(audioUrl)}
                      style={{ 
                          width: '40px', height: '40px',
                          background: isPlaying ? 'var(--nav-accent)' : 'var(--nav-hover)',
                          color: isPlaying ? 'white' : 'var(--nav-text)',
                          border: 'none', cursor: 'pointer', transition: 'all 0.3s'
                      }}
                    >
                      {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </button>
                  </div>
                  
                  <div style={{ 
                      fontFamily: 'var(--arabic-font)', fontSize: '1.75rem', 
                      color: 'var(--nav-text)', textAlign: 'right', marginBottom: '20px',
                      lineHeight: '1.8', fontWeight: '400'
                  }}>{item.text}</div>
                  
                  <div style={{ 
                      fontSize: '1rem', fontStyle: 'italic', color: 'var(--nav-text)',
                      lineHeight: '1.6', fontWeight: '600', paddingLeft: '12px',
                      borderLeft: `3px solid ${selectedMood.color}80`
                  }}>"{item.translation}"</div>
                </div>
              );
            })}
          </div>

          <button 
                className="velocity-target-btn" 
                onClick={() => {
                    if(audioPlayer) audioPlayer.pause();
                    setPlayingUrl(null);
                    setSelectedMood(null);
                }} 
                style={{ marginTop: '32px', width: '100%' }}
            >
            {t('mood.reselect', 'Başka Bir Ruh Hali Seç')}
          </button>
        </div>
      )}

      <style>{`
        .pulse {
          animation: moodPulse 1.5s infinite;
        }
        @keyframes moodPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 var(--nav-accent-alpha); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }
      `}</style>
    </div>
  );
};

export default MoodSelector;
