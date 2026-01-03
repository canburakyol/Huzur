import { useState, useMemo } from 'react';
import { ArrowLeft, ChevronRight, ChevronDown, Book, Search, Volume2, X } from 'lucide-react';
import { LIBRARY_CATEGORIES, BOOKS, RELIGIOUS_TEXTS, EDUCATION, REFERENCES, FAQ } from '../data/libraryData';

function Library({ onClose }) {
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [expandedChapter, setExpandedChapter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [playingIndex, setPlayingIndex] = useState(null);

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
    }, [searchQuery]);

    // Handle search result click
    const handleSearchResultClick = (result) => {
        setActiveItem(result.item);
        setSearchQuery('');
    };

    // Go back navigation
    const goBack = () => {
        if (activeItem) {
            setActiveItem(null);
            setExpandedChapter(null);
        } else if (activeCategory) {
            setActiveCategory(null);
        } else {
            onClose();
        }
    };

    // Get current title for header
    const getTitle = () => {
        if (activeItem) return activeItem.title || activeItem.category;
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
                    onClick={() => setActiveCategory(category.id)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '40px' }}>{category.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '18px' }}>
                                {category.title}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-color-muted)', marginTop: '4px' }}>
                                {category.data.length} içerik
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
        let items = [];
        switch (activeCategory) {
            case 'books': items = BOOKS; break;
            case 'texts': items = RELIGIOUS_TEXTS; break;
            case 'education': items = EDUCATION; break;
            case 'references': items = REFERENCES; break;
            case 'faq': items = FAQ; break;
        }

        return (
            <div>
                {items.map(item => (
                    <div
                        key={item.id}
                        className="glass-card"
                        style={{ marginBottom: '12px', padding: '16px', cursor: 'pointer' }}
                        onClick={() => setActiveItem(item)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <span style={{ fontSize: '32px' }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '16px' }}>
                                    {item.title || item.category}
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

    // Render item content (chapters, items, topics, questions)
    const renderItemContent = () => {
        if (!activeItem) return null;

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
                                            fontFamily: "'Amiri', serif",
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
                                            fontFamily: "'Amiri', serif",
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
                <button
                    onClick={goBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: 'var(--primary-color)'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
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
        </div>
    );
}

export default Library;
