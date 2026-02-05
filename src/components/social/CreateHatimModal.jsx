import { useState } from 'react';
import { checkRateLimit } from '../../utils/rateLimiter';
import { useGroupHatim } from '../../hooks/useGroupHatim';

const CreateHatimModal = ({ onClose, onSuccess }) => {
  const { createHatim } = useGroupHatim();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Rate limiting: max 3 hatims per hour
    if (!checkRateLimit('hatim_create', 3, 3600000)) {
      alert('Çok fazla hatim oluşturdunuz. Lütfen daha sonra tekrar deneyin.');
      return;
    }

    setLoading(true); // Changed from setIsSubmitting(true) to setLoading(true) to match existing state variable
    try {
      await createHatim(name, desc, 30);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Hatim oluşturulamadı');
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
        <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Yeni Hatim Başlat</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px', fontSize: '14px' }}>Hatim Adı</label>
            <input 
              type="text"
              placeholder="Örn: Ailemiz için Hatim" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.1)',
                color: 'var(--text-color)',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-color)', marginBottom: '5px', fontSize: '14px' }}>Açıklama (İsteğe Bağlı)</label>
            <textarea 
              placeholder="Niyetiniz nedir..." 
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.1)',
                color: 'var(--text-color)',
              }}
            />
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
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHatimModal;
