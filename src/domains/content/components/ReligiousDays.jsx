import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Info, Clock } from 'lucide-react';
import { religiousDays as allReligiousDays, parseLocalDate, upcomingReligiousDays } from '../../../data/religiousDays';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';

const ReligiousDays = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';
    const year = new Date().getFullYear();
    // This year and next: the shared table spans several years.
    const religiousDays = allReligiousDays.filter((day) => day.date.startsWith(String(year)) || day.date.startsWith(String(year + 1)));

    const formatDate = (dateStr) => {
        const date = parseLocalDate(dateStr);
        return date.toLocaleDateString(i18n.language, { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    const isPast = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return parseLocalDate(dateStr) < today;
    };

    const getDaysRemaining = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = parseLocalDate(dateStr);
        const diffTime = target - today;
        // round, not ceil: a DST day is 23 or 25 hours long
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const nextDay = useMemo(() => {
        return upcomingReligiousDays()[0];
    }, []);

    return (
        <div className="settings-container reveal-stagger" style={{ paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--ink)', fontWeight: '950', letterSpacing: '-0.5px' }}>
                        {t('religiousDays.title', 'Dini Günler')}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)', fontWeight: '600' }}>
                        {year}–{year + 1} {t('religiousDays.calendar', 'Takvimi')}
                    </p>
                </div>
            </div>

            {/* Next Day Feature Card */}
            {nextDay && (
                <div className="settings-card reveal-stagger" style={{ 
                    padding: '32px 24px', 
                    marginBottom: '32px',
                    background: 'var(--brand-ink)',
                    color: 'var(--on-primary)',
                    border: 'none',
                    borderRadius: '28px',
                    boxShadow: 'var(--elevation-2)',
                    flexDirection: 'column',
                    alignItems: 'stretch'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div className="settings-icon-box" style={{ background: 'rgba(255,255,255,0.2)', color: 'var(--on-primary)', border: 'none' }}>
                            <Calendar size={24} />
                        </div>
                        <div style={{ 
                            background: 'rgba(255,255,255,0.2)', 
                            padding: '6px 14px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            fontWeight: '950',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                             {t('religiousDays.nextUpcoming', 'Sıradaki')}
                        </div>
                    </div>
                    
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: '950', color: 'var(--on-primary)' }}>
                        {t(`religiousDayKinds.${nextDay.kind}.name`, nextDay.name)}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', opacity: 0.9, fontWeight: '700' }}>
                        <Clock size={16} />
                        <span>{formatDate(nextDay.date)}</span>
                    </div>

                    <div style={{ 
                        background: 'rgba(255,255,255,0.15)', 
                        padding: '16px', 
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '950' }}>{getDaysRemaining(nextDay.date)}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '800', opacity: 0.9 }}>{t('religiousDays.daysLeft', 'GÜN KALDI')}</div>
                    </div>
                </div>
            )}

            {/* Days List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="reveal-stagger">
                {religiousDays.map((day, index) => {
                    const past = isPast(day.date);
                    const isNext = nextDay && nextDay.date === day.date;
                    
                    if (isNext) return null;

                    return (
                        <div
                            key={index}
                            className="settings-card"
                            style={{
                                padding: '16px 20px',
                                background: past ? 'rgba(255,255,255,0.01)' : 'var(--paper-sunken)',
                                opacity: past ? 0.5 : 1,
                                border: past ? '1px dashed var(--line)' : '1px solid var(--line)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'default',
                                '--delay': `${index * 0.05}s`
                            }}
                        >
                            <div className="settings-icon-box" style={{ 
                                background: past ? 'var(--paper)' : 'color-mix(in srgb, var(--brand-ink) 10%, transparent)', 
                                color: past ? 'var(--ink-muted)' : 'var(--brand-ink)',
                                marginRight: isRTL ? '0' : '16px',
                                marginLeft: isRTL ? '16px' : '0'
                            }}>
                                <Info size={18} />
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: '800', 
                                    color: 'var(--ink)',
                                    marginBottom: '4px'
                                }}>
                                    {t(`religiousDayKinds.${day.kind}.name`, day.name)}
                                </div>
                                <div style={{ 
                                    fontSize: '0.8rem', 
                                    color: 'var(--ink-muted)',
                                    fontWeight: '600'
                                }}>
                                    {formatDate(day.date)}
                                </div>
                            </div>

                            {past && (
                                <div style={{ 
                                    fontSize: '0.65rem', 
                                    fontWeight: '950', 
                                    color: 'var(--ink-muted)',
                                    background: 'var(--paper-sunken)',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    textTransform: 'uppercase'
                                }}>
                                    {t('religiousDays.completed', 'GEÇTİ')}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReligiousDays;
