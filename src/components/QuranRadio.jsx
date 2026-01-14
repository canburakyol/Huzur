import { useState, useEffect, useRef } from 'react';
import { surahList } from '../data/surahList';
import { Play, Pause, SkipForward, SkipBack, List, X } from 'lucide-react';

const surahNames = surahList.map(s => s.nameTranslation);

const QuranRadio = ({ onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSurahIndex, setCurrentSurahIndex] = useState(0); // 0-indexed (Fatiha is 0)
    const [showList, setShowList] = useState(false);
    const audioRef = useRef(null);
    const listRef = useRef(null);

    // Abdulbasit Abdussamed (Murattal)
    // URL format: https://server7.mp3quran.net/basit/{001..114}.mp3
    const getStreamUrl = (index) => {
        const surahNumber = String(index + 1).padStart(3, '0');
        return `https://server7.mp3quran.net/basit/${surahNumber}.mp3`;
    };

    // Define handleNext and handlePrev before they're used in useEffect
    const handleNext = () => {
        setIsPlaying(true);
        setCurrentSurahIndex((prev) => (prev + 1) % 114);
    };

    const handlePrev = () => {
        setIsPlaying(true);
        setCurrentSurahIndex((prev) => (prev - 1 + 114) % 114);
    };

    useEffect(() => {
        // Initialize audio
        if (!audioRef.current || audioRef.current.src !== getStreamUrl(currentSurahIndex)) {
             if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            audioRef.current = new Audio(getStreamUrl(currentSurahIndex));
        }

        const handleEnded = () => {
            handleNext();
        };

        const handleWaiting = () => setIsLoading(true);
        const handlePlaying = () => setIsLoading(false);
        const handleError = (e) => {
            console.error("Audio error:", e);
            setIsLoading(false);
            setIsPlaying(false);
        };

        audioRef.current.addEventListener('ended', handleEnded);
        audioRef.current.addEventListener('waiting', handleWaiting);
        audioRef.current.addEventListener('playing', handlePlaying);
        audioRef.current.addEventListener('error', handleError);

        // Auto-play if it was playing before (except first load)
        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Auto-play failed:", e));
        }

        return () => {
            // Only cleanup listeners, don't destroy audio instance unless component unmounts
            // or surah changes (handled by dependency array)
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleEnded);
                audioRef.current.removeEventListener('waiting', handleWaiting);
                audioRef.current.removeEventListener('playing', handlePlaying);
                audioRef.current.removeEventListener('error', handleError);
                
                // If component is unmounting (not just re-rendering due to state change), pause it
                // We can't easily detect unmount vs update here, but since we depend on currentSurahIndex,
                // this runs when surah changes.
                audioRef.current.pause();
            }
        };
        // Only re-run when surah changes. isPlaying is handled separately.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSurahIndex]);

    // Scroll to active surah when list opens
    useEffect(() => {
        if (showList && listRef.current) {
            const activeItem = listRef.current.children[currentSurahIndex];
            if (activeItem) {
                activeItem.scrollIntoView({ block: 'center', behavior: 'auto' });
            }
        }
    }, [showList, currentSurahIndex]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setIsLoading(true);
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Playback failed:", error);
                    setIsLoading(false);
                    setIsPlaying(false);
                });
        }
    };

    const handleSelectSurah = (index) => {
        setCurrentSurahIndex(index);
        setIsPlaying(true);
        setShowList(false);
    };

    return (
        <div className="glass-card" style={{ textAlign: 'center', position: 'relative', height: '400px', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={() => setShowList(!showList)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d35400' }}>
                    <List size={28} />
                </button>
                <h2 style={{ color: '#d35400', margin: 0, fontSize: '20px' }}>Kuran Oynatıcı</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                    <X size={28} />
                </button>
            </div>

            {/* Main Player View */}
            {!showList ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ margin: '20px 0', padding: '20px', background: 'rgba(255,255,255,0.3)', borderRadius: '15px' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Şu an Çalıyor</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>
                            {surahNames[currentSurahIndex]} Suresi
                        </div>
                        <div style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
                            Abdulbasit Abdussamed
                        </div>
                        {isLoading && <div style={{ fontSize: '12px', color: '#d35400', marginTop: '10px' }}>Yükleniyor...</div>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: 'auto', marginBottom: '20px' }}>
                        <button className="btn" onClick={handlePrev} style={{ padding: '15px', borderRadius: '50%' }}>
                            <SkipBack size={24} />
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={togglePlay}
                            style={{ width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                        >
                            {isPlaying ? <Pause size={36} /> : <Play size={36} style={{ marginLeft: '4px' }} />}
                        </button>

                        <button className="btn" onClick={handleNext} style={{ padding: '15px', borderRadius: '50%' }}>
                            <SkipForward size={24} />
                        </button>
                    </div>
                </div>
            ) : (
                /* List View */
                <div style={{ flex: 1, overflowY: 'auto', textAlign: 'left', padding: '0 10px' }} ref={listRef}>
                    {surahNames.map((name, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelectSurah(index)}
                            style={{
                                padding: '15px',
                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                background: currentSurahIndex === index ? 'rgba(211, 84, 0, 0.1)' : 'transparent',
                                color: currentSurahIndex === index ? '#d35400' : '#2c3e50',
                                fontWeight: currentSurahIndex === index ? 'bold' : 'normal',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '8px',
                                marginBottom: '5px'
                            }}
                        >
                            <span style={{ width: '30px', fontSize: '12px', color: '#999' }}>{index + 1}</span>
                            <span style={{ fontSize: '18px' }}>{name} Suresi</span>
                            {currentSurahIndex === index && isPlaying && <span style={{ marginLeft: 'auto' }}>🔊</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuranRadio;
