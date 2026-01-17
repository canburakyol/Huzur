import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, User, X, BookOpen, Users } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, increment } from 'firebase/firestore';
import HatimTracker from './HatimTracker';
import { useTranslation } from 'react-i18next';
import { checkRateLimit } from '../utils/rateLimiter';
import { storageService } from '../services/storageService';

const Community = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('duas'); // 'duas' or 'hatims'
    const [duas, setDuas] = useState([]);
    const [newDua, setNewDua] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [prayedDuas, setPrayedDuas] = useState(() => {
        // Initialize from storage
        const stored = storageService.getItem('prayed_duas') || [];
        return new Set(stored);
    });

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
        
        // Rate limiting: max 5 duas per hour
        if (!checkRateLimit('dua_submit', 5, 3600000)) {
            alert(t('community.messages.rateLimited'));
            return;
        }

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
        // Prevent multiple amins on same dua
        if (prayedDuas.has(id)) {
            return;
        }
        
        // Immediately update UI (optimistic update)
        const newPrayedDuas = new Set(prayedDuas);
        newPrayedDuas.add(id);
        setPrayedDuas(newPrayedDuas);
        
        // Save to persistent storage
        storageService.setItem('prayed_duas', Array.from(newPrayedDuas));
        
        try {
            const duaRef = doc(db, 'duas', id);
            await updateDoc(duaRef, {
                count: increment(1)
            });
        } catch (error) {
            console.error("Error updating count:", error);
            // Rollback on error
            newPrayedDuas.delete(id);
            setPrayedDuas(new Set(newPrayedDuas));
            storageService.setItem('prayed_duas', Array.from(newPrayedDuas));
        }
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', padding: '20px', background: 'var(--bg-color)', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={24} />
                    {t('community.title')}
                </h2>
                <button onClick={onClose} style={{ 
                    background: 'var(--glass-bg)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '50%', 
                    width: '36px', 
                    height: '36px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer', 
                    color: 'var(--text-color)' 
                }}>
                    <X size={20} />
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('duas')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: activeTab === 'duas' ? 'var(--primary-color)' : 'var(--glass-bg)',
                        border: activeTab === 'duas' ? 'none' : '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        color: activeTab === 'duas' ? 'white' : 'var(--text-color)',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                    }}
                >
                    <MessageCircle size={18} /> {t('community.tabs.duas')}
                </button>
                <button
                    onClick={() => setActiveTab('hatims')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: activeTab === 'hatims' ? 'var(--primary-color)' : 'var(--glass-bg)',
                        border: activeTab === 'hatims' ? 'none' : '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        color: activeTab === 'hatims' ? 'white' : 'var(--text-color)',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                    }}
                >
                    <BookOpen size={18} /> {t('community.tabs.hatims')}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'hatims' ? (
                <HatimTracker />
            ) : (
                <div className="animate-fadeIn">
                    {/* Intro Card */}
                    <div className="glass-card" style={{ padding: '15px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Heart size={24} color="var(--primary-color)" />
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-color)' }}>
                            {t('prayerCircle.intro')}
                        </p>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            background: 'var(--primary-color)', 
                            color: 'white',
                            border: 'none', 
                            borderRadius: '12px', 
                            padding: '14px',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer', 
                            boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)',
                            width: '100%',
                            marginBottom: '20px',
                            fontSize: '15px',
                            fontWeight: '600'
                        }}
                    >
                        {showForm ? <X size={20} /> : <MessageCircle size={20} />}
                        {showForm ? t('community.buttons.cancel') : t('community.buttons.requestDua')}
                    </button>

                    {/* Form */}
                    {showForm && (
                        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', animation: 'fadeIn 0.3s ease' }}>
                            <textarea
                                value={newDua}
                                onChange={(e) => setNewDua(e.target.value)}
                                placeholder={t('community.placeholders.writeDua')}
                                style={{
                                    width: '100%', 
                                    padding: '15px', 
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)', 
                                    background: 'var(--glass-bg)',
                                    minHeight: '100px', 
                                    marginBottom: '10px', 
                                    resize: 'vertical',
                                    color: 'var(--text-color)',
                                    fontSize: '14px'
                                }}
                            />
                            <button 
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                <Send size={18} />
                                {t('community.buttons.share')}
                            </button>
                        </form>
                    )}

                    {/* List */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-color-muted)' }}>
                            {t('community.messages.loading')}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {duas.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-color-muted)' }}>
                                    {t('community.messages.noDuas')}
                                </div>
                            )}
                            {duas.map(dua => (
                                <div key={dua.id} className="glass-card" style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px' 
                                        }}>
                                            <div style={{
                                                background: 'var(--glass-bg)',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid var(--glass-border)'
                                            }}>
                                                <User size={16} color="var(--primary-color)" />
                                            </div>
                                            <span style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                                {new Date(dua.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' })}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                            {dua.count} {t('prayerCircle.prayers')}
                                        </span>
                                    </div>
                                    
                                    <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--text-color)', lineHeight: '1.5' }}>
                                        {dua.text}
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => handlePray(dua.id)}
                                            disabled={prayedDuas.has(dua.id)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                background: prayedDuas.has(dua.id) ? '#2ecc71' : 'var(--glass-bg)',
                                                color: prayedDuas.has(dua.id) ? 'white' : 'var(--primary-color)',
                                                border: prayedDuas.has(dua.id) ? 'none' : '1px solid var(--primary-color)',
                                                cursor: prayedDuas.has(dua.id) ? 'default' : 'pointer',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px',
                                                fontSize: '13px', 
                                                fontWeight: '600',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Heart size={16} fill={prayedDuas.has(dua.id) ? "white" : "none"} />
                                            {prayedDuas.has(dua.id) ? t('prayerCircle.prayed') : t('prayerCircle.pray')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Community;
