import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronDown, Book, Search, Volume2, X, Lock, Play, Pause, Crown, Sparkles } from 'lucide-react';
import { getReciters, getAudioUrlSync } from '../services/quranService';
import { surahList } from '../data/surahList';
import { isPro } from '../services/proService';
import IslamicBackButton from './shared/IslamicBackButton';

function Library({ onClose, onShowPro }) {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [activeReciter, setActiveReciter] = useState(null);
    const [expandedChapter, setExpandedChapter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [playingIndex, setPlayingIndex] = useState(null);
    const [audioPlayer, setAudioPlayer] = useState(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [libraryData, setLibraryData] = useState(null);
    const [isLibraryDataLoading, setIsLibraryDataLoading] = useState(false);

    const loadLibraryData = useCallback(async () => {
        if (libraryData || isLibraryDataLoading) return;

        setIsLibraryDataLoading(true);
        try {
            const dataModule = await import('../data/libraryData');
            setLibraryData({
                BOOKS: dataModule.BOOKS || [],
                RELIGIOUS_TEXTS: dataModule.RELIGIOUS_TEXTS || [],
                EDUCATION: dataModule.EDUCATION || [],
                REFERENCES: dataModule.REFERENCES || [],
                FAQ: dataModule.FAQ || [],
                AUDIO: dataModule.AUDIO || [],
                VIDEO: dataModule.VIDEO || [],
                PRAYERS: dataModule.PRAYERS || []
            });
        } catch (error) {
            console.error('[Library] Veri yükleme hatası:', error);
        } finally {
            setIsLibraryDataLoading(false);
        }
    }, [libraryData, isLibraryDataLoading]);

    useEffect(() => {
        if ((activeCategory || searchQuery.length >= 2) && !libraryData && !isLibraryDataLoading) {
            loadLibraryData();
        }
    }, [activeCategory, searchQuery, libraryData, isLibraryDataLoading, loadLibraryData]);

    const BOOKS = useMemo(() => libraryData?.BOOKS || [], [libraryData]);
    const RELIGIOUS_TEXTS = useMemo(() => libraryData?.RELIGIOUS_TEXTS || [], [libraryData]);
    const EDUCATION = useMemo(() => libraryData?.EDUCATION || [], [libraryData]);
    const REFERENCES = useMemo(() => libraryData?.REFERENCES || [], [libraryData]);
    const FAQ = useMemo(() => libraryData?.FAQ || [], [libraryData]);
    const AUDIO = useMemo(() => libraryData?.AUDIO || [], [libraryData]);
    const VIDEO = useMemo(() => libraryData?.VIDEO || [], [libraryData]);
    const PRAYERS = useMemo(() => libraryData?.PRAYERS || [], [libraryData]);

    const LIBRARY_CATEGORIES = [
        { id: 'books', title: 'Kitaplar', icon: '📚', data: BOOKS },
        { id: 'texts', title: 'Dini Metinler', icon: '📜', data: RELIGIOUS_TEXTS },
        { id: 'education', title: 'Eğitim', icon: '🎓', data: EDUCATION },
        { id: 'references', title: 'Referanslar', icon: '📋', data: REFERENCES },
        { id: 'prayers', title: 'Peygamber Duaları', icon: '🤲', data: PRAYERS },
        { id: 'audio', title: 'Sesli Kütüphane', icon: '🎧', data: AUDIO, isPro: true },
        { id: 'video', title: 'İslami Akademi', icon: '🎬', data: VIDEO },
        { id: 'faq', title: 'Soru-Cevap', icon: '❓', data: FAQ }
    ];

    const userIsPro = isPro();

    // Play Arabic letter using Web Speech API
    const speakArabic = (letter, index, e) => {
        e.stopPropagation();

        if (!('speechSynthesis' in window)) {
            alert('Ses özelliği bu tarayıcıda desteklenmiyor.');
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = 'ar';
        utterance.rate = 0.5;
        utterance.volume = 1;

        setPlayingIndex(index);

        utterance.onend = () => setPlayingIndex(null);
        utterance.onerror = () => setPlayingIndex(null);

        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 100);
    };

    // Handle Audio Playback
    const toggleAudio = (url, index, e) => {
        e.stopPropagation();

        if (currentAudioUrl === url && audioPlayer && !audioPlayer.paused) {
            audioPlayer.pause();
            setPlayingIndex(null);
        } else {
            if (audioPlayer) {
                audioPlayer.pause();
            }
            const newAudio = new Audio(url);
            newAudio.play().catch(err => console.error("Audio play error:", err));
            newAudio.onended = () => setPlayingIndex(null);
            setAudioPlayer(newAudio);
            setCurrentAudioUrl(url);
            setPlayingIndex(index);
        }
    };

    // Global search across all library content
    const searchResults = useMemo(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) return [];

        const query = searchQuery.toLowerCase().trim();
        const results = [];

        // Search Books
        BOOKS.forEach(book => {
            if (book.title.toLowerCase().includes(query)) {
                results.push({ type: 'book', category: 'Kitaplar', icon: book.icon, item: book });
            }
            book.chapters?.forEach(chapter => {
                if (chapter.title.toLowerCase().includes(query) || chapter.content?.toLowerCase().includes(query)) {
                    results.push({
                        type: 'chapter',
                        category: book.title,
                        icon: book.icon,
                        item: book,
                        chapter,
                        match: chapter.title
                    });
                }
            });
        });

        // Search Religious Texts
        RELIGIOUS_TEXTS.forEach(text => {
            if (text.title.toLowerCase().includes(query)) {
                results.push({ type: 'text', category: 'Dini Metinler', icon: text.icon, item: text });
            }
            text.items?.forEach(item => {
                const searchable = `${item.title || ''} ${item.name || ''} ${item.text || ''} ${item.explanation || ''}`.toLowerCase();
                if (searchable.includes(query)) {
                    results.push({
                        type: 'text-item',
                        category: text.title,
                        icon: text.icon,
                        item: text,
                        match: item.title || item.name || item.text
                    });
                }
            });
        });

        // Search Education
        EDUCATION.forEach(edu => {
            if (edu.title.toLowerCase().includes(query)) {
                results.push({ type: 'education', category: 'Eğitim', icon: edu.icon, item: edu });
            }
            edu.topics?.forEach(topic => {
                const searchable = `${topic.title || ''} ${topic.name || ''} ${topic.content || ''} ${topic.description || ''}`.toLowerCase();
                if (searchable.includes(query)) {
                    results.push({
                        type: 'topic',
                        category: edu.title,
                        icon: edu.icon,
                        item: edu,
                        match: topic.title || topic.name
                    });
                }
            });
        });

        // Search References
        REFERENCES.forEach(ref => {
            if (ref.title.toLowerCase().includes(query)) {
                results.push({ type: 'reference', category: 'Referanslar', icon: ref.icon, item: ref });
            }
            ref.items?.forEach(item => {
                const searchable = `${item.name || ''} ${item.meaning || ''} ${item.title || ''} ${item.description || ''}`.toLowerCase();
                if (searchable.includes(query)) {
                    results.push({
                        type: 'ref-item',
                        category: ref.title,
                        icon: ref.icon,
                        item: ref,
                        match: item.name || item.title
                    });
                }
            });
        });

        // Search Audio
        AUDIO.forEach(audio => {
            if (audio.title.toLowerCase().includes(query)) {
                results.push({ type: 'audio', category: 'Sesli Kütüphane', icon: audio.icon, item: audio });
            }
            audio.items?.forEach(track => {
                if (track.title && track.title.toLowerCase().includes(query)) {
                    results.push({
                        type: 'track',
                        category: audio.title,
                        icon: audio.icon,
                        item: audio,
                        match: track.title
                    });
                }
            });
        });

        // Search FAQ
        FAQ.forEach(faq => {
            if (faq.category.toLowerCase().includes(query)) {
                results.push({ type: 'faq', category: 'Soru-Cevap', icon: faq.icon, item: faq });
            }
            faq.questions?.forEach(qa => {
                if (qa.q.toLowerCase().includes(query) || qa.a.toLowerCase().includes(query)) {
                    results.push({
                        type: 'question',
                        category: faq.category,
                        icon: faq.icon,
                        item: faq,
                        match: qa.q
                    });
                }
            });
        });

        return results.slice(0, 20); // Limit to 20 results
    }, [searchQuery, BOOKS, RELIGIOUS_TEXTS, EDUCATION, REFERENCES, AUDIO, FAQ]);

    // Handle search result click
    const handleSearchResultClick = (result) => {
        setActiveItem(result.item);
        setSearchQuery('');
    };

    // Go back navigation
    const goBack = () => {
        if (activeReciter) {
            setActiveReciter(null);
            if (audioPlayer) {
                audioPlayer.pause();
                setPlayingIndex(null);
            }
        } else if (activeItem) {
            setActiveItem(null);
            setExpandedChapter(null);
            if (audioPlayer) {
                audioPlayer.pause();
                setPlayingIndex(null);
            }
        } else if (activeCategory) {
            setActiveCategory(null);
        } else {
            onClose();
        }
    };

    // Get current title for header
    const getTitle = () => {
        if (activeReciter) return activeReciter.name;
        if (activeItem) return activeItem.title ? t(activeItem.title, { ns: 'prayers' }) : activeItem.category;
        if (activeCategory) return LIBRARY_CATEGORIES.find(c => c.id === activeCategory)?.title;
        return 'Kütüphane';
    };

    // Render category list (main view)
    const renderCategories = () => (
        <div>
            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '20px' }}>
                İslami bilgi kaynakları ve referanslar
            </p>

            {/* Search Box */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <Search size={20} color="var(--text-color-muted)" />
                <input
                    type="text"
                    placeholder="Ara... (örn: namaz, oruç, Hz. Ömer)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-color)',
                        fontSize: '14px'
                    }}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <X size={18} color="var(--text-color-muted)" />
                    </button>
                )}
            </div>

            {/* Search Results */}
            {searchQuery.length >= 2 && (
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: 'var(--text-color-muted)', fontSize: '13px', marginBottom: '10px' }}>
                        {searchResults.length > 0
                            ? `${searchResults.length} sonuç bulundu`
                            : 'Sonuç bulunamadı'}
                    </p>
                    {searchResults.map((result, index) => (
                        <div
                            key={index}
                            className="glass-card"
                            style={{ marginBottom: '8px', padding: '14px', cursor: 'pointer' }}
                            onClick={() => handleSearchResultClick(result)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '24px' }}>{result.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '14px' }}>
                                        {result.match || result.item.title || result.item.category}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                        {result.category}
                                    </div>
                                </div>
                                <ChevronRight size={18} color="var(--text-color-muted)" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Category Cards - only show when not searching */}
            {searchQuery.length < 2 && LIBRARY_CATEGORIES.map(category => (
                <div
                    key={category.id}
                    className="glass-card"
                    style={{ marginBottom: '12px', padding: '20px', cursor: 'pointer' }}
                    onClick={() => {
                        if (category.isPro && !userIsPro) {
                            setShowPaywall(true);
                        } else {
                            loadLibraryData();
                            setActiveCategory(category.id);
                        }
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '40px' }}>{category.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '18px' }}>
                                    {category.title}
                                </div>
                                {category.isPro && <Lock size={14} color="var(--primary-color)" />}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-color-muted)', marginTop: '4px' }}>
                                {libraryData ? `${category.data.length} içerik` : 'İçerikler yükleniyor...'}
                            </div>
                        </div>
                        <ChevronRight size={24} color="var(--text-color-muted)" />
                    </div>
                </div>
            ))}
        </div>
    );

    // Render items in a category
    const renderCategoryItems = () => {
        if (!libraryData) {
            return (
                <div className="glass-card" style={{ padding: '18px', color: 'var(--text-color-muted)' }}>
                    Kütüphane içeriği yükleniyor...
                </div>
            );
        }

        let items = [];
        switch (activeCategory) {
            case 'books': items = BOOKS; break;
            case 'texts': items = RELIGIOUS_TEXTS; break;
            case 'education': items = EDUCATION; break;
            case 'references': items = REFERENCES; break;
            case 'prayers': items = PRAYERS; break;
            case 'audio': items = AUDIO; break;
            case 'video': items = VIDEO; break;
            case 'faq': items = FAQ; break;
        }

        return (
            <div>
                {items.map(item => (
                    <div
                        key={item.id}
                        className="glass-card"
                        style={{ marginBottom: '12px', padding: '16px', cursor: 'pointer' }}
                        onClick={() => {
                            if (item.isPro && !userIsPro) {
                                setShowPaywall(true);
                            } else {
                                setActiveItem(item);
                            }
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <span style={{ fontSize: '32px' }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '16px' }}>
                                        {item.title ? (item.type === 'prayer' ? t(item.title, { ns: 'prayers' }) : item.title) : item.category}
                                    </div>
                                    {item.isPro && <Lock size={14} color="var(--primary-color)" />}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', marginTop: '2px' }}>
                                    {item.description}
                                </div>
                            </div>
                            <ChevronRight size={20} color="var(--text-color-muted)" />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render Reciter Content (List of Surahs)
    const renderReciterContent = () => {
        if (!activeReciter) return null;

        return (
            <div>
                <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                    {activeReciter.name} - Hatim Seti
                </p>
                {surahList.map((surah, index) => {
                    const audioUrl = getAudioUrlSync(surah.number, activeReciter.id);
                    const isPlaying = playingIndex === index;

                    return (
                        <div
                            key={surah.number}
                            className="glass-card"
                            style={{ marginBottom: '10px', padding: '14px', cursor: 'pointer' }}
                            onClick={(e) => toggleAudio(audioUrl, index, e)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button
                                    style={{
                                        background: isPlaying ? 'var(--primary-color)' : 'rgba(212, 175, 55, 0.2)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isPlaying ? 
                                        <Pause size={20} color={isPlaying ? '#fff' : 'var(--primary-color)'} /> : 
                                        <Play size={20} color={isPlaying ? '#fff' : 'var(--primary-color)'} />
                                    }
                                </button>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '15px' }}>
                                        {surah.number}. {surah.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                        {surah.nameTranslation} • {surah.ayahCount} Ayet
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render item content (chapters, items, topics, questions)
    const renderItemContent = () => {
        if (!activeItem) return null;

        // Audio Library - Reciters List
        if (activeItem.type === 'reciters') {
            if (activeReciter) return renderReciterContent();

            const reciters = getReciters();
            return (
                <div>
                    <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                        {activeItem.description}
                    </p>
                    {reciters.map((reciter) => (
                        <div
                            key={reciter.id}
                            className="glass-card"
                            style={{ marginBottom: '10px', padding: '14px', cursor: 'pointer' }}
                            onClick={() => setActiveReciter(reciter)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-color)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px'
                                }}>
                                    🎤
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '15px' }}>
                                        {reciter.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                        {reciter.country}
                                    </div>
                                </div>
                                <ChevronRight size={18} color="var(--text-color-muted)" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Audio Library - Playlist
        if (activeItem.type === 'playlist') {
            return (
                <div>
                    <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                        {activeItem.description}
                    </p>
                    {activeItem.items.map((track, index) => (
                        <div
                            key={index}
                            className="glass-card"
                            style={{ marginBottom: '10px', padding: '14px', cursor: 'pointer' }}
                            onClick={(e) => toggleAudio(track.url, index, e)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button
                                    style={{
                                        background: playingIndex === index ? 'var(--primary-color)' : 'rgba(212, 175, 55, 0.2)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {playingIndex === index ? 
                                        <Pause size={20} color={playingIndex === index ? '#fff' : 'var(--primary-color)'} /> : 
                                        <Play size={20} color={playingIndex === index ? '#fff' : 'var(--primary-color)'} />
                                    }
                                </button>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '15px' }}>
                                        {track.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                        {track.duration}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }



        // Prophet Prayers
        if (activeItem.type === 'prayer') {

            return (
                <div>
                    <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                        {activeItem.prophet && (
                            <div style={{ 
                                fontSize: '14px', 
                                color: 'var(--primary-color)', 
                                fontWeight: '600',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {activeItem.prophet}
                            </div>
                        )}
                        
                        <h2 style={{ 
                            fontSize: '24px', 
                            color: 'var(--text-color)', 
                            marginBottom: '16px',
                            fontWeight: '700'
                        }}>
                            {t(activeItem.title)}
                        </h2>

                        {activeItem.situation && (
                            <div style={{ 
                                fontSize: '14px', 
                                color: 'var(--text-color-muted)',
                                marginBottom: '24px',
                                fontStyle: 'italic'
                            }}>
                                "{activeItem.situation}"
                            </div>
                        )}

                        <div style={{ 
                            background: 'rgba(212, 175, 55, 0.05)', 
                            padding: '24px', 
                            borderRadius: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ 
                                fontFamily: 'var(--arabic-font-family)', 
                                fontSize: '28px', 
                                color: 'var(--text-color)', 
                                lineHeight: '2',
                                marginBottom: '20px',
                                direction: 'rtl'
                            }}>
                                {activeItem.arabic}
                            </div>
                            
                            <div style={{ 
                                fontSize: '16px', 
                                color: 'var(--text-color-muted)', 
                                marginBottom: '16px',
                                lineHeight: '1.6'
                            }}>
                                {activeItem.transliteration || activeItem.turkish}
                            </div>

                            <div style={{ 
                                fontSize: '18px', 
                                color: 'var(--primary-color)', 
                                fontWeight: '500',
                                lineHeight: '1.6'
                            }}>
                                {t(activeItem.meaning)}
                            </div>
                        </div>

                        {activeItem.source && (
                            <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', marginTop: '24px', textAlign: 'center' }}>
                                Kaynak: {activeItem.source}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Video Library - İslami Akademi Episodes
        if (activeItem.type === 'video') {
            return (
                <div>
                    <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                        {activeItem.description}
                    </p>
                    
                    {/* Series Info */}
                    <div className="glass-card" style={{ 
                        marginBottom: '16px', 
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(155, 89, 182, 0.1))'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '36px' }}>{activeItem.icon}</span>
                            <div>
                                <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '16px' }}>
                                    {activeItem.episodes?.length || 0} Bölüm
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                    Premium İçerik • Video Serisi
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Episode List */}
                    {activeItem.episodes?.map((episode, index) => (
                        <div
                            key={index}
                            className="glass-card"
                            style={{ marginBottom: '10px', padding: '14px', cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.3), rgba(52, 152, 219, 0.3))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    position: 'relative'
                                }}>
                                    {episode.thumbnail}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-4px',
                                        right: '-4px',
                                        background: 'var(--primary-color)',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Play size={10} color="#fff" />
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '14px' }}>
                                        {episode.number}. {episode.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                        ⏱️ {episode.duration}
                                    </div>
                                </div>
                                <ChevronRight size={18} color="var(--text-color-muted)" />
                            </div>
                        </div>
                    ))}

                    {/* Coming Soon Notice */}
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '20px',
                        color: 'var(--text-color-muted)',
                        fontSize: '13px'
                    }}>
                        🎬 Video içerikler yakında eklenecek
                    </div>
                </div>
            );
        }

        // External Video - YouTube Channel/Playlist Redirect
        if (activeItem.type === 'external_video') {
            const openYouTube = (url) => {
                window.open(url, '_blank', 'noopener,noreferrer');
            };

            const youtubeSearchUrl = activeItem.searchQuery 
                ? `https://www.youtube.com/results?search_query=${encodeURIComponent(activeItem.searchQuery)}`
                : null;

            return (
                <div>
                    <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                        {activeItem.description}
                    </p>
                    
                    {/* Source Info */}
                    <div className="glass-card" style={{ 
                        marginBottom: '16px', 
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(155, 89, 182, 0.1))'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: '#ff0000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Play size={24} color="#fff" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '15px' }}>
                                    {activeItem.source}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                    YouTube Kanalı • {activeItem.topics?.length || 0} Konu
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Topics List */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            color: 'var(--text-color-muted)',
                            marginBottom: '10px'
                        }}>
                            📚 İçerik Konuları
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {activeItem.topics?.map((topic, index) => (
                                <span 
                                    key={index}
                                    style={{
                                        padding: '6px 12px',
                                        background: 'rgba(212, 175, 55, 0.1)',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        color: 'var(--primary-color)'
                                    }}
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activeItem.channelUrl && (
                            <button
                                onClick={() => openYouTube(activeItem.channelUrl)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: '#ff0000',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Play size={18} />
                                YouTube Kanalına Git
                            </button>
                        )}

                        {activeItem.playlistUrl && (
                            <button
                                onClick={() => openYouTube(activeItem.playlistUrl)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'transparent',
                                    border: '2px solid #ff0000',
                                    borderRadius: '12px',
                                    color: '#ff0000',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                📋 Oynatma Listelerini Gör
                            </button>
                        )}

                        {youtubeSearchUrl && (
                            <button
                                onClick={() => openYouTube(youtubeSearchUrl)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px',
                                    color: 'var(--text-color)',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Search size={16} />
                                YouTube'da Ara
                            </button>
                        )}
                    </div>

                    {/* Info Note */}
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '16px',
                        marginTop: '16px',
                        color: 'var(--text-color-muted)',
                        fontSize: '12px',
                        lineHeight: '1.5'
                    }}>
                        ℹ️ Video içerikler harici kaynaklardan sağlanmaktadır. 
                        YouTube uygulamasına yönlendirileceksiniz.
                    </div>
                </div>
            );
        }

        // Books with chapters
        if (activeItem.chapters) {
            return (
                <div>
                    <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                        {activeItem.description}
                    </p>
                    {activeItem.chapters.map((chapter, index) => (
                        <div
                            key={index}
                            className="glass-card"
                            style={{ marginBottom: '10px', padding: '14px', cursor: 'pointer' }}
                            onClick={() => setExpandedChapter(expandedChapter === index ? null : index)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '15px' }}>
                                    {chapter.title}
                                </div>
                                {expandedChapter === index ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                            {expandedChapter === index && (
                                <div style={{
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid var(--glass-border)',
                                    fontSize: '14px',
                                    lineHeight: '1.7',
                                    color: 'var(--text-color)'
                                }}>
                                    {chapter.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        // Religious texts with items
        if (activeItem.items) {
            return (
                <div>
                    <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                        {activeItem.description}
                    </p>
                    {activeItem.items.map((item, index) => (
                        <div
                            key={index}
                            className="glass-card"
                            style={{ marginBottom: '10px', padding: '14px', cursor: 'pointer' }}
                            onClick={() => setExpandedChapter(expandedChapter === index ? null : index)}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <span style={{
                                    background: 'var(--primary-color)',
                                    color: '#fff',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    flexShrink: 0
                                }}>
                                    {item.number}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '14px' }}>
                                        {item.title || item.name || item.text}
                                    </div>
                                    {item.arabic && (
                                        <div style={{
                                            fontFamily: "var(--arabic-font-family)",
                                            fontSize: '18px',
                                            textAlign: 'right',
                                            direction: 'rtl',
                                            color: 'var(--primary-color)',
                                            marginTop: '8px'
                                        }}>
                                            {item.arabic}
                                        </div>
                                    )}
                                    {expandedChapter === index && (
                                        <div style={{
                                            marginTop: '10px',
                                            fontSize: '13px',
                                            lineHeight: '1.6',
                                            color: 'var(--text-color-muted)'
                                        }}>
                                            {item.text && (
                                                <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-color)' }}>
                                                    Okunuşu: <span style={{ fontWeight: '400' }}>{item.text}</span>
                                                </div>
                                            )}
                                            {item.explanation || item.meaning || item.description}
                                        </div>
                                    )}
                                </div>
                                {expandedChapter === index ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Education with topics
        if (activeItem.topics) {
            return (
                <div>
                    <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                        {activeItem.description}
                    </p>
                    {activeItem.topics.map((topic, index) => (
                        <div
                            key={index}
                            className="glass-card"
                            style={{ marginBottom: '10px', padding: '14px', cursor: 'pointer' }}
                            onClick={() => setExpandedChapter(expandedChapter === index ? null : index)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {topic.letter && (
                                        <span style={{
                                            fontSize: '28px',
                                            fontFamily: "var(--arabic-font-family)",
                                            color: 'var(--primary-color)',
                                            width: '40px',
                                            textAlign: 'center'
                                        }}>
                                            {topic.letter}
                                        </span>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '15px' }}>
                                            {topic.title || topic.name}
                                        </div>
                                        {topic.pronunciation && (
                                            <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                                Okunuşu: {topic.pronunciation}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {topic.letter && (
                                        <button
                                            onClick={(e) => speakArabic(topic.letter, index, e)}
                                            style={{
                                                background: playingIndex === index ? 'var(--primary-color)' : 'rgba(212, 175, 55, 0.2)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Volume2 size={18} color={playingIndex === index ? '#fff' : 'var(--primary-color)'} />
                                        </button>
                                    )}
                                    {expandedChapter === index ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </div>
                            </div>
                            {expandedChapter === index && (
                                <div style={{
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid var(--glass-border)',
                                    fontSize: '14px',
                                    lineHeight: '1.7',
                                    color: 'var(--text-color)'
                                }}>
                                    {topic.content || topic.description}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        // FAQ with questions
        if (activeItem.questions) {
            return (
                <div>
                    {activeItem.questions.map((qa, index) => (
                        <div
                            key={index}
                            className="glass-card"
                            style={{ marginBottom: '10px', padding: '14px', cursor: 'pointer' }}
                            onClick={() => setExpandedChapter(expandedChapter === index ? null : index)}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '14px', flex: 1 }}>
                                    {qa.q}
                                </div>
                                {expandedChapter === index ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                            {expandedChapter === index && (
                                <div style={{
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid var(--glass-border)',
                                    fontSize: '14px',
                                    lineHeight: '1.7',
                                    color: 'var(--text-color)'
                                }}>
                                    {qa.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingTop: '20px'
            }}>
                <IslamicBackButton onClick={goBack} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    📚 {getTitle()}
                </h1>
            </div>

            {/* Content */}
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {!activeCategory && renderCategories()}
                {activeCategory && !activeItem && renderCategoryItems()}
                {activeItem && renderItemContent()}
            </div>

            {/* Paywall Modal */}
            {showPaywall && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(var(--surface-blur))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: '24px',
                        padding: '32px 24px',
                        maxWidth: '360px',
                        width: '100%',
                        textAlign: 'center',
                        border: '1px solid var(--glass-border)',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        {/* Premium Badge */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)'
                        }}>
                            <Crown size={40} color="#fff" />
                        </div>

                        <h2 style={{ 
                            color: 'var(--primary-color)', 
                            margin: '0 0 12px',
                            fontSize: '22px',
                            fontWeight: '700'
                        }}>
                            Premium İçerik
                        </h2>

                        <p style={{ 
                            color: 'var(--text-color-muted)', 
                            fontSize: '14px',
                            lineHeight: '1.6',
                            margin: '0 0 24px'
                        }}>
                            Bu içerik Huzur Pro aboneliklerine özeldir. 
                            Tüm premium özelliklere erişmek için Pro'ya yükseltin.
                        </p>

                        {/* Features */}
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '10px',
                            marginBottom: '24px',
                            textAlign: 'left'
                        }}>
                            {[
                                { icon: '🎧', text: 'Ünlü hafızlardan hatim setleri' },
                                { icon: '📚', text: 'Sesli kitap ve sohbetler' },
                                { icon: '🎬', text: 'İslami Akademi video serileri' },
                                { icon: '✨', text: 'Reklamsız deneyim' }
                            ].map((feature, i) => (
                                <div key={i} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px',
                                    padding: '10px 12px',
                                    background: 'rgba(212, 175, 55, 0.1)',
                                    borderRadius: '10px'
                                }}>
                                    <span style={{ fontSize: '18px' }}>{feature.icon}</span>
                                    <span style={{ fontSize: '13px', color: 'var(--text-color)' }}>
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={() => {
                                setShowPaywall(false);
                                if (onShowPro) onShowPro();
                            }}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                                border: 'none',
                                borderRadius: '14px',
                                color: '#000',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginBottom: '12px'
                            }}
                        >
                            <Sparkles size={18} />
                            Pro'ya Yükselt
                        </button>

                        <button
                            onClick={() => setShowPaywall(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-color-muted)',
                                fontSize: '14px',
                                cursor: 'pointer',
                                padding: '8px'
                            }}
                        >
                            Belki Daha Sonra
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Library;
