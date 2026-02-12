import { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, AlertCircle, Loader } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { searchNuzul } from '../data/nuzulData';
import { useErrorHandler } from '../hooks/useErrorHandler';
import ToastNotification from './ToastNotification';

const NuzulExplorer = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { error, clearError } = useErrorHandler();
  const messagesEndRef = useRef(null);

  // Örnek sorular
  const suggestedQuestions = [
    "Fatiha suresinin nüzul sebebi nedir?",
    "Ayetel Kürsi (Bakara 255) neden indi?",
    "Kevser suresi hangi olay üzerine indi?",
    "Maide 3. ayet ne zaman indi?",
    "İlk inen ayetler (Alak Suresi)",
    "İhlas suresi neden indirildi?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text = query) => {
    if (!text.trim() || isLoading) return;

    setQuery('');
    setIsLoading(true);

    // Kullanıcı mesajı
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);

    // Yerel Veritabanında Ara
    const localResult = searchNuzul(text);

    // Simulate brief loading for natural feel
    setTimeout(() => {
      if (localResult) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: localResult.content,
          source: localResult.source,
          title: localResult.title,
          timestamp: new Date() 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Bu ayet/sure hakkında veritabanımızda henüz detaylı nüzul bilgisi bulunamadı. Lütfen "Alaq Suresi", "Fatiha" veya "Ayetel Kürsi" gibi daha genel başlıkları denemeyi unutma.',
          timestamp: new Date() 
        }]);
      }
      setIsLoading(false);
    }, 500);
  };



  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="nuzul-explorer-container">
      {/* Header */}
      <div className="nuzul-header">
        <IslamicBackButton onClick={onClose} size="medium" />
        <div className="header-content">
          <h1>📖 Nüzul Sebebi</h1>
          <p className="subtitle">Ayetlerin iniş sebeplerini öğrenin</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="nuzul-messages">
        {messages.length === 0 ? (
          <div className="nuzul-welcome">
            <div className="welcome-icon">📜</div>
            <h2>Nüzul Sebebi Gezgini</h2>
            <p>Ayetlerin hangi olay üzerine indirildiğini öğrenmek için soru sorun.</p>
            
            <div className="suggested-questions">
              <h4>Örnek Sorular:</h4>
              {suggestedQuestions.map((q, i) => (
                <button 
                  key={i} 
                  className="suggested-btn"
                  onClick={() => handleSend(q)}
                >
                  <BookOpen size={14} />
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '📖'}
                </div>
                <div className="message-content">
                  {msg.title && <h3 className="result-title">{msg.title}</h3>}
                  
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}

                  {msg.source && (
                    <div className="source-tag">
                      Kaynak: {msg.source}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant loading">
                <div className="message-avatar">📖</div>
                <div className="message-content">
                  <Loader className="spin" size={20} />
                  <span>Araştırılıyor...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Display */}
      {/* Error Display */}
      {error && (
        <ToastNotification
          message={error.message}
          type="error"
          onClose={clearError}
        />
      )}

      {/* Input Area */}
      <div className="nuzul-input-area">
        <div className="input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir ayet veya sure hakkında sorun..."
            disabled={isLoading}
          />
          <button 
            className="send-btn"
            onClick={() => handleSend()}
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? <Loader className="spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>

      <style>{`
        .nuzul-explorer-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .nuzul-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content h1 {
          font-size: 1.4rem;
          margin: 0;
          color: var(--text-primary);
        }

        .subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 2px 0 0 0;
        }

        .nuzul-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          padding-bottom: 140px;
        }

        .nuzul-welcome {
          text-align: center;
          padding: 20px;
        }

        .welcome-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .nuzul-welcome h2 {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .nuzul-welcome > p {
          color: var(--text-secondary);
          font-size: 14px;
          margin: 0 0 24px 0;
        }

        .suggested-questions {
          text-align: left;
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .suggested-questions h4 {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .suggested-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 8px;
          transition: all 0.2s ease;
          text-align: left;
        }

        .suggested-btn:last-child {
          margin-bottom: 0;
        }

        .suggested-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          animation: fadeInUp 0.3s ease-out;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: var(--primary-color);
        }

        .message-content {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 12px 16px;
        }

        .message.user .message-content {
          background: rgba(212, 175, 55, 0.15);
        }

        .result-title {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          color: var(--primary-color);
        }

        .message-content p {
          margin: 0 0 8px 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .source-tag {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-style: italic;
        }

        .fallback-actions {
          margin-top: 12px;
        }

        .google-search-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #4285f4;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          margin-top: 8px;
          width: 100%;
          justify-content: center;
        }

        .nuzul-input-area {
          position: fixed;
          bottom: 50px;
          left: 0;
          right: 0;
          padding: 16px;
          background: linear-gradient(0deg, var(--bg-gradient-start) 0%, transparent 100%);
          backdrop-filter: blur(10px);
        }

        .input-wrapper {
          display: flex;
          gap: 10px;
          max-width: 600px;
          margin: 0 auto;
        }

        .input-wrapper input {
          flex: 1;
          padding: 14px 18px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 25px;
          color: var(--text-primary);
          font-size: 15px;
          outline: none;
        }

        .input-wrapper input::placeholder {
          color: var(--text-secondary);
        }

        .send-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .limit-badge {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .limit-badge.empty {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .limit-separator {
          opacity: 0.5;
        }

        .pro-badge-mini {
          color: var(--primary-color);
        }

        .nuzul-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          padding-bottom: 140px;
        }

        .nuzul-welcome {
          text-align: center;
          padding: 20px;
        }

        .welcome-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .nuzul-welcome h2 {
          font-size: 1.3rem;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .nuzul-welcome > p {
          color: var(--text-secondary);
          font-size: 14px;
          margin: 0 0 24px 0;
        }

        .suggested-questions {
          text-align: left;
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .suggested-questions h4 {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .suggested-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 8px;
          transition: all 0.2s ease;
          text-align: left;
        }

        .suggested-btn:last-child {
          margin-bottom: 0;
        }

        .suggested-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .suggested-btn:active {
          transform: scale(0.98);
        }

        .free-limit-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 10px;
          font-size: 12px;
          color: var(--primary-color);
        }

        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          animation: fadeInUp 0.3s ease-out;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: var(--primary-color);
        }

        .message-content {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 12px 16px;
        }

        .message.user .message-content {
          background: rgba(212, 175, 55, 0.15);
        }

        .result-title {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          color: var(--primary-color);
        }

        .message-content p {
          margin: 0 0 8px 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .message-content p:last-child {
          margin-bottom: 0;
        }

        .source-tag {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-style: italic;
        }

        .message.loading .message-content {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-secondary);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .nuzul-error {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 16px 16px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #ef4444;
          font-size: 13px;
        }

        .nuzul-error button {
          margin-left: auto;
          background: none;
          border: none;
          color: #ef4444;
          font-size: 18px;
          cursor: pointer;
        }

        .nuzul-input-area {
          position: fixed;
          bottom: 50px;
          left: 0;
          right: 0;
          padding: 16px;
          background: linear-gradient(0deg, var(--bg-gradient-start) 0%, transparent 100%);
          backdrop-filter: blur(10px);
        }

        .input-wrapper {
          display: flex;
          gap: 10px;
          max-width: 600px;
          margin: 0 auto;
        }

        .input-wrapper input {
          flex: 1;
          padding: 14px 18px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 25px;
          color: var(--text-primary);
          font-size: 15px;
          outline: none;
        }

        .input-wrapper input::placeholder {
          color: var(--text-secondary);
        }

        .input-wrapper input:focus {
          border-color: var(--primary-color);
        }

        .send-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn:not(:disabled):active {
          transform: scale(0.9);
        }

        .remaining-hint {
          text-align: center;
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 8px;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NuzulExplorer;
