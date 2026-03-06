import { useState, useEffect } from 'react';
import { RotateCcw, Check, ChevronRight, ChevronDown, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TESPIHAT_SECTIONS, TESBIHLER, TEVHID, NAMAZSONRASI_DUALAR } from '../data/tespihatData';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';
import './Navigation.css';

const TESPIHAT_PROGRESS_KEY = 'tespihat_progress';
const DEFAULT_TESBIH_COUNTS = {
    subhanallah: 0,
    elhamdulillah: 0,
    allahuekber: 0
};

function Tespihat({ onClose }) {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null);
    const [tesbihCounts, setTesbihCounts] = useState(() => {
        const saved = storageService.getItem(TESPIHAT_PROGRESS_KEY, null);
        return saved?.counts || DEFAULT_TESBIH_COUNTS;
    });
    const [completedSections, setCompletedSections] = useState(() => {
        const saved = storageService.getItem(TESPIHAT_PROGRESS_KEY, null);
        return saved?.completed || [];
    });

    useEffect(() => {
        storageService.setItem(TESPIHAT_PROGRESS_KEY, {
            counts: tesbihCounts,
            completed: completedSections
        });
    }, [tesbihCounts, completedSections]);

    const incrementTesbih = (id) => {
        setTesbihCounts(prev => ({
            ...prev,
            [id]: Math.min(prev[id] + 1, 33)
        }));

        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    };

    const resetAll = () => {
        setTesbihCounts(DEFAULT_TESBIH_COUNTS);
        setCompletedSections([]);
    };

    const toggleComplete = (id) => {
        setCompletedSections(prev =>
            prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id]
        );
    };

    const totalProgress = () => {
        const tesbihComplete = Object.values(tesbihCounts).filter(c => c >= 33).length;
        const sectionsComplete = completedSections.length;
        const total = TESPIHAT_SECTIONS.length + 3 + 1; 
        return Math.round(((sectionsComplete + tesbihComplete) / total) * 100);
    };

    const renderMenu = () => (
        <div className="reveal-stagger">
            {/* Progress Card */}
            <div className="settings-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', padding: '24px', color: 'white', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{totalProgress()}%</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('tespihat.ui.progressToday', 'Bugünkü İlerleme')}</div>
                    </div>
                    <button onClick={resetAll} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '12px', padding: '10px', color: 'white', cursor: 'pointer' }}>
                        <RotateCcw size={18} />
                    </button>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${totalProgress()}%`, height: '100%', background: 'white', borderRadius: '4px', transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                </div>
            </div>

            {/* Sections */}
            <div className="settings-group">
                <div className="settings-group-title">{t('tespihat.ui.postPrayerDhikr', 'Namaz Sonrası Zikirler')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {TESPIHAT_SECTIONS.map(section => (
                        <div
                            key={section.id}
                            className="settings-card"
                            style={{ 
                                padding: '16px',
                                borderLeft: completedSections.includes(section.id) ? '4px solid #10b981' : '1px solid var(--nav-border)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => setActiveSection(section)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                                <div className="settings-icon-box" style={{ background: 'var(--nav-hover)', fontSize: '1.5rem' }}>
                                    {section.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '800', color: 'var(--nav-text)' }}>{section.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)' }}>{section.subtitle}</div>
                                </div>
                                {completedSections.includes(section.id) ? (
                                    <CheckCircle2 size={22} color="#10b981" />
                                ) : (
                                    <ChevronRight size={20} color="var(--nav-text-muted)" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 33'lük Tesbihler */}
            <div className="settings-group" style={{ marginTop: '32px' }}>
                <div className="settings-group-title">{t('tespihat.ui.tasbih33', "33'lük Tesbihler")}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {TESBIHLER.map(tesbih => {
                        const count = tesbihCounts[tesbih.id];
                        const isComplete = count >= 33;
                        return (
                            <div 
                                key={tesbih.id}
                                onClick={() => incrementTesbih(tesbih.id)}
                                className="settings-card"
                                style={{
                                    flexDirection: 'column',
                                    padding: '16px 12px',
                                    textAlign: 'center',
                                    gap: '12px',
                                    background: isComplete ? 'rgba(16, 185, 129, 0.05)' : 'var(--nav-bg)',
                                    border: isComplete ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--nav-border)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontSize: '1.2rem', fontFamily: 'var(--arabic-font)', color: isComplete ? '#10b981' : 'var(--nav-text)' }}>{tesbih.arabic}</div>
                                <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto' }}>
                                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                        <circle cx="30" cy="30" r="28" fill="none" stroke="var(--nav-hover)" strokeWidth="4" />
                                        <circle cx="30" cy="30" r="28" fill="none" stroke={isComplete ? '#10b981' : 'var(--nav-accent)'} strokeWidth="4" strokeDasharray="175.9" strokeDashoffset={175.9 - (count / 33 * 175.9)} style={{ transition: 'stroke-dashoffset 0.3s' }} />
                                    </svg>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem', color: isComplete ? '#10b981' : 'var(--nav-text)' }}>
                                        {count}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{tesbih.latin}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tawhid & Duas */}
            <div className="settings-group" style={{ marginTop: '32px' }}>
                <div className="settings-group-title">{t('tespihat.ui.postPrayerDuas', 'Tevhid ve Dualar')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="settings-card" style={{ padding: '16px', flexDirection: 'column', gap: '12px' }} onClick={() => setExpandedItem(expandedItem === 'tevhid' ? null : 'tevhid')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div style={{ fontWeight: '800', color: 'var(--nav-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Sparkles size={18} color="#f59e0b" />
                                {TEVHID.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleComplete('tevhid'); }}
                                    style={{
                                        background: completedSections.includes('tevhid') ? '#10b981' : 'var(--nav-hover)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '6px 12px',
                                        color: completedSections.includes('tevhid') ? 'white' : 'var(--nav-text-muted)',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: '800'
                                    }}
                                >
                                    {completedSections.includes('tevhid') ? 'TAMAM' : 'BİTTİ'}
                                </button>
                                {expandedItem === 'tevhid' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                        </div>
                        {expandedItem === 'tevhid' && (
                            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--nav-border)', animation: 'slideDown 0.3s ease-out' }}>
                                <div style={{ fontSize: '1.5rem', fontFamily: 'var(--arabic-font)', color: 'var(--nav-text)', marginBottom: '16px', textAlign: 'right', direction: 'rtl', lineHeight: '1.8' }}>{TEVHID.arabic}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--nav-text)', marginBottom: '8px', lineHeight: '1.5' }}>{TEVHID.latin}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontStyle: 'italic' }}>{TEVHID.meaning}</div>
                            </div>
                        )}
                    </div>

                    {NAMAZSONRASI_DUALAR.map(dua => (
                        <div key={dua.id} className="settings-card" style={{ padding: '16px', flexDirection: 'column', gap: '12px' }} onClick={() => setExpandedItem(expandedItem === dua.id ? null : dua.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <div style={{ fontWeight: '800', color: 'var(--nav-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <BookOpen size={18} color="var(--nav-accent)" />
                                    {dua.title}
                                </div>
                                {expandedItem === dua.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                            {expandedItem === dua.id && (
                                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--nav-border)', animation: 'slideDown 0.3s ease-out' }}>
                                    <div style={{ fontSize: '1.3rem', fontFamily: 'var(--arabic-font)', color: 'var(--nav-text)', marginBottom: '16px', textAlign: 'right', direction: 'rtl', lineHeight: '1.8' }}>{dua.arabic}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--nav-text)', marginBottom: '8px', lineHeight: '1.5' }}>{dua.latin}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontStyle: 'italic' }}>{dua.meaning}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSectionDetail = () => (
        <div className="reveal-stagger">
            <div className="settings-card" style={{ flexDirection: 'column', padding: '32px', textAlign: 'center', gap: '24px', background: 'var(--nav-hover)', border: 'none' }}>
                <div style={{ fontSize: '3rem' }}>{activeSection.icon}</div>
                <div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: '900', color: 'var(--nav-accent)' }}>{activeSection.title}</h2>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--nav-text-muted)' }}>{activeSection.subtitle}</p>
                </div>

                <div style={{ fontSize: '1.8rem', fontFamily: 'var(--arabic-font)', color: 'var(--nav-text)', lineHeight: '1.8', direction: 'rtl', background: 'var(--nav-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--nav-border)' }}>
                    {activeSection.arabic}
                </div>

                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.95rem', color: 'var(--nav-text)', fontWeight: '500', lineHeight: '1.5' }}>{activeSection.latin}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontStyle: 'italic', lineHeight: '1.5' }}>{activeSection.meaning}</div>
                </div>

                <button
                    onClick={() => {
                        toggleComplete(activeSection.id);
                        setActiveSection(null);
                    }}
                    style={{
                        width: '100%',
                        padding: '18px',
                        background: completedSections.includes(activeSection.id) ? 'var(--nav-hover)' : 'var(--nav-accent)',
                        border: 'none',
                        borderRadius: '16px',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'all 0.2s',
                        marginTop: '12px',
                        boxShadow: completedSections.includes(activeSection.id) ? 'none' : '0 8px 24px rgba(249, 115, 22, 0.3)'
                    }}
                >
                    <Check size={20} />
                    {completedSections.includes(activeSection.id) ? 'TAMAMLANDI' : 'TAMAMLA'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={() => activeSection ? setActiveSection(null) : onClose()} size="medium" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                    {activeSection ? activeSection.title : t('tespihat.ui.title', 'Tespihat')}
                </h2>
            </div>

            {activeSection ? renderSectionDetail() : renderMenu()}
        </div>
    );
}

export default Tespihat;
