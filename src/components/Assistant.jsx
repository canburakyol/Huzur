import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, ChevronLeft, Sparkles, Lightbulb } from 'lucide-react';
import { getPersonalizedSuggestions } from '../services/recommendationEngine';

const Assistant = ({ onClose }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    // Senkron hesaplama — useEffect'e gerek yok
    const [recommendations] = useState(() => getPersonalizedSuggestions());

    const messagesEndRef = useRef(null);
    const nextMessageIdRef = useRef(1);

    const getNextMessageId = () => {
        const id = nextMessageIdRef.current;
        nextMessageIdRef.current += 1;
        return id;
    };

    const FAQ_ITEMS = [
        { key: 'assistant.questions.q1', answerKey: 'assistant.answers.q1' },
        { key: 'assistant.questions.q2', answerKey: 'assistant.answers.q2' },
        { key: 'assistant.questions.q3', answerKey: 'assistant.answers.q3' },
        { key: 'assistant.questions.q4', answerKey: 'assistant.answers.q4' },
        { key: 'assistant.questions.q5', answerKey: 'assistant.answers.q5' },
        { key: 'assistant.questions.q6', answerKey: 'assistant.answers.q6' },
    ];

    useEffect(() => {
        setMessages([
            {
                id: getNextMessageId(),
                type: 'bot',
                text: `${t('assistant.welcomeMessage')}\n\n${t('assistant.betaWelcomeHint', 'Beta modu: Önerilen bir soruya dokunun veya mesaj yazın.')}`,
            },
        ]);
    }, [t]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getFaqAnswer = (query) => {
        const normalized = query.toLowerCase().trim();
        const directMatch = FAQ_ITEMS.find((item) => t(item.key).toLowerCase() === normalized);
        if (directMatch) return t(directMatch.answerKey);
        const fuzzyMatch = FAQ_ITEMS.find((item) => {
            const q = t(item.key).toLowerCase();
            return q.includes(normalized) || normalized.includes(q.split(' ').slice(0, 3).join(' '));
        });
        if (fuzzyMatch) return t(fuzzyMatch.answerKey);
        return t('assistant.betaUnknownQuestion', 'Beta aşamasında henüz bu cevaba sahip değilim. Lütfen aşağıdaki önerilen sorulardan birini seçin.');
    };

    const handleSend = async (text) => {
        const query = (text || inputValue || '').trim();
        if (!query) return;

        const userMsg = { id: getNextMessageId(), type: 'user', text: query };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const botMsg = {
                id: getNextMessageId(),
                type: 'bot',
                text: getFaqAnswer(query),
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 600);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="assistant-container reveal-stagger" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'var(--nav-bg)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <div className="settings-card" style={{
                padding: '24px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '0 0 32px 32px',
                background: 'linear-gradient(135deg, var(--nav-bg), var(--nav-hover))',
                zIndex: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                border: 'none',
                borderBottom: '1px solid var(--nav-border)',
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'var(--nav-hover)',
                        border: '1px solid var(--nav-border)',
                        borderRadius: '12px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--nav-text)',
                    }}
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="settings-icon-box" style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--nav-accent)',
                    color: 'white',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Bot size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: 'var(--nav-text)', fontSize: '1.25rem', fontWeight: '950' }}>
                        {t('assistant.title', 'Huzur AI')}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold-light, #f59e0b)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
                        <span className="pulse" style={{ width: '8px', height: '8px', background: 'var(--accent-gold-light, #f59e0b)', borderRadius: '50%' }}></span>
                        ONLINE • {t('assistant.betaLabel', 'Beta')}
                    </div>
                </div>
            </div>

            {/* Kişisel Öneri Kartları */}
            {recommendations.suggestions.length > 0 && (
                <div style={{
                    padding: '16px 20px 0',
                    background: 'var(--nav-bg)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '10px',
                    }}>
                        <Lightbulb size={14} color="var(--nav-accent)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {recommendations.context}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
                        {recommendations.suggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                style={{
                                    flexShrink: 0,
                                    background: 'var(--nav-hover)',
                                    border: '1px solid var(--nav-border)',
                                    borderRadius: '16px',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'default',
                                    minWidth: '180px',
                                    maxWidth: '220px',
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>{suggestion.icon}</span>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--nav-text)', lineHeight: 1.2 }}>
                                        {suggestion.title}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--nav-text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                                        {suggestion.body}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mesaj Alanı */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                background: 'var(--nav-bg)',
            }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            borderRadius: msg.type === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                            background: msg.type === 'user' ? 'var(--nav-accent)' : 'var(--nav-hover)',
                            color: msg.type === 'user' ? 'white' : 'var(--nav-text)',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            fontWeight: '600',
                            border: msg.type === 'user' ? 'none' : '1px solid var(--nav-border)',
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div style={{
                        alignSelf: 'flex-start',
                        background: 'var(--nav-hover)',
                        padding: '16px 20px',
                        borderRadius: '24px 24px 24px 4px',
                        border: '1px solid var(--nav-border)',
                    }}>
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Önerilen Sorular */}
            <div style={{
                padding: '0 20px 16px 20px',
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                background: 'var(--nav-bg)',
                scrollbarWidth: 'none',
            }}>
                {FAQ_ITEMS.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSend(t(item.key))}
                        className="settings-card"
                        style={{
                            padding: '12px 20px',
                            background: 'var(--nav-hover)',
                            border: '1px solid var(--nav-border)',
                            borderRadius: '16px',
                            fontSize: '0.85rem',
                            color: 'var(--nav-text)',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '800',
                        }}
                    >
                        <Sparkles size={16} color="var(--nav-accent)" />
                        {t(item.key)}
                    </button>
                ))}
            </div>

            {/* Input Alanı */}
            <div style={{
                padding: '16px 20px',
                background: 'var(--nav-bg)',
                borderTop: '1px solid var(--nav-border)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('assistant.betaInputPlaceholder', "Huzur AI'ya Sorun...")}
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            paddingRight: '60px',
                            borderRadius: '24px',
                            border: '2px solid var(--nav-border)',
                            fontSize: '1rem',
                            outline: 'none',
                            background: 'var(--nav-hover)',
                            color: 'var(--nav-text)',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                        }}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim()}
                        style={{
                            position: 'absolute',
                            right: '6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '44px',
                            height: '44px',
                            borderRadius: '20px',
                            background: inputValue.trim() ? 'var(--nav-accent)' : 'var(--nav-border)',
                            border: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: inputValue.trim() ? 'pointer' : 'default',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            <style>{`
                .typing-indicator { display: flex; gap: 5px; }
                .typing-indicator span {
                    width: 7px; height: 7px;
                    background: var(--nav-accent);
                    opacity: 0.6; border-radius: 50%;
                    animation: typing 1.4s infinite ease-in-out both;
                }
                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes typing {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
                    40% { transform: scale(1.2); opacity: 1; }
                }
                .pulse {
                    display: inline-block;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
                    70% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
                }
            `}</style>
        </div>
    );
};

export default Assistant;
