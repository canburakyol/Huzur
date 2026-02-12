import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, ChevronLeft, Sparkles } from 'lucide-react';

const Assistant = ({ onClose }) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef(null);
    const nextMessageIdRef = useRef(1);

    const getNextMessageId = () => {
        const id = nextMessageIdRef.current;
        nextMessageIdRef.current += 1;
        return id;
    };

    const FAQ_ITEMS = [
        {
            key: 'assistant.questions.q1',
            answerKey: 'assistant.answers.q1'
        },
        {
            key: 'assistant.questions.q2',
            answerKey: 'assistant.answers.q2'
        },
        {
            key: 'assistant.questions.q3',
            answerKey: 'assistant.answers.q3'
        },
        {
            key: 'assistant.questions.q4',
            answerKey: 'assistant.answers.q4'
        },
        {
            key: 'assistant.questions.q5',
            answerKey: 'assistant.answers.q5'
        },
        {
            key: 'assistant.questions.q6',
            answerKey: 'assistant.answers.q6'
        }
    ];

    useEffect(() => {
        setMessages([
            {
                id: getNextMessageId(),
                type: 'bot',
                text: `${t('assistant.welcomeMessage')}\n\n${t('assistant.betaWelcomeHint', 'Beta mode: Tap a suggested question or type a similar one.')}`
            }
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

        return t('assistant.betaUnknownQuestion', 'This question is not in the beta preset answers list yet. Please tap one of the suggested questions below.');
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
                text: getFaqAnswer(query)
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 450);
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
                    <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{t('assistant.title')} ({t('assistant.betaLabel', 'Beta')})</h3>
                    <span style={{ fontSize: '12px', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', background: '#27ae60', borderRadius: '50%' }}></span>
                        {t('assistant.readyQaMode', 'Preset Q&A mode')}
                    </span>
                </div>
            </div>

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

            <div style={{ padding: '0 20px 10px 20px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px' }}>
                {FAQ_ITEMS.map((item, idx) => (
                    <button key={idx} onClick={() => handleSend(t(item.key))} style={{
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
                        {t(item.key)}
                    </button>
                ))}
            </div>

            <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('assistant.betaInputPlaceholder', 'Beta: Type one of the preset questions or choose below')}
                    style={{
                        flex: 1,
                        padding: '12px 20px',
                        borderRadius: '25px',
                        border: '1px solid #ddd',
                        fontSize: '15px',
                        outline: 'none',
                        background: '#f8f9fa',
                        color: '#333'
                    }}
                />
                <button
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim()}
                    style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: inputValue.trim() ? '#2c3e50' : '#ccc',
                        border: 'none',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: inputValue.trim() ? 'pointer' : 'default',
                        transition: 'background 0.3s'
                    }}
                >
                    <Send size={20} />
                </button>
            </div>

            <style>{`
                .typing-indicator {
                    display: flex;
                    gap: 5px;
                }
                .typing-indicator span {
                    width: 6px;
                    height: 6px;
                    background: #ccc;
                    border-radius: 50%;
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
