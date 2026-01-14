import { useState, useRef, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { chatWithGemini } from '../services/geminiService';

const SUGGESTIONS = [
  'Kendimi üzgün hissediyorum',
  'Namaz kılmakta zorlanıyorum',
  'Hangi zikri çekmeliyim?',
  'Bugün ne yapabilirim?',
  'Kuran okumak istiyorum'
];

const SpiritualCoach = ({ onClose }) => {
  // const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { id: 1, text: "Selamun Aleyküm! Ben senin İslami Asistanın'ım. Dini sorularınızı yanıtlar, manevi rehberlik sunarım. Size nasıl yardımcı olabilirim?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text = inputText) => {
    if (!text.trim() || isTyping) return;

    // User message
    const userMsg = { id: Date.now(), text: text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Gemini API çağrısı
      const response = await chatWithGemini(text);
      
      const botMsg = { 
        id: Date.now() + 1, 
        text: response.content || 'Şu anda yanıt veremedim. Lütfen tekrar deneyin.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Gemini API Error:', error);
      const errorMsg = { 
        id: Date.now() + 1, 
        text: 'Şu anda servis yoğunluğu nedeniyle yanıt veremiyorum. Lütfen kısa bir süre sonra tekrar deneyin.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-color)' }}>
      {/* Header */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--glass-border)' }}>
        <IslamicBackButton onClick={onClose} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--primary-color)' }}>İslami Asistan</h2>
            <div style={{ fontSize: '12px', color: '#2ecc71' }}>• Çevrimiçi</div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            display: 'flex',
            gap: '10px',
            flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: msg.sender === 'user' ? '#3498db' : 'var(--primary-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
              borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
              background: msg.sender === 'user' ? '#3498db' : 'var(--glass-bg)',
              color: msg.sender === 'user' ? 'white' : 'var(--text-color)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', marginLeft: '42px', padding: '10px', background: 'var(--glass-bg)', borderRadius: '16px', borderTopLeftRadius: '4px' }}>
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: '10px 20px', overflowX: 'auto', display: 'flex', gap: '10px', scrollbarWidth: 'none' }}>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            disabled={isTyping}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid var(--primary-color)',
              background: 'transparent',
              color: 'var(--primary-color)',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              cursor: isTyping ? 'not-allowed' : 'pointer',
              opacity: isTyping ? 0.5 : 1
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Bir şeyler yazın..."
            disabled={isTyping}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '24px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.5)',
              outline: 'none',
              opacity: isTyping ? 0.7 : 1
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isTyping || !inputText.trim()}
            style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: isTyping || !inputText.trim() ? '#ccc' : 'var(--primary-color)', 
              border: 'none',
              color: 'white', cursor: isTyping ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      
      <style>{`
        .typing-indicator span {
          display: inline-block;
          width: 6px; height: 6px;
          background-color: #aaa;
          border-radius: 50%;
          margin: 0 2px;
          animation: typing 1s infinite;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default SpiritualCoach;

