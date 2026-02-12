import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { surahList, reciters } from '../data/surahList';
import { Play, Pause, SkipForward, SkipBack, List, X, Music, Disc, Loader2 } from 'lucide-react';
import './QuranRadio.css';

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

    return (
        <div className="radio-container">
            {/* Header */}
            <header className="radio-header">
                <button className="icon-button" onClick={() => setShowList(!showList)}>
                    {showList ? <Music size={22} /> : <List size={22} />}
                </button>
                <h2>{t('home.radio', 'Kuran Radyo')}</h2>
                <button className="icon-button" onClick={onClose}>
                    <X size={22} />
                </button>
            </header>

            {/* Reciter Selector */}
            <div className="reciter-selector">
                {reciters.map(reciter => (
                    <div 
                        key={reciter.id} 
                        className={`reciter-chip ${currentReciter.id === reciter.id ? 'active' : ''}`}
                        onClick={() => handleSelectReciter(reciter)}
                    >
                        {reciter.name.split(' ')[0]}
                    </div>
                ))}
            </div>

            {/* Content Area */}
            {!showList ? (
                <div className="radio-display">
                    <div className="visualizer-container">
                        <div className="visualizer-ring pulse"></div>
                        <div className="visualizer-ring" style={{ animationDelay: '1s' }}></div>
                        <div className="audio-waves">
                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div 
                                    key={i} 
                                    className={`wave-bar ${isPlaying ? 'playing' : ''}`} 
                                    style={{ 
                                        animationDelay: `${i * 0.1}s`,
                                        height: isPlaying ? undefined : '15px'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="surah-info">
                        <div className="surah-arabic">{activeSurah.name}</div>
                        <div className="surah-turkish">{activeSurah.nameTranslation} {t('common.surah', 'Suresi')}</div>
                        <div className="reciter-name">
                            <Disc size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {currentReciter.name}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="surah-list-container" ref={listRef}>
                    {surahList.map((surah, index) => (
                        <div 
                            key={surah.number}
                            className={`surah-list-item ${currentSurahIndex === index ? 'active' : ''}`}
                            onClick={() => handleSelectSurah(index)}
                        >
                            <div className="surah-number">{surah.number}</div>
                            <div className="surah-details">
                                <div className="surah-name-tr">{surah.nameTranslation}</div>
                                <div className="surah-meta">{surah.ayahCount} {t('common.ayah', 'Ayet')} • {surah.revelationType}</div>
                            </div>
                            <div className="surah-name-ar">{surah.name}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Controls */}
            <footer className="radio-controls">
                <div className="playback-controls">
                    <button className="skip-btn" onClick={handlePrev}>
                        <SkipBack size={32} />
                    </button>

                    <button className="play-pause-btn" onClick={togglePlay}>
                        {isLoading ? (
                            <Loader2 size={40} className="loading-indicator" />
                        ) : isPlaying ? (
                            <Pause size={42} fill="currentColor" />
                        ) : (
                            <Play size={42} fill="currentColor" style={{ marginLeft: '6px' }} />
                        )}
                    </button>

                    <button className="skip-btn" onClick={handleNext}>
                        <SkipForward size={32} />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default QuranRadio;
