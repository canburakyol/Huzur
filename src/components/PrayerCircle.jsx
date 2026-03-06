import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Heart, Plus, ThumbsUp, MessageSquare, Hand, Sparkles } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';

const PRAYER_REQUESTS_KEY = 'myPrayerRequests';

const MOCK_REQUESTS = [
  { id: 1, user: 'Ahmet Y.', text: 'Hayırlı bir iş için dua bekliyorum.', count: 12, prayed: false },
  { id: 2, user: 'Fatma K.', text: 'Hastamız için şifa duası eder misiniz?', count: 45, prayed: false },
  { id: 3, user: 'Mehmet S.', text: 'Sınavlarımda başarı için dua istiyorum.', count: 8, prayed: false },
  { id: 4, user: 'Ayşe D.', text: 'Aile huzuru için dualarınızı bekliyorum.', count: 23, prayed: false }
];

const PrayerCircle = ({ onClose }) => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState(() => {
    const savedMyRequests = storageService.getItem(PRAYER_REQUESTS_KEY, []);
    return [...savedMyRequests, ...MOCK_REQUESTS];
  });
  const [newRequest, setNewRequest] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handlePray = (id) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, count: req.count + 1, prayed: true };
      }
      return req;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRequest.trim()) return;

    const request = {
      id: Date.now(),
      user: t('prayerCircle.me', 'Ben'),
      text: newRequest,
      count: 0,
      prayed: false,
      isMine: true
    };

    const updatedRequests = [request, ...requests];
    setRequests(updatedRequests);
    
    const myRequests = updatedRequests.filter(r => r.isMine);
    storageService.setItem(PRAYER_REQUESTS_KEY, myRequests);
    
    setNewRequest('');
    setShowForm(false);
  };

  return (
    <div className="settings-container reveal-stagger" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <IslamicBackButton onClick={onClose} size="medium" />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
            {t('prayerCircle.title', 'Dua Halkası')}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
            {t('prayerCircle.subtitle', 'Dualarda buluşalım')}
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="velocity-add-btn"
        >
          {showForm ? <Sparkles size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Intro Info */}
      <div className="settings-card" style={{ 
          marginBottom: '24px', padding: '16px', background: 'rgba(79, 70, 229, 0.05)', 
          border: '1px dashed var(--nav-accent)', gap: '12px' 
      }}>
        <div className="settings-icon-box" style={{ width: '32px', height: '32px', background: 'transparent', color: 'var(--nav-accent)' }}>
            <Users size={18} />
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600', lineHeight: '1.4' }}>
          {t('prayerCircle.intro', 'Birbirimize dua ederek manevi bağımızı güçlendiriyoruz.')}
        </p>
      </div>

      {/* Add Request Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="settings-card reveal-stagger" style={{ 
            flexDirection: 'column', padding: '24px', marginBottom: '24px', 
            background: 'var(--nav-hover)', border: '1px solid var(--nav-accent)' 
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '900', color: 'var(--nav-text)' }}>
            {t('prayerCircle.askForPrayer', 'Dua İste')}
          </h3>
          <textarea
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            placeholder={t('prayerCircle.placeholder', 'Niyetinizi yazın...')}
            className="velocity-textarea"
          />
          <button 
            type="submit"
            className="velocity-btn-primary"
            style={{ width: '100%', padding: '14px' }}
          >
            <Hand size={18} style={{ marginRight: '8px' }} />
            {t('prayerCircle.submit', 'Dua İsteğini Paylaş')}
          </button>
        </form>
      )}

      {/* Requests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {requests.map((req, index) => (
          <div key={req.id} className="settings-card" style={{ 
              flexDirection: 'column', padding: '20px',
              '--delay': `${index * 0.1}s` 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: req.isMine ? 'var(--nav-accent)' : '#10b981' }}></div>
                <span style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  {req.user}
                </span>
                {req.isMine && (
                  <span className="me-badge">{t('prayerCircle.me', 'BEN')}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--nav-accent)', fontWeight: '950', fontSize: '0.9rem' }}>
                <Heart size={14} fill={req.count > 0 ? "var(--nav-accent)" : "transparent"} />
                {req.count}
              </div>
            </div>
            
            <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: 'var(--nav-text)', fontWeight: '600', lineHeight: '1.6' }}>
              {req.text}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handlePray(req.id)}
                disabled={req.prayed}
                className={`pray-button ${req.prayed ? 'prayed' : ''}`}
              >
                {req.prayed ? <ThumbsUp size={14} /> : <Hand size={14} />}
                <span>{req.prayed ? t('prayerCircle.prayed', 'Amin') : t('prayerCircle.pray', 'Dua Et')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .velocity-add-btn {
            width: 44px;
            height: 44px;
            border-radius: 14px;
            background: var(--nav-accent);
            color: white;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .velocity-add-btn:active { transform: scale(0.9); }

        .velocity-textarea {
            width: 100%;
            min-height: 100px;
            padding: 16px;
            background: var(--nav-bg);
            border: 1px solid var(--nav-border);
            border-radius: 14px;
            color: var(--nav-text);
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 20px;
            resize: none;
            outline: none;
            transition: border-color 0.3s;
        }

        .velocity-textarea:focus { border-color: var(--nav-accent); }

        .velocity-btn-primary {
            background: var(--nav-accent);
            color: white;
            border: none;
            border-radius: 14px;
            font-size: 0.9rem;
            font-weight: 900;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }

        .me-badge {
            font-size: 0.65rem;
            background: var(--nav-accent);
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-weight: 900;
        }

        .pray-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 900;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: var(--nav-hover);
            color: var(--nav-accent);
            border: 1px solid var(--nav-accent);
        }

        .pray-button.prayed {
            background: #10b981;
            color: white;
            border-color: #10b981;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .pray-button:not(.prayed):active { transform: scale(0.95); background: var(--nav-accent); color: white; }
      `}</style>
    </div>
  );
};

export default PrayerCircle;
