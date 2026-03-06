import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { surahList, reciters } from '../data/surahList';
import { Play, Pause, SkipForward, SkipBack, List, X, Music, Disc, Loader2, Volume2, Globe } from 'lucide-react';
import './Education.css';
import IslamicBackButton from './shared/IslamicBackButton';

const QuranRadio = ({ onClose }) => {
    const { t } = useTranslation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentReciter, setCurrentReciter] = useState(reciters[1]); // Default: Abdulbasit Murattal
    const [currentSurahIndex, setCurrentSurahIndex] = useState(0); 
    const [showList, setShowList] = useState(false);
    const audioRef = useRef(null);
    const listRef = useRef(null);

    // Audio server mappings based on mp3quran.net structure
    const getStreamUrl = (reciterId, surahIndex) => {
        const surahNumber = String(surahIndex + 1).padStart(3, '0');
        // Simple mapping for common reciters
        const serverMap = {
            'ar.alafasy': 'https://server8.mp3quran.net/afs/',
            'ar.abdulbasitmurattal': 'https://server7.mp3quran.net/basit/',
            'ar.husary': 'https://server13.mp3quran.net/husr/',
            'ar.minshawi': 'https://server10.mp3quran.net/minsh/',
            'ar.abdurrahmaansudais': 'https://server11.mp3quran.net/sds/'
        };
        const baseUrl = serverMap[reciterId] || serverMap['ar.abdulbasitmurattal'];
        return `${baseUrl}${surahNumber}.mp3`;
    };

    const handleNext = useCallback(() => {
        setCurrentSurahIndex((prev) => (prev + 1) % 114);
        setIsPlaying(true);
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentSurahIndex((prev) => (prev - 1 + 114) % 114);
        setIsPlaying(true);
    }, []);

    useEffect(() => {
        const url = getStreamUrl(currentReciter.id, currentSurahIndex);
        
        if (!audioRef.current || audioRef.current.src !== url) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            audioRef.current = new Audio(url);
            audioRef.current.preload = "auto";
        }

        const handleEnded = () => handleNext();
        const handleWaiting = () => setIsLoading(true);
        const handlePlaying = () => {
            setIsLoading(false);
            setIsPlaying(true);
        };
        const handleError = (e) => {
            console.error("Audio error:", e);
            setIsLoading(false);
            setIsPlaying(false);
        };

        audioRef.current.addEventListener('ended', handleEnded);
        audioRef.current.addEventListener('waiting', handleWaiting);
        audioRef.current.addEventListener('playing', handlePlaying);
        audioRef.current.addEventListener('error', handleError);

        if (isPlaying) {
            audioRef.current.play().catch(e => {
                console.warn("Autoplay was prevented:", e);
                setIsPlaying(false);
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleEnded);
                audioRef.current.removeEventListener('waiting', handleWaiting);
                audioRef.current.removeEventListener('playing', handlePlaying);
                audioRef.current.removeEventListener('error', handleError);
                audioRef.current.pause();
            }
        };
    }, [currentSurahIndex, currentReciter.id, isPlaying, handleNext]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setIsLoading(true);
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                    setIsLoading(false);
                    setIsPlaying(false);
                });
        }
    };

    const handleSelectSurah = (index) => {
        setIsLoading(true);
        setCurrentSurahIndex(index);
        setShowList(false);
        setIsPlaying(true);
    };

    const handleSelectReciter = (reciter) => {
        setIsLoading(true);
        setCurrentReciter(reciter);
        setIsPlaying(true);
    };

    const activeSurah = useMemo(() => surahList[currentSurahIndex], [currentSurahIndex]);

    const waveHeights = [45, 62, 38, 55, 70, 42, 58, 35, 65, 48, 52, 40];

    return (
        <div className="education-container ethereal-radio">
            {/* Header */}
            <header className="manuscript-header radio-glass-header">
                <div className="header-top-nav">
                    <IslamicBackButton onClick={onClose} size="medium" />
                    <div className="glass-pill">{t('home.radio')}</div>
                    <button className="premium-icon-btn" onClick={() => setShowList(!showList)}>
                        {showList ? <Music size={22} /> : <List size={22} />}
                    </button>
                </div>
                
                <div className="manuscript-header-content reveal-stagger">
                   {!showList && (
                     <div className="ethereal-now-playing">
                        <span className="live-indicator">● LIVE</span>
                        <h2 className="manuscript-title">{currentReciter.name}</h2>
                        <p className="manuscript-subtitle">{activeSurah.nameTranslation} {t('common.surah')}</p>
                     </div>
                   )}
                   {showList && (
                     <div className="ethereal-now-playing">
                        <h2 className="manuscript-title">{t('quran.surahs')}</h2>
                        <p className="manuscript-subtitle">{t('radio.selectSurah')}</p>
                     </div>
                   )}
                </div>
            </header>

            {/* Reciter Selector */}
            <div className="ethereal-reciter-bar reveal-stagger" style={{ '--delay': '0.2s' }}>
                {reciters.map(reciter => (
                    <button 
                        key={reciter.id} 
                        className={`ethereal-chip ${currentReciter.id === reciter.id ? 'active' : ''}`}
                        onClick={() => handleSelectReciter(reciter)}
                    >
                        {reciter.name.split(' ')[0]}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {!showList ? (
                <div className="ethereal-display reveal-stagger" style={{ '--delay': '0.3s' }}>
                    <div className="ethereal-visualizer-container">
                        <div className="ethereal-orb pulse"></div>
                        <div className="ethereal-orb secondary" style={{ animationDelay: '1.5s' }}></div>
                        
                        <div className="ethereal-waves">
                            {waveHeights.map((h, i) => (
                                <div 
                                    key={i} 
                                    className={`ethereal-wave-bar ${isPlaying ? 'playing' : ''}`} 
                                    style={{ 
                                        animationDelay: `${i * 0.08}s`,
                                        '--height': `${h}px`
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="ethereal-surah-card">
                        <div className="surah-name-ar-big">{activeSurah.name}</div>
                        <div className="surah-details-row">
                           <span className="detail-tag">{activeSurah.revelationType}</span>
                           <span className="detail-tag">{activeSurah.ayahCount} {t('common.ayah')}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="ethereal-list-area reveal-stagger" ref={listRef} style={{ '--delay': '0.3s' }}>
                    {surahList.map((surah, index) => (
                        <div 
                            key={surah.number}
                            className={`ethereal-list-item ${currentSurahIndex === index ? 'active' : ''}`}
                            onClick={() => handleSelectSurah(index)}
                        >
                            <div className="item-index">{surah.number}</div>
                            <div className="item-info">
                                <div className="item-name">{surah.nameTranslation}</div>
                                <div className="item-sub">{surah.ayahCount} {t('common.ayah')}</div>
                            </div>
                            <div className="item-arabic">{surah.name}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Controls */}
            <footer className="ethereal-controls-container reveal-stagger" style={{ '--delay': '0.5s' }}>
                <div className="ethereal-controls">
                    <button className="ethereal-skip-btn" onClick={handlePrev}>
                        <SkipBack size={28} />
                    </button>

                    <button className="ethereal-play-btn" onClick={togglePlay}>
                        {isLoading ? (
                            <Loader2 size={32} className="spin" />
                        ) : isPlaying ? (
                            <Pause size={32} fill="currentColor" />
                        ) : (
                            <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />
                        )}
                    </button>

                    <button className="ethereal-skip-btn" onClick={handleNext}>
                        <SkipForward size={28} />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default QuranRadio;
