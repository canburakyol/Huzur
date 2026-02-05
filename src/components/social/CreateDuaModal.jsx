import { useState } from 'react';
import { checkRateLimit } from '../../utils/rateLimiter';
import { useDua } from '../../hooks/useDua';

const CreateDuaModal = ({ onClose }) => {
  const { createDua } = useDua();
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Rate limiting: max 5 duas per hour
    if (!checkRateLimit('dua_submit', 5, 3600000)) {
      alert('Çok fazla dua isteği gönderdiniz. Lütfen daha sonra tekrar deneyin.');
      return;
    }

    setLoading(true);
    try {
      // Author name will be handled by service/backend if not anonymous
      await createDua(text, isAnonymous, null); 
      onClose();
    } catch (error) {
      console.error(error);
      alert('Dua isteği oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(5px)',
      padding: '20px'
    }}>
      <div className="glass-card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '24px',
        border: '1px solid var(--primary-color)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Dua İste</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px', fontSize: '14px' }}>Duanız</label>
            <textarea 
              placeholder="Allah rızası için..." 
              value={text}
              onChange={e => setText(e.target.value)}
              required
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.1)',
                color: 'var(--text-color)',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              id="anonymous"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
            />
            <label htmlFor="anonymous" style={{ color: 'var(--text-color)', fontSize: '14px' }}>
              İsimsiz Paylaş (Anonim)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="btn" 
              onClick={onClose}
              style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-color)' }}
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Paylaşılıyor...' : 'Paylaş'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDuaModal;
