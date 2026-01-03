import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, User, X, BookOpen, Users } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, increment } from 'firebase/firestore';
import HatimTracker from './HatimTracker';
import { useTranslation } from 'react-i18next';

const Community = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('duas'); // 'duas' or 'hatims'
    const [duas, setDuas] = useState([]);
    const [newDua, setNewDua] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Real-time subscription to Firestore
    useEffect(() => {
        const q = query(collection(db, 'duas'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const duaList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDuas(duaList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching duas:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newDua.trim()) return;

        try {
            await addDoc(collection(db, 'duas'), {
                text: newDua,
                count: 0,
                date: new Date().toISOString()
            });
            setNewDua('');
            setShowForm(false);
        } catch (error) {
            console.error("Error adding dua:", error);
            alert(t('community.messages.errorSending'));
        }
    };

    const handlePray = async (id) => {
        try {
            const duaRef = doc(db, 'duas', id);
            await updateDoc(duaRef, {
                count: increment(1)
            });
        } catch (error) {
            console.error("Error updating count:", error);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, paddingBottom: '80px', minHeight: '100vh', background: '#f9fafb', zIndex: 100, overflowY: 'auto' }}>
            {/* Header with Tabs */}
            <div style={{
                background: 'linear-gradient(135deg, #10b981, #047857)',
                padding: '20px 20px 0 20px',
                color: 'white',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px',
                marginBottom: '20px',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>{t('community.title')}</h2>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <button
                        onClick={() => setActiveTab('duas')}
                        style={{
                            padding: '12px 4px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'duas' ? '3px solid white' : '3px solid transparent',
                            color: activeTab === 'duas' ? 'white' : 'rgba(255,255,255,0.6)',
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s'
                        }}
                    >
                        <MessageCircle size={18} /> {t('community.tabs.duas')}
                    </button>
                    <button
                        onClick={() => setActiveTab('hatims')}
                        style={{
                            padding: '12px 4px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'hatims' ? '3px solid white' : '3px solid transparent',
                            color: activeTab === 'hatims' ? 'white' : 'rgba(255,255,255,0.6)',
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s'
                        }}
                    >
                        <BookOpen size={18} /> {t('community.tabs.hatims')}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '0 20px' }}>
                {activeTab === 'hatims' ? (
                    <HatimTracker />
                ) : (
                    <div className="animate-fadeIn">
                        {/* Dua İste Button */}
                        <button
                            onClick={() => setShowForm(!showForm)}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                border: 'none',
                                background: 'white',
                                color: '#10b981',
                                fontWeight: '700',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                marginBottom: '20px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                cursor: 'pointer'
                            }}
                        >
                            {showForm ? <X size={20} /> : <MessageCircle size={20} />}
                            {showForm ? t('community.buttons.cancel') : t('community.buttons.requestDua')}
                        </button>

                        {/* Form */}
                        {showForm && (
                            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <form onSubmit={handleSubmit}>
                                    <textarea
                                        value={newDua}
                                        onChange={(e) => setNewDua(e.target.value)}
                                        placeholder={t('community.placeholders.writeDua')}
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: '2px solid #f3f4f6',
                                            marginBottom: '16px',
                                            fontSize: '16px',
                                            resize: 'none',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: '#10b981',
                                            color: 'white',
                                            fontWeight: '700',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Send size={18} />
                                        {t('community.buttons.share')}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* List */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>{t('community.messages.loading')}</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {duas.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>{t('community.messages.noDuas')}</div>
                                )}
                                {duas.map(dua => (
                                    <div key={dua.id} style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f3f4f6' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                            <div style={{
                                                background: '#ecfdf5',
                                                borderRadius: '50%',
                                                width: '44px',
                                                height: '44px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <User size={22} color="#10b981" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: '0 0 12px 0', fontSize: '16px', lineHeight: '1.6', color: '#1f2937' }}>
                                                    {dua.text}
                                                </p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                                                        {new Date(dua.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' })}
                                                    </span>
                                                    <button
                                                        onClick={() => handlePray(dua.id)}
                                                        style={{
                                                            background: dua.count > 0 ? '#fee2e2' : '#f3f4f6',
                                                            border: 'none',
                                                            borderRadius: '20px',
                                                            padding: '6px 14px',
                                                            color: dua.count > 0 ? '#ef4444' : '#6b7280',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontWeight: '600',
                                                            fontSize: '13px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <Heart size={14} fill={dua.count > 0 ? "#ef4444" : "none"} />
                                                        <span>{dua.count} {t('community.buttons.amin')}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
