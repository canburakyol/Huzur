import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Heart, Plus, MessageCircle, ThumbsUp } from 'lucide-react';
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
    // In a real app, we would send this to the backend
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRequest.trim()) return;

    const request = {
      id: Date.now(),
      user: 'Ben', // Or user's name if available
      text: newRequest,
      count: 0,
      prayed: false,
      isMine: true
    };

    const updatedRequests = [request, ...requests];
    setRequests(updatedRequests);
    
    // Save my requests
    const myRequests = updatedRequests.filter(r => r.isMine);
    storageService.setItem(PRAYER_REQUESTS_KEY, myRequests);
    
    setNewRequest('');
    setShowForm(false);
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', padding: '20px', background: 'var(--bg-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <IslamicBackButton onClick={onClose} />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--primary-color)' }}>
            🤲 {t('prayerCircle.title')}
          </h2>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            background: 'var(--primary-color)', color: 'white',
            border: 'none', borderRadius: '50%', width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)'
          }}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Intro */}
      <div className="glass-card" style={{ padding: '15px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Users size={24} color="var(--primary-color)" />
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-color)' }}>
          {t('prayerCircle.intro')}
        </p>
      </div>

      {/* Add Request Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', animation: 'fadeIn 0.3s ease' }}>
          <textarea
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            placeholder={t('prayerCircle.placeholder')}
            style={{
              width: '100%', padding: '15px', borderRadius: '12px',
              border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
              minHeight: '100px', marginBottom: '10px', resize: 'vertical'
            }}
          />
          <button 
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {t('prayerCircle.submit')}
          </button>
        </form>
      )}

      {/* Requests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {requests.map(req => (
          <div key={req.id} className="glass-card" style={{ padding: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '14px' }}>
                {req.user} {req.isMine && <span style={{ fontSize: '10px', background: '#e74c3c', color: 'white', padding: '2px 6px', borderRadius: '10px', marginLeft: '5px' }}>{t('prayerCircle.me')}</span>}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                {req.count} {t('prayerCircle.prayers')}
              </span>
            </div>
            
            <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--text-color)', lineHeight: '1.5' }}>
              {req.text}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handlePray(req.id)}
                disabled={req.prayed}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: req.prayed ? '#2ecc71' : 'var(--glass-bg)',
                  color: req.prayed ? 'white' : 'var(--primary-color)',
                  border: req.prayed ? 'none' : '1px solid var(--primary-color)',
                  cursor: req.prayed ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {req.prayed ? <ThumbsUp size={16} /> : <Heart size={16} />}
                {req.prayed ? t('prayerCircle.prayed') : t('prayerCircle.pray')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerCircle;
