import { useState, useRef, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';

const SUGGESTIONS = [
  'Kendimi üzgün hissediyorum',
  'Namaz kılmakta zorlanıyorum',
  'Hangi zikri çekmeliyim?',
  'Bugün ne yapabilirim?',
  'Kuran okumak istiyorum'
];

/** Pre-defined knowledge base for the spiritual assistant */
const SPIRITUAL_DATA = {
  // IBADET (Worship)
  worship: {
    keywords: ['namaz', 'oruç', 'hac', 'zekat', 'ibadet', 'kılmak', 'vakit'],
    responses: [
      "Namaz dinin direğidir. Namazda huşuyu yakalamak için vaktinden önce hazırlık yapmak (abdesti özenle almak) ve ayetlerin anlamlarını düşünmek çok yardımcı olur.",
      "İbadetlerde devamlılık esastır. Az da olsa sürekli olan amel Allah katında daha sevimlidir. Küçük ama istikrarlı adımlarla maneviyatınızı güçlendirebilirsiniz.",
      "Namaz kılmakta zorlanıyorsanız, önce sadece farzları kılarak başlayın. Kendinizi zorlamak yerine, namazın ruhunuza verdiği huzura odaklanmaya çalışın."
    ]
  },
  // DUA (Supplication)
  dua: {
    keywords: ['dua', 'zikir', 'tesbih', 'istek', 'dilek', 'huzur', 'ferahlık'],
    responses: [
      "Dua, müminin silahıdır. Duada samimiyet ve ısrar önemlidir. Allah'tan her şeyi (en küçük ihtiyacınızı bile) isteyebilirsiniz. O, isteyenleri geri çevirmez.",
      "Zikir kalplerin cilasıdır. 'La ilahe illallah' zikri imanı tazeler, 'Estağfirullah' ise günah yükünü hafifletir ve rızkı genişletir.",
      "Sıkıntılı anlarda İnşirah suresini okumak ve 'Hasbunallahu ve ni'mel vekil' zikrine devam etmek kalbi ferahlatır."
    ]
  },
  // AHLAK (Morals/Character)
  morals: {
    keywords: ['ahlak', 'sabır', 'öfke', 'yalan', 'gıybet', 'insan', 'ilişki', 'kıskançlık'],
    responses: [
      "Güzel ahlak, imanın olgunluğundandır. Sabır ise her hayrın başıdır. Öfkelendiğinizde abdest almak veya mekan değiştirmek nebevi bir tavsiyedir.",
      "Gıybet, kardeşinin etini yemek gibidir. Bir ortamda birinin aleyhinde konuşulduğunda konuyu değiştirmek veya o kişinin iyi yönlerini hatırlatmak çok kıymetlidir.",
      "Başkalarının ne düşündüğünden ziyade, Allah'ın bizden ne beklediğine odaklanmak, sosyal ilişkilerde bizi daha özgür ve huzurlu kılar."
    ]
  },
  // GUNLUK HAYAT (Daily Life)
  daily: {
    keywords: ['iş', 'okul', 'sınav', 'aile', 'anne', 'baba', 'evlilik', 'rızık'],
    responses: [
      "Helal rızık peşinde koşmak da bir ibadettir. İşinizi en güzel (ihsan) şekilde yapmaya niyet ederseniz, çalışma vaktiniz sevaba dönüşür.",
      "Anne ve babaya iyi davranmak (bir 'of' bile dememek), ömrün bereketlenmesine ve duanın kabulüne vesile olur.",
      "Evlilikte huzur, karşılıklı anlayış ve sabırla inşa edilir. Birbirinizin kusurlarını örtmekte gece gibi olun (Hz. Mevlana)."
    ]
  }
};

const SpiritualCoach = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 'start', text: "Selamun Aleyküm! Ben senin İslami Asistanın'ım. Size her konuda manevi rehberlik sunabilirim. Bir sorunuz mu var yoksa yukarıdaki hazır konulardan mı başlayalım?", sender: 'bot' }
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

  const handleSend = (text = inputText) => {
    if (!text.trim() || isTyping) return;

    const userInput = text.trim();
    const messageId = Date.now().toString(); // Standard ID generation

    // User message
    setMessages(prev => [...prev, { id: `u-${messageId}`, text: userInput, sender: 'user' }]);
    setInputText('');
    setIsTyping(true);

    // Matching Algorithm
    let responseText = "";
    const lowerInput = userInput.toLowerCase();
    
    // Check for exact category match or keyword match
    let bestCategory = null;
    let maxMatches = 0;

    Object.entries(SPIRITUAL_DATA).forEach(([catKey, catData]) => {
      const matchCount = catData.keywords.filter(kw => lowerInput.includes(kw)).length;
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestCategory = catKey;
      }
    });

    if (bestCategory) {
      const categoryResponses = SPIRITUAL_DATA[bestCategory].responses;
      responseText = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    } else {
      responseText = "Bu konuyu tam anlayamadım ama her türlü sıkıntıda 'Hasbunallah' zikrine devam etmenizi öneririm. Daha spesifik bir konuda (namaz, sabır, aile vb.) bir şey sormak ister misiniz?";
    }

    // Simulate natural typing delay
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: `b-${messageId}`, 
        text: responseText, 
        sender: 'bot' 
      }]);
      setIsTyping(false);
    }, 1000 + (Math.random() * 1000));
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

