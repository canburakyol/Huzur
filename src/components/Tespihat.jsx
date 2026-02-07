import { useState, useEffect } from 'react';
import { RotateCcw, Check, ChevronRight, ChevronDown, Volume2 } from 'lucide-react';
import { TESPIHAT_SECTIONS, TESBIHLER, TEVHID, NAMAZSONRASI_DUALAR } from '../data/tespihatData';
import IslamicBackButton from './shared/IslamicBackButton';

function Tespihat({ onClose }) {
    const [activeSection, setActiveSection] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null);
    const [tesbihCounts, setTesbihCounts] = useState({
        subhanallah: 0,
        elhamdulillah: 0,
        allahuekber: 0
    });
    const [completedSections, setCompletedSections] = useState([]);

    // Load saved progress
    useEffect(() => {
        const saved = localStorage.getItem('tespihat_progress');
        if (saved) {
            const data = JSON.parse(saved);
            setTesbihCounts(data.counts || { subhanallah: 0, elhamdulillah: 0, allahuekber: 0 }); // eslint-disable-line
            setCompletedSections(data.completed || []);
        }
    }, []);

    // Save progress
    useEffect(() => {
        localStorage.setItem('tespihat_progress', JSON.stringify({
            counts: tesbihCounts,
            completed: completedSections
        }));
    }, [tesbihCounts, completedSections]);

    // Increment tesbih counter
    const incrementTesbih = (id) => {
        setTesbihCounts(prev => ({
            ...prev,
            [id]: Math.min(prev[id] + 1, 33)
        }));

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    };

    // Reset single tesbih
    const resetTesbih = (id) => {
        setTesbihCounts(prev => ({
            ...prev,
            [id]: 0
        }));
    };

    // Reset all
    const resetAll = () => {
        setTesbihCounts({ subhanallah: 0, elhamdulillah: 0, allahuekber: 0 });
        setCompletedSections([]);
    };

    // Mark section as complete
    const toggleComplete = (id) => {
        setCompletedSections(prev =>
            prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id]
        );
    };

    // Calculate total progress
    const totalProgress = () => {
        const tesbihComplete = Object.values(tesbihCounts).filter(c => c >= 33).length;
        const sectionsComplete = completedSections.length;
        const total = TESPIHAT_SECTIONS.length + 3 + 1; // sections + 3 tesbihs + tevhid
        return Math.round(((sectionsComplete + tesbihComplete) / total) * 100);
    };

    // Render main menu
    const renderMenu = () => (
        <div>
            {/* Progress Bar */}
            <div style={{
                background: 'var(--glass-bg)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-color)' }}>Bugünkü İlerleme</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-color)' }}>{totalProgress()}%</span>
                </div>
                <div style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${totalProgress()}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary-color), var(--accent-vibrant))',
                        borderRadius: '4px',
                        transition: 'var(--transition-smooth)'
                    }} />
                </div>
                <button
                    onClick={resetAll}
                    style={{
                        marginTop: '12px',
                        background: 'none',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        color: 'var(--text-color-muted)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'var(--transition-smooth)'
                    }}
                >
                    <RotateCcw size={14} />
                    Sıfırla
                </button>
            </div>

            {/* Tespihat Sections */}
            <h3 style={{ color: 'var(--primary-color)', fontSize: '16px', marginBottom: '12px' }}>
                📿 Namaz Sonrası Zikirler
            </h3>

            {TESPIHAT_SECTIONS.map(section => (
                <div
                    key={section.id}
                    className="glass-card"
                    style={{
                        marginBottom: '10px',
                        padding: '14px',
                        cursor: 'pointer',
                        borderLeft: completedSections.includes(section.id)
                            ? '3px solid var(--primary-color)'
                            : '3px solid transparent'
                    }}
                    onClick={() => setActiveSection(section)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{section.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '15px' }}>
                                {section.title}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                {section.subtitle}
                            </div>
                        </div>
                        {completedSections.includes(section.id) ? (
                            <Check size={20} color="var(--primary-color)" />
                        ) : (
                            <ChevronRight size={20} color="var(--text-color-muted)" />
                        )}
                    </div>
                </div>
            ))}

            {/* 33'lük Tesbihler */}
            <h3 style={{ color: 'var(--primary-color)', fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>
                📿 33'lük Tesbihler
            </h3>

            {TESBIHLER.map(tesbih => (
                <div
                    key={tesbih.id}
                    className="glass-card"
                    style={{
                        marginBottom: '10px',
                        padding: '16px',
                        borderLeft: tesbihCounts[tesbih.id] >= 33
                            ? `3px solid ${tesbih.color}`
                            : '3px solid transparent'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{
                                fontFamily: "'Amiri', serif",
                                fontSize: '24px',
                                color: tesbih.color,
                                marginBottom: '4px'
                            }}>
                                {tesbih.arabic}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--primary-color)', fontWeight: '600' }}>
                                {tesbih.latin}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                {tesbih.meaning}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div
                                onClick={() => incrementTesbih(tesbih.id)}
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '50%',
                                    background: tesbihCounts[tesbih.id] >= 33
                                        ? tesbih.color
                                        : `linear-gradient(135deg, ${tesbih.color}33, ${tesbih.color}66)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: `2px solid ${tesbih.color}`,
                                    transition: 'var(--transition-smooth)',
                                    boxShadow: `0 4px 12px ${tesbih.color}33`
                                }}
                            >
                                <span style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: tesbihCounts[tesbih.id] >= 33 ? '#fff' : tesbih.color
                                }}>
                                    {tesbihCounts[tesbih.id]}
                                </span>
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: 'var(--text-color-muted)',
                                marginTop: '6px'
                            }}>
                                / 33
                            </div>
                            {tesbihCounts[tesbih.id] > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); resetTesbih(tesbih.id); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-color-muted)',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        marginTop: '4px',
                                        transition: 'var(--transition-smooth)'
                                    }}
                                >
                                    Sıfırla
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Tevhid */}
            <h3 style={{ color: 'var(--primary-color)', fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>
                🌟 Tevhid
            </h3>
            <div
                className="glass-card"
                style={{
                    marginBottom: '10px',
                    padding: '16px',
                    cursor: 'pointer',
                    borderLeft: completedSections.includes('tevhid')
                        ? '3px solid var(--primary-color)'
                        : '3px solid transparent'
                }}
                onClick={() => setExpandedItem(expandedItem === 'tevhid' ? null : 'tevhid')}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '15px' }}>
                        {TEVHID.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleComplete('tevhid'); }}
                            style={{
                                background: completedSections.includes('tevhid') ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Check size={16} color={completedSections.includes('tevhid') ? '#fff' : 'var(--text-color-muted)'} />
                        </button>
                        {expandedItem === 'tevhid' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                </div>
                {expandedItem === 'tevhid' && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                        <div style={{
                            fontFamily: "'Amiri', serif",
                            fontSize: '22px',
                            textAlign: 'right',
                            direction: 'rtl',
                            color: 'var(--primary-color)',
                            lineHeight: '1.8',
                            marginBottom: '12px'
                        }}>
                            {TEVHID.arabic}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-color)', marginBottom: '8px' }}>
                            {TEVHID.latin}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-color-muted)', fontStyle: 'italic' }}>
                            {TEVHID.meaning}
                        </div>
                    </div>
                )}
            </div>

            {/* Dualar */}
            <h3 style={{ color: 'var(--primary-color)', fontSize: '16px', marginTop: '24px', marginBottom: '12px' }}>
                🤲 Namaz Sonrası Dualar
            </h3>
            {NAMAZSONRASI_DUALAR.map(dua => (
                <div
                    key={dua.id}
                    className="glass-card"
                    style={{ marginBottom: '10px', padding: '14px', cursor: 'pointer' }}
                    onClick={() => setExpandedItem(expandedItem === dua.id ? null : dua.id)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '14px' }}>
                            {dua.title}
                        </div>
                        {expandedItem === dua.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                    {expandedItem === dua.id && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                            <div style={{
                                fontFamily: "'Amiri', serif",
                                fontSize: '20px',
                                textAlign: 'right',
                                direction: 'rtl',
                                color: 'var(--primary-color)',
                                lineHeight: '1.8',
                                marginBottom: '12px'
                            }}>
                                {dua.arabic}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-color)', marginBottom: '8px' }}>
                                {dua.latin}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', fontStyle: 'italic' }}>
                                {dua.meaning}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    // Render section detail
    const renderSectionDetail = () => {
        if (!activeSection) return null;

        return (
            <div>
                <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '48px' }}>{activeSection.icon}</span>
                    </div>
                    <h2 style={{
                        color: 'var(--primary-color)',
                        fontSize: '20px',
                        textAlign: 'center',
                        marginBottom: '8px'
                    }}>
                        {activeSection.title}
                    </h2>
                    <p style={{
                        color: 'var(--text-color-muted)',
                        fontSize: '14px',
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                        {activeSection.subtitle}
                    </p>

                    {/* Arabic Text */}
                    <div style={{
                        fontFamily: "'Amiri', serif",
                        fontSize: '26px',
                        textAlign: 'center',
                        direction: 'rtl',
                        color: 'var(--primary-color)',
                        lineHeight: '2',
                        marginBottom: '20px',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px'
                    }}>
                        {activeSection.arabic}
                    </div>

                    {/* Latin */}
                    <div style={{
                        fontSize: '16px',
                        color: 'var(--text-color)',
                        textAlign: 'center',
                        marginBottom: '16px',
                        lineHeight: '1.6'
                    }}>
                        {activeSection.latin}
                    </div>

                    {/* Meaning */}
                    <div style={{
                        fontSize: '14px',
                        color: 'var(--text-color-muted)',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        lineHeight: '1.6'
                    }}>
                        {activeSection.meaning}
                    </div>
                </div>

                {/* Complete Button */}
                <button
                    onClick={() => {
                        toggleComplete(activeSection.id);
                        setActiveSection(null);
                    }}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: completedSections.includes(activeSection.id)
                            ? 'rgba(255,255,255,0.1)'
                            : 'var(--primary-color)',
                        border: 'none',
                        borderRadius: '12px',
                        color: completedSections.includes(activeSection.id)
                            ? 'var(--text-color)'
                            : '#fff',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Check size={20} />
                    {completedSections.includes(activeSection.id) ? 'Tamamlandı ✓' : 'Tamamla'}
                </button>
            </div>
        );
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingTop: '20px'
            }}>
                <IslamicBackButton onClick={() => activeSection ? setActiveSection(null) : onClose()} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    🤲 {activeSection ? activeSection.title : 'Tespihat'}
                </h1>
            </div>

            {/* Content */}
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {activeSection ? renderSectionDetail() : renderMenu()}
            </div>
        </div>
    );
}

export default Tespihat;
