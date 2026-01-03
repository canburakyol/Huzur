import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, User, ChevronLeft, Sparkles, Lock, Crown } from 'lucide-react';
import { processQuery } from '../services/chatService';

const Assistant = ({ onClose }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [usageCount, setUsageCount] = useState(0);
    const [showProModal, setShowProModal] = useState(false);

    const messagesEndRef = useRef(null);
    const DAILY_LIMIT = 3;

    const SUGGESTED_QUESTIONS = [
        "assistant.questions.q1",
        "assistant.questions.q2",
        "assistant.questions.q3",
        "assistant.questions.q4",
        "assistant.questions.q5",
        "assistant.questions.q6"
    ];

    useEffect(() => {
        // Set initial welcome message
        setMessages([
            {
                id: 1,
                type: 'bot',
                text: t('assistant.welcomeMessage')
            }
        ]);

        // Check daily usage
        const today = new Date().toISOString().split('T')[0];
        const usage = JSON.parse(localStorage.getItem('assistant_usage') || '{}');

        if (usage.date === today) {
            setUsageCount(usage.count || 0);
        } else {
            // Reset for new day
            localStorage.setItem('assistant_usage', JSON.stringify({ date: today, count: 0 }));
            setUsageCount(0);
        }
    }, [t]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text) => {
        const query = text || inputValue;
        if (!query.trim()) return;

        // Check Limit
        if (usageCount >= DAILY_LIMIT) {
            setShowProModal(true);
            return;
        }

        // Add User Message
        const userMsg = { id: Date.now(), type: 'user', text: query };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Increment Usage
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('assistant_usage', JSON.stringify({ date: today, count: newCount }));

        // Process Query
        try {
            const response = await processQuery(query);

            let botMsg = { id: Date.now() + 1, type: 'bot', text: response.content };

            if (response.type === 'topic_result') {
                botMsg.topicData = response.topic;
            } else if (response.type === 'surah_info') {
                botMsg.surahData = response.surah;
            }

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: t('assistant.errorMessage') }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="assistant-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'var(--bg-gradient-start)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div className="glass-card" style={{
                padding: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '0 0 20px 20px',
                marginBottom: '0',
                zIndex: 10
            }}>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ChevronLeft size={24} color="var(--text-color)" />
                </button>
                <div style={{ width: '40px', height: '40px', background: '#e74c3c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{t('assistant.title')}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '8px', height: '8px', background: '#27ae60', borderRadius: '50%' }}></span>
                            {t('assistant.online')}
                        </span>
                        <span style={{ fontSize: '11px', color: '#7f8c8d', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '10px' }}>
                            {t('assistant.remaining')}: {Math.max(0, DAILY_LIMIT - usageCount)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px'
                    }}>
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: msg.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                            background: msg.type === 'user' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.9)',
                            color: msg.type === 'user' ? 'white' : '#333',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            fontSize: '15px',
                            lineHeight: '1.5'
                        }}>
                            {msg.text}
                        </div>

                        {/* Special Content Rendering */}
                        {msg.topicData && (
                            <div style={{ background: 'white', padding: '10px', borderRadius: '10px', marginTop: '5px', border: '1px solid #eee' }}>
                                <div style={{ fontWeight: 'bold', color: '#e74c3c', marginBottom: '5px' }}>{msg.topicData.title}</div>
                                <div style={{ fontSize: '13px', color: '#666' }}>{msg.topicData.ayahs.length} {t('quran.ayah')} {t('assistant.found')}</div>
                            </div>
                        )}
                    </div>
                ))}

                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', background: 'white', padding: '10px 15px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions (if empty or start) */}
            {messages.length === 1 && (
                <div style={{ padding: '0 20px 10px 20px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px' }}>
                    {SUGGESTED_QUESTIONS.map((qKey, idx) => (
                        <button key={idx} onClick={() => handleSend(t(qKey))} style={{
                            padding: '8px 15px',
                            background: 'white',
                            border: '1px solid #eee',
                            borderRadius: '20px',
                            fontSize: '13px',
                            color: '#555',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            <Sparkles size={14} color="#f39c12" />
                            {t(qKey)}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('assistant.placeholder')}
                    disabled={usageCount >= DAILY_LIMIT}
                    style={{
                        flex: 1,
                        padding: '12px 20px',
                        borderRadius: '25px',
                        border: '1px solid #ddd',
                        fontSize: '15px',
                        outline: 'none',
                        background: usageCount >= DAILY_LIMIT ? '#eee' : '#f8f9fa',
                        color: usageCount >= DAILY_LIMIT ? '#999' : '#333'
                    }}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() && usageCount < DAILY_LIMIT}
                    style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: usageCount >= DAILY_LIMIT ? '#95a5a6' : (inputValue.trim() ? '#2c3e50' : '#ccc'),
                        border: 'none',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (inputValue.trim() && usageCount < DAILY_LIMIT) ? 'pointer' : 'default',
                        transition: 'background 0.3s'
                    }}
                >
                    {usageCount >= DAILY_LIMIT ? <Lock size={20} /> : <Send size={20} />}
                </button>
            </div>

            {/* Pro Modal */}
            {showProModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        maxWidth: '350px',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowProModal(false)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
                        >
                            ×
                        </button>

                        <div style={{
                            width: '70px',
                            height: '70px',
                            background: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto',
                            boxShadow: '0 5px 15px rgba(243, 156, 18, 0.4)'
                        }}>
                            <Crown size={36} color="white" />
                        </div>

                        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>{t('pro.title')}</h3>
                        <p style={{ color: '#7f8c8d', marginBottom: '25px', lineHeight: '1.5' }}>
                            {t('assistant.limitReached')}
                        </p>

                        <button style={{
                            background: '#2c3e50',
                            color: 'white',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: '25px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            width: '100%',
                            boxShadow: '0 5px 15px rgba(44, 62, 80, 0.3)'
                        }} onClick={() => alert(t('assistant.proSoon'))}>
                            {t('assistant.upgradePro')}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .typing-indicator {
                    display: flex;
                    gap: 5px;
                }
                .typing-indicator span {
                    width: 6px;
                    height: 6px;
                    background: #ccc;
                    borderRadius: 50%;
                    animation: typing 1.4s infinite ease-in-out both;
                }
                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes typing {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default Assistant;
