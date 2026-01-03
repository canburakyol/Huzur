import { useState, useEffect } from 'react';
import { X, Check, ChevronRight, Plus, Users, Key, Copy, Share2, Lock, BookOpen } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion, where, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const HatimTracker = () => {
    const { t, i18n } = useTranslation();
    const [hatims, setHatims] = useState([]);
    const [selectedHatim, setSelectedHatim] = useState(null);
    const [view, setView] = useState('list'); // list, detail, create, join, created, joinSpecific
    const [loading, setLoading] = useState(true);
    const [newHatimTitle, setNewHatimTitle] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');
    const [createdCode, setCreatedCode] = useState(null);
    const [pendingHatim, setPendingHatim] = useState(null);

    // User ID
    const [userId] = useState(() => {
        const saved = localStorage.getItem('hatim_user_id');
        if (saved) return saved;
        const newId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('hatim_user_id', newId);
        return newId;
    });

    // Generate Code
    const generateAccessCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    // Listen to Hatims
    useEffect(() => {
        const q = query(collection(db, 'hatims'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            setHatims(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching hatims:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const createHatim = async () => {
        if (!newHatimTitle.trim()) return;
        try {
            const parts = {};
            for (let i = 1; i <= 30; i++) {
                parts[i] = { status: 'free', user: null, completed: false };
            }
            const accessCode = generateAccessCode();
            await addDoc(collection(db, 'hatims'), {
                title: newHatimTitle,
                createdAt: new Date().toISOString(),
                createdBy: userId,
                participants: [userId],
                parts: parts,
                completedParts: 0,
                accessCode: accessCode
            });
            setNewHatimTitle('');
            setCreatedCode(accessCode);
            setView('created');
        } catch (error) {
            console.error("Error creating hatim:", error);
            alert(t('hatim.messages.createError'));
        }
    };

    const joinHatimWithCode = async () => {
        if (!joinCode.trim() || joinCode.length !== 6) {
            setJoinError(t('hatim.messages.enter6Digit'));
            return;
        }
        try {
            const q = query(collection(db, 'hatims'), where('accessCode', '==', joinCode.toUpperCase()));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                setJoinError(t('hatim.messages.notFound'));
                return;
            }
            const hatimDoc = snapshot.docs[0];
            const hatimData = { id: hatimDoc.id, ...hatimDoc.data() };
            if (!hatimData.participants?.includes(userId)) {
                await updateDoc(doc(db, 'hatims', hatimDoc.id), {
                    participants: arrayUnion(userId)
                });
            }
            setSelectedHatim(hatimData);
            setJoinCode('');
            setJoinError('');
            setView('detail');
        } catch (error) {
            console.error("Error joining hatim:", error);
            setJoinError(t('hatim.messages.error'));
        }
    };

    const isParticipant = (hatim) => hatim.participants?.includes(userId);

    const handleHatimClick = (hatim) => {
        if (isParticipant(hatim)) {
            setSelectedHatim(hatim);
            setView('detail');
        } else {
            setPendingHatim(hatim);
            setJoinCode('');
            setJoinError('');
            setView('joinSpecific');
        }
    };

    const joinSpecificHatim = async () => {
        if (!pendingHatim || !joinCode.trim()) {
            setJoinError(t('hatim.messages.enterCode'));
            return;
        }
        if (joinCode.toUpperCase() === pendingHatim.accessCode) {
            try {
                await updateDoc(doc(db, 'hatims', pendingHatim.id), {
                    participants: arrayUnion(userId)
                });
                setSelectedHatim(pendingHatim);
                setPendingHatim(null);
                setJoinCode('');
                setView('detail');
            } catch (error) {
                console.error("Error joining hatim:", error);
                setJoinError(t('hatim.messages.error'));
            }
        } else {
            setJoinError(t('hatim.messages.wrongCode'));
        }
    };

    const takePart = async (hatimId, partNo) => {
        try {
            const hatimRef = doc(db, 'hatims', hatimId);
            await updateDoc(hatimRef, {
                [`parts.${partNo}.status`]: 'taken',
                [`parts.${partNo}.user`]: userId,
                participants: arrayUnion(userId)
            });
        } catch (error) {
            console.error("Error taking part:", error);
        }
    };

    const releasePart = async (hatimId, partNo) => {
        try {
            const hatimRef = doc(db, 'hatims', hatimId);
            await updateDoc(hatimRef, {
                [`parts.${partNo}.status`]: 'free',
                [`parts.${partNo}.user`]: null,
                [`parts.${partNo}.completed`]: false
            });
        } catch (error) {
            console.error("Error releasing part:", error);
        }
    };

    const toggleComplete = async (hatimId, partNo, currentStatus) => {
        try {
            const hatimRef = doc(db, 'hatims', hatimId);
            await updateDoc(hatimRef, {
                [`parts.${partNo}.completed`]: !currentStatus
            });
        } catch (error) {
            console.error("Error toggling complete:", error);
        }
    };

    // --- STYLES ---
    const primaryColor = '#10b981'; // Emerald 500
    const primaryDark = '#047857'; // Emerald 700
    const goldColor = '#d97706'; // Amber 600
    const textDark = '#1f2937'; // Gray 800
    const textLight = '#4b5563'; // Gray 600

    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        marginBottom: '15px'
    };

    const btnStyle = (isPrimary = false) => ({
        flex: 1,
        padding: '12px',
        borderRadius: '12px',
        border: 'none',
        background: isPrimary ? `linear-gradient(135deg, ${primaryColor}, ${primaryDark})` : '#f3f4f6',
        color: isPrimary ? 'white' : textDark,
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: isPrimary ? '0 4px 6px rgba(16, 185, 129, 0.2)' : 'none',
        transition: 'transform 0.1s'
    });

    const inputStyle = {
        width: '100%',
        padding: '16px',
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        marginBottom: '15px',
        fontSize: '16px',
        color: textDark,
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    // --- RENDERERS ---

    const renderList = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setView('create')} style={btnStyle(true)}>
                    <Plus size={20} /> {t('hatim.newHatim')}
                </button>
                <button onClick={() => setView('join')} style={{ ...btnStyle(false), background: '#3b82f6', color: 'white' }}>
                    <Key size={20} /> {t('hatim.enterCode')}
                </button>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '20px', color: textLight }}>{t('hatim.loading')}</div> : hatims.map(hatim => {
                const total = 30;
                const completed = Object.values(hatim.parts).filter(p => p.completed).length;
                const progress = (completed / total) * 100;
                const userIsParticipant = isParticipant(hatim);

                return (
                    <div key={hatim.id} style={{ ...cardStyle, cursor: 'pointer', position: 'relative', borderLeft: `4px solid ${userIsParticipant ? primaryColor : '#9ca3af'}` }} onClick={() => handleHatimClick(hatim)}>
                        {!userIsParticipant && (
                            <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Lock size={12} /> {t('hatim.codeRequired')}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 6px 0', color: textDark, fontSize: '18px', fontWeight: '700' }}>{hatim.title}</h3>
                                <div style={{ fontSize: '13px', color: textLight, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <BookOpen size={14} />
                                    {new Date(hatim.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' })}
                                </div>
                            </div>
                            {userIsParticipant && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: primaryDark, background: '#ecfdf5', padding: '4px 8px', borderRadius: '8px' }}>
                                    <Users size={14} /> {hatim.participants?.length || 0}
                                </div>
                            )}
                        </div>

                        <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${primaryColor}, ${primaryDark})`, transition: 'width 0.5s ease-out' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                            <span style={{ color: textLight }}>{completed} / 30 {t('hatim.part')}</span>
                            <span style={{ color: primaryDark }}>%{Math.round(progress)} {t('hatim.completed')}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderDetail = () => {
        if (!selectedHatim) return null;
        const liveHatim = hatims.find(h => h.id === selectedHatim.id) || selectedHatim;

        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <button onClick={() => setView('list')} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: textDark }}>
                        <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                    <h2 style={{ margin: 0, fontSize: '20px', color: textDark, fontWeight: '700' }}>{liveHatim.title}</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {Object.entries(liveHatim.parts).map(([key, part]) => {
                        const partNo = parseInt(key);
                        const isMine = part.user === userId;
                        const isTaken = part.status === 'taken';
                        const isCompleted = part.completed;

                        let bg = 'white';
                        let border = '1px solid #e5e7eb';
                        let color = textLight;
                        let statusIcon = null;

                        if (isCompleted) {
                            bg = '#ecfdf5'; border = `1px solid ${primaryColor}`; color = primaryDark;
                            statusIcon = <Check size={16} color={primaryColor} />;
                        } else if (isTaken) {
                            if (isMine) {
                                bg = '#fffbeb'; border = `1px solid ${goldColor}`; color = '#92400e';
                            } else {
                                bg = '#f3f4f6'; border = '1px solid #d1d5db'; color = '#9ca3af';
                            }
                        }

                        return (
                            <div key={partNo} style={{ background: bg, border, borderRadius: '12px', padding: '12px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '90px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative' }}>
                                <div style={{ fontWeight: '700', fontSize: '18px', color }}>{partNo}. {t('hatim.part')}</div>
                                {statusIcon && <div style={{ position: 'absolute', top: '6px', right: '6px' }}>{statusIcon}</div>}

                                {!isTaken && isParticipant(liveHatim) && (
                                    <button onClick={() => takePart(liveHatim.id, partNo)} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '20px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                                        {t('hatim.take')}
                                    </button>
                                )}

                                {isTaken && isMine && !isCompleted && (
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => toggleComplete(liveHatim.id, partNo, false)} style={{ padding: '6px', borderRadius: '50%', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer' }}>
                                            <Check size={14} />
                                        </button>
                                        <button onClick={() => releasePart(liveHatim.id, partNo)} style={{ padding: '6px', borderRadius: '50%', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer' }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}

                                {isTaken && !isMine && (
                                    <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>{isCompleted ? t('hatim.read') : t('hatim.reading')}</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {isParticipant(liveHatim) && liveHatim.accessCode && (
                    <div style={{ ...cardStyle, background: '#f0fdf4', borderColor: primaryColor, textAlign: 'center' }}>
                        <div style={{ fontSize: '13px', color: primaryDark, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('hatim.participationCode')}</div>
                        <div style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '6px', color: primaryDark, fontFamily: 'monospace', background: 'white', padding: '10px', borderRadius: '12px', border: `1px dashed ${primaryColor}`, display: 'inline-block', marginBottom: '15px' }}>{liveHatim.accessCode}</div>
                        <div>
                            <button onClick={() => { navigator.clipboard.writeText(liveHatim.accessCode); alert(t('hatim.messages.codeCopied')); }} style={{ ...btnStyle(true), width: 'auto', display: 'inline-flex', padding: '10px 24px' }}>
                                <Copy size={16} /> {t('hatim.copyCode')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderCreate = () => (
        <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: textDark, fontSize: '20px' }}>{t('hatim.startNew')}</h3>
            <p style={{ color: textLight, fontSize: '14px', marginBottom: '20px' }}>{t('hatim.createDesc')}</p>
            <input type="text" value={newHatimTitle} onChange={(e) => setNewHatimTitle(e.target.value)} placeholder={t('hatim.placeholderTitle')} style={inputStyle} />
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setView('list')} style={btnStyle(false)}>{t('hatim.cancel')}</button>
                <button onClick={createHatim} style={btnStyle(true)}>{t('hatim.create')}</button>
            </div>
        </div>
    );

    const renderJoin = () => (
        <div style={cardStyle}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: textDark }}><Key size={24} color={primaryColor} /> {t('hatim.joinTitle')}</h3>
            <p style={{ fontSize: '14px', color: textLight, marginBottom: '20px' }}>{t('hatim.joinDesc')}</p>
            <input type="text" value={joinCode} onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }} placeholder={t('hatim.placeholderCode')} maxLength={6} style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'monospace' }} />
            {joinError && <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '15px', textAlign: 'center', background: '#fee2e2', padding: '10px', borderRadius: '8px' }}>{joinError}</div>}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => { setView('list'); setJoinCode(''); setJoinError(''); }} style={btnStyle(false)}>{t('hatim.cancel')}</button>
                <button onClick={joinHatimWithCode} style={btnStyle(true)}>{t('hatim.join')}</button>
            </div>
        </div>
    );

    const renderJoinSpecific = () => (
        <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                    <Lock size={30} color="#ef4444" />
                </div>
                <h3 style={{ margin: '0 0 10px', color: textDark }}>{t('hatim.lockedTitle')}</h3>
                <p style={{ fontSize: '15px', color: textLight, margin: 0 }}>
                    <strong>{t('hatim.lockedDesc', { title: pendingHatim?.title })}</strong>
                </p>
            </div>
            <input type="text" value={joinCode} onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }} placeholder={t('hatim.placeholderShortCode')} maxLength={6} style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'monospace' }} />
            {joinError && <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '15px', textAlign: 'center', background: '#fee2e2', padding: '10px', borderRadius: '8px' }}>{joinError}</div>}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => { setView('list'); setPendingHatim(null); setJoinCode(''); setJoinError(''); }} style={btnStyle(false)}>{t('hatim.giveUp')}</button>
                <button onClick={joinSpecificHatim} style={btnStyle(true)}>{t('hatim.login')}</button>
            </div>
        </div>
    );

    const renderCreated = () => (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
            <h3 style={{ margin: '0 0 10px', color: textDark, fontSize: '24px' }}>{t('hatim.createdTitle')}</h3>
            <p style={{ fontSize: '15px', color: textLight, marginBottom: '30px' }}>{t('hatim.createdDesc')}</p>
            
            <div style={{ background: '#f0fdf4', padding: '24px', borderRadius: '20px', border: `2px dashed ${primaryColor}`, marginBottom: '30px' }}>
                <div style={{ fontSize: '13px', color: primaryDark, marginBottom: '10px', fontWeight: '700', letterSpacing: '1px' }}>{t('hatim.participationCode')}</div>
                <div style={{ fontSize: '42px', fontWeight: '800', color: textDark, letterSpacing: '8px', fontFamily: 'monospace' }}>{createdCode}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => { navigator.clipboard.writeText(createdCode); alert(t('hatim.messages.codeCopied')); }} style={{ ...btnStyle(true), background: '#10b981' }}>
                    <Copy size={18} /> {t('hatim.copy')}
                </button>
                <button onClick={() => { 
                    const text = t('hatim.shareText', { title: newHatimTitle, code: createdCode });
                    if (navigator.share) { navigator.share({ title: t('hatim.shareTitle'), text }); } 
                    else { navigator.clipboard.writeText(text); alert(t('hatim.messages.inviteCopied')); } 
                }} style={{ ...btnStyle(true), background: '#3b82f6' }}>
                    <Share2 size={18} /> {t('hatim.share')}
                </button>
            </div>
            <button onClick={() => { setView('list'); setCreatedCode(null); }} style={{ ...btnStyle(false), width: '100%', marginTop: '20px', background: 'transparent', border: '1px solid #d1d5db' }}>{t('hatim.ok')}</button>
        </div>
    );

    return (
        <div style={{ paddingBottom: '100px', fontFamily: "'Inter', sans-serif" }}>
            {view === 'list' && renderList()}
            {view === 'detail' && renderDetail()}
            {view === 'create' && renderCreate()}
            {view === 'join' && renderJoin()}
            {view === 'joinSpecific' && renderJoinSpecific()}
            {view === 'created' && renderCreated()}
        </div>
    );
};

export default HatimTracker;
