import { useState } from 'react';
import { RotateCcw, Vibrate, VibrateOff, BarChart3, Maximize, Minimize, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/shared/PageHeader';
import { useFocus } from '../../../context/FocusContext';
import { useGamification } from '../../../hooks/useGamification';
import { markFirstIbadahActionCompleted } from '../../../services/activationService';
import { storageService } from '../../../services/storageService';
import './Zikirmatik.css';
import '../../../components/app-shell/Navigation.css';

const ZIKIRMATIK_KEYS = {
    FREE_NAME: 'freeDhikrName',
    COUNTS: 'zikirCounts',
    TARGETS: 'zikirTargets',
    STATS: 'zikirStats'
};

const DHIKR_LIST = [
    { id: 'free', name: 'Serbest Zikir', arabic: '∞', meaning: 'İstediğiniz zikri çekin.', defaultTarget: 9999 },
    { id: 'subhanallah', name: 'Sübhanallah', arabic: 'سُبْحَانَ اللهِ', meaning: "Allah'ı tüm eksikliklerden tenzih ederim.", defaultTarget: 33 },
    { id: 'elhamdulillah', name: 'Elhamdülillah', arabic: 'الحَمْدُ لِلَّهِ', meaning: "Hamd Allah'a mahsustur.", defaultTarget: 33 },
    { id: 'allahuekber', name: 'Allahu ekber', arabic: 'اللهُ أَكْبَرُ', meaning: 'Allah en büyüktür.', defaultTarget: 33 },
    { id: 'lailaheillallah', name: 'Lâ ilâhe illallah', arabic: 'لَا إِلَٰهَ إِلَّا اللهُ', meaning: "Allah'tan başka ilah yoktur.", defaultTarget: 100 },
    { id: 'estagfirullah', name: 'Estağfirullah', arabic: 'أَسْتَغْفِرُ اللهَ', meaning: "Allah'tan bağışlanma dilerim.", defaultTarget: 100 },
    { id: 'lahavle', name: 'Lâ havle ve lâ kuvvete illâ billâh', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', meaning: "Güç ve kuvvet ancak Allah'tandır.", defaultTarget: 33 },
    { id: 'salavat', name: 'Salavat', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', meaning: "Allah'ım, Muhammed'e salât eyle.", defaultTarget: 100 },
    { id: 'hasbunallah', name: 'Hasbünallâh', arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', meaning: 'Allah bize yeter; O ne güzel vekildir.', defaultTarget: 33 },
];

const DHIKR_TRANSLATIONS = {
    free: {
        nameKey: 'zikirmatikDhikrs.free.name',
        fallbackName: 'Serbest Zikir',
        meaningKey: 'zikirmatikDhikrs.free.meaning',
        fallbackMeaning: 'İstediğiniz zikri çekin.'
    },
    subhanallah: {
        nameKey: 'zikirmatikDhikrs.subhanallah.name',
        fallbackName: 'Sübhanallah',
        meaningKey: 'zikirmatikDhikrs.subhanallah.meaning',
        fallbackMeaning: "Allah'ı tüm eksikliklerden tenzih ederim."
    },
    elhamdulillah: {
        nameKey: 'zikirmatikDhikrs.elhamdulillah.name',
        fallbackName: 'Elhamdülillah',
        meaningKey: 'zikirmatikDhikrs.elhamdulillah.meaning',
        fallbackMeaning: "Hamd Allah'a mahsustur."
    },
    allahuekber: {
        nameKey: 'zikirmatikDhikrs.allahuekber.name',
        fallbackName: 'Allahu ekber',
        meaningKey: 'zikirmatikDhikrs.allahuekber.meaning',
        fallbackMeaning: 'Allah en büyüktür.'
    },
    lailaheillallah: {
        nameKey: 'zikirmatikDhikrs.lailaheillallah.name',
        fallbackName: 'Lâ ilâhe illallah',
        meaningKey: 'zikirmatikDhikrs.lailaheillallah.meaning',
        fallbackMeaning: "Allah'tan başka ilah yoktur."
    },
    estagfirullah: {
        nameKey: 'zikirmatikDhikrs.estagfirullah.name',
        fallbackName: 'Estağfirullah',
        meaningKey: 'zikirmatikDhikrs.estagfirullah.meaning',
        fallbackMeaning: "Allah'tan bağışlanma dilerim."
    },
    lahavle: {
        nameKey: 'zikirmatikDhikrs.lahavle.name',
        fallbackName: 'Lâ havle ve lâ kuvvete illâ billâh',
        meaningKey: 'zikirmatikDhikrs.lahavle.meaning',
        fallbackMeaning: "Güç ve kuvvet ancak Allah'tandır."
    },
    salavat: {
        nameKey: 'zikirmatikDhikrs.salavat.name',
        fallbackName: 'Salavat',
        meaningKey: 'zikirmatikDhikrs.salavat.meaning',
        fallbackMeaning: "Allah'ım, Muhammed'e salât eyle."
    },
    hasbunallah: {
        nameKey: 'zikirmatikDhikrs.hasbunallah.name',
        fallbackName: 'Hasbünallâh',
        meaningKey: 'zikirmatikDhikrs.hasbunallah.meaning',
        fallbackMeaning: 'Allah bize yeter; O ne güzel vekildir.',
        readingKey: 'zikirmatikDhikrs.hasbunallah.reading',
        fallbackReading: "Hasbünallâhü ve ni'mel vekîl.",
        sourceKey: 'zikirmatikDhikrs.hasbunallah.source',
        fallbackSource: 'Kur’an-ı Kerim, Âl-i İmrân 3:173'
    }
};

const Zikirmatik = ({ onClose }) => {
    const { t } = useTranslation();
    const { isFocusMode, toggleFocusMode } = useFocus();
    const { checkQuestProgress } = useGamification();
    const defaultFreeDhikrName = t('zikirmatikDhikrs.free.name', 'Serbest Zikir');
    
    const [view, setView] = useState('list');
    const [selectedDhikr, setSelectedDhikr] = useState(null);
    const [freeDhikrName, setFreeDhikrName] = useState(() => {
        return storageService.getString(ZIKIRMATIK_KEYS.FREE_NAME, defaultFreeDhikrName);
    });

    const [counts, setCounts] = useState(() => {
        return storageService.getItem(ZIKIRMATIK_KEYS.COUNTS, {});
    });
    const [targets, setTargets] = useState(() => {
        const savedTargets = storageService.getItem(ZIKIRMATIK_KEYS.TARGETS, {});
        const defaultTargets = {};
        DHIKR_LIST.forEach(d => {
            defaultTargets[d.id] = savedTargets[d.id] || d.defaultTarget;
        });
        return defaultTargets;
    });
    const [vibrateEnabled, setVibrateEnabled] = useState(true);
    const [isPressed, setIsPressed] = useState(false);

    const [stats, setStats] = useState(() => {
        const savedStats = storageService.getItem(ZIKIRMATIK_KEYS.STATS, { today: 0, total: 0, history: [] });
        const today = new Date().toDateString();
        if (savedStats.lastDate !== today) {
            savedStats.today = 0;
            savedStats.lastDate = today;
        }
        return savedStats;
    });
    const [showStats, setShowStats] = useState(false);
    const [showSuccessAnim, setShowSuccessAnim] = useState(false);

    const getDhikrName = (dhikr) => {
        if (!dhikr) return '';
        if (dhikr.id === 'free') return freeDhikrName;

        const translation = DHIKR_TRANSLATIONS[dhikr.id];
        return translation ? t(translation.nameKey, translation.fallbackName) : dhikr.name;
    };

    const getDhikrMeaning = (dhikr) => {
        if (!dhikr) return '';

        const translation = DHIKR_TRANSLATIONS[dhikr.id];
        return translation ? t(translation.meaningKey, translation.fallbackMeaning) : dhikr.meaning;
    };

    const getDhikrReading = (dhikr) => {
        const translation = DHIKR_TRANSLATIONS[dhikr?.id];
        return translation?.readingKey ? t(translation.readingKey, translation.fallbackReading) : '';
    };

    const getDhikrSource = (dhikr) => {
        const translation = DHIKR_TRANSLATIONS[dhikr?.id];
        // Only show a citation that has actually been written into the locale files; never a placeholder.
        return translation?.sourceKey ? t(translation.sourceKey, translation.fallbackSource) : null;
    };

    const handleFreeNameChange = (e) => {
        const name = e.target.value;
        setFreeDhikrName(name);
        storageService.setString(ZIKIRMATIK_KEYS.FREE_NAME, name);
    };

    const saveCount = (dhikrId, newCount) => {
        setCounts((previousCounts) => {
            const safeCounts = previousCounts && typeof previousCounts === 'object' ? previousCounts : {};
            const nextCounts = { ...safeCounts, [dhikrId]: newCount };
            storageService.setItem(ZIKIRMATIK_KEYS.COUNTS, nextCounts);
            return nextCounts;
        });
    };

    const updateStats = (increment = 1) => {
        const today = new Date().toDateString();
        const newStats = {
            ...stats,
            today: (stats.lastDate === today ? stats.today : 0) + increment,
            total: stats.total + increment,
            lastDate: today
        };
        setStats(newStats);
        storageService.setItem(ZIKIRMATIK_KEYS.STATS, newStats);
    };

    const handleIncrement = () => {
        if (!selectedDhikr) return;

        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 100);

        const dhikrId = selectedDhikr.id;
        const safeCounts = counts && typeof counts === 'object' ? counts : {};
        const currentCount = Number(safeCounts[dhikrId]) || 0;
        const newCount = currentCount + 1;
        const nextCounts = { ...safeCounts, [dhikrId]: newCount };

        // Persist before quest/activation side effects. Those updates may remount
        // this screen, which must then hydrate the incremented value, not zero.
        storageService.setItem(ZIKIRMATIK_KEYS.COUNTS, nextCounts);
        setCounts(nextCounts);
        updateStats(1);
        
        try {
            checkQuestProgress('zikir', dhikrId, 1);
        } catch (err) {
            console.warn('[Zikirmatik] checkQuestProgress error:', err);
        }

        try {
            markFirstIbadahActionCompleted({
                feature: 'zikirmatik',
                source: 'zikir_increment',
            });
        } catch (err) {
            console.warn('[Zikirmatik] markFirstIbadahActionCompleted error:', err);
        }

        if (vibrateEnabled && navigator.vibrate) {
            navigator.vibrate(30);
        }

        const target = targets[dhikrId];
        if (target && newCount === target) {
            setShowSuccessAnim(true);
            setTimeout(() => setShowSuccessAnim(false), 3500);
            if (vibrateEnabled && navigator.vibrate) {
                navigator.vibrate([100, 50, 100, 50, 100]);
            }
        }
    };

    const handleReset = () => {
        if (!selectedDhikr) return;
        saveCount(selectedDhikr.id, 0);
        if (vibrateEnabled && navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    };

    const selectDhikr = (dhikr) => {
        setSelectedDhikr(dhikr);
        setView('counter');
    };

    const getProgress = (dhikrId) => {
        const count = counts[dhikrId] || 0;
        const target = targets[dhikrId] || 33;
        return Math.min((count / target) * 100, 100);
    };

    if (view === 'list') {
        return (
            <div className="hz-root zikirmatik-list">
                <PageHeader
                    title={t('menu.zikirmatik', 'Zikirmatik')}
                    onBack={onClose}
                    action={(
                        <button
                            type="button"
                            className={`hz-iconbtn${showStats ? ' is-on' : ''}`}
                            onClick={() => setShowStats(!showStats)}
                            aria-pressed={showStats}
                            aria-label={t('zikirmatik.stats', 'İstatistikler')}
                        >
                            <BarChart3 size={20} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                    )}
                />

                <div className="zk-body">
                    {showStats && (
                        <div className="hz-card hz-card--brand zk-stats">
                            <div>
                                <div className="zk-stats__value">{stats.today}</div>
                                <div className="hz-overline">{t('zikirmatik.today', 'Bugün')}</div>
                            </div>
                            <div className="zk-stats__divider" aria-hidden="true" />
                            <div>
                                <div className="zk-stats__value">{stats.total}</div>
                                <div className="hz-overline">{t('zikirmatik.total', 'Toplam')}</div>
                            </div>
                        </div>
                    )}

                    <div className="hz-overline">{t('zikirmatik.popularChoices', 'Zikirler')}</div>
                    <div className="hz-card zk-list">
                        {DHIKR_LIST.map((dhikr) => {
                            const count = counts[dhikr.id] || 0;
                            const target = targets[dhikr.id] || dhikr.defaultTarget;
                            const isComplete = count >= target;

                            return (
                                <button key={dhikr.id} type="button" className="zk-item" onClick={() => selectDhikr(dhikr)}>
                                    <span className="zk-item__head">
                                        <span className="zk-item__text">
                                            <span className="zk-item__name">{getDhikrName(dhikr)}</span>
                                            {dhikr.id !== 'free' && <span className="zk-item__arabic" lang="ar">{dhikr.arabic}</span>}
                                        </span>
                                        <span className="zk-item__count">
                                            {isComplete && <CheckCircle2 size={16} strokeWidth={2} aria-label={t('common.completed', 'Tamamlandı')} />}
                                            {count}<span className="zk-item__target">/{target}</span>
                                        </span>
                                    </span>
                                    <span className="zk-progress" aria-hidden="true">
                                        <span className={`zk-progress__fill${isComplete ? ' is-done' : ''}`} style={{ width: `${getProgress(dhikr.id)}%` }} />
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    const currentDhikrCount = counts[selectedDhikr?.id] || 0;
    const currentDhikrTarget = targets[selectedDhikr?.id] || 33;
    const scrollProgress = getProgress(selectedDhikr?.id);
    const dashCircum = 829.38;
    const dashOffset = dashCircum - (scrollProgress * dashCircum / 100);
    const dhikrName = getDhikrName(selectedDhikr);
    const dhikrReading = getDhikrReading(selectedDhikr);
    const dhikrSource = getDhikrSource(selectedDhikr);

    return (
        <div className={`hz-root ad-safe-screen zikirmatik-screen${isFocusMode ? ' is-focus' : ''}`}>
            <PageHeader
                title={t('menu.zikirmatik', 'Zikirmatik')}
                onBack={() => setView('list')}
                action={(
                    <div className="zk-actions">
                        <button
                            type="button"
                            className={`hz-iconbtn${vibrateEnabled ? ' is-on' : ''}`}
                            onClick={() => setVibrateEnabled(!vibrateEnabled)}
                            aria-pressed={vibrateEnabled}
                            aria-label={t('zikirmatik.vibration', 'Titreşim')}
                        >
                            {vibrateEnabled ? <Vibrate size={20} strokeWidth={1.75} aria-hidden="true" /> : <VibrateOff size={20} strokeWidth={1.75} aria-hidden="true" />}
                        </button>
                        <button
                            type="button"
                            className={`hz-iconbtn${isFocusMode ? ' is-on' : ''}`}
                            onClick={toggleFocusMode}
                            aria-pressed={isFocusMode}
                            aria-label={t('zikirmatik.focus', 'Odak modu')}
                        >
                            {isFocusMode ? <Minimize size={20} strokeWidth={1.75} aria-hidden="true" /> : <Maximize size={20} strokeWidth={1.75} aria-hidden="true" />}
                        </button>
                    </div>
                )}
            />

            <div className="zk-body">
                <div className="hz-card zk-dhikr">
                    {selectedDhikr?.id === 'free' ? (
                        <input
                            type="text"
                            className="zk-dhikr__input"
                            value={freeDhikrName}
                            onChange={handleFreeNameChange}
                            placeholder={t('zikirmatik.freeNamePlaceholder', 'Zikir adı')}
                            aria-label={t('zikirmatik.freeNamePlaceholder', 'Zikir adı')}
                        />
                    ) : (
                        <>
                            <h2 className="zk-dhikr__name">{dhikrName}</h2>
                            <p className="zk-dhikr__arabic" lang="ar">{selectedDhikr?.arabic}</p>
                        </>
                    )}
                    {dhikrReading && <p className="hz-body">{dhikrReading}</p>}
                    <p className="hz-label zk-dhikr__meaning">{getDhikrMeaning(selectedDhikr)}</p>
                    {dhikrSource && <p className="hz-ref">{t('zikirmatik.sourceLabel', 'Kaynak')}: <span>{dhikrSource}</span></p>}
                </div>

                <button
                    type="button"
                    className="velocity-dial-wrapper"
                    onClick={handleIncrement}
                    aria-label={`${dhikrName}: ${currentDhikrCount} / ${currentDhikrTarget}`}
                >
                    <svg className="velocity-dial-svg" viewBox="0 0 280 280" aria-hidden="true">
                        <circle className="velocity-dial-bg" cx="140" cy="140" r="132" />
                        <circle
                            className={`velocity-dial-progress${currentDhikrCount >= currentDhikrTarget ? ' is-done' : ''}`}
                            cx="140"
                            cy="140"
                            r="132"
                            style={{ strokeDasharray: dashCircum, strokeDashoffset: dashOffset }}
                        />
                    </svg>
                    <span className="velocity-dial-button" style={{ transform: isPressed ? 'scale(0.94)' : 'scale(1)' }}>
                        <span className="hz-overline">{t('zikirmatik.read', 'Okunan')}</span>
                        <span key={`${selectedDhikr?.id}-${currentDhikrCount}`} data-testid="zikirmatik-current-count" className="zk-dial__count">
                            {currentDhikrCount}
                        </span>
                        <span className="hz-label">{t('zikirmatik.targetLabel', 'Hedef')}: {currentDhikrTarget}</span>
                    </span>
                </button>

                <div className="zk-targets" role="group" aria-label={t('zikirmatik.targetLabel', 'Hedef')}>
                    {[33, 99, 100, 500].map(val => (
                        <button
                            key={val}
                            type="button"
                            className={`velocity-target-btn${currentDhikrTarget === val ? ' active' : ''}`}
                            aria-pressed={currentDhikrTarget === val}
                            onClick={() => {
                                const newTargets = { ...targets, [selectedDhikr.id]: val };
                                setTargets(newTargets);
                                storageService.setItem(ZIKIRMATIK_KEYS.TARGETS, newTargets);
                            }}
                        >
                            {val}
                        </button>
                    ))}
                    <button type="button" className="hz-iconbtn zk-reset" onClick={handleReset} aria-label={t('zikirmatik.reset', 'Sayacı sıfırla')}>
                        <RotateCcw size={20} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                </div>
            </div>

            {showSuccessAnim && (
                <div className="zk-success" role="status">
                    <div className="zk-success__card">
                        <Sparkles size={56} strokeWidth={1.5} aria-hidden="true" />
                        <p className="zk-success__text">{t('zikirmatik.congrats', 'Hedef tamamlandı')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Zikirmatik;
