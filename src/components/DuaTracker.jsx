import { useState } from 'react';
import {
  Plus, 
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Calendar,
  Heart,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGamification } from '../hooks/useGamification';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';
import './DuaTracker.css';
import './Navigation.css';

// Dua kategorileri
const DUA_CATEGORIES = [
  { id: 'health', name: 'Sağlık', icon: '💚', color: '#10b981' },
  { id: 'exam', name: 'Sınav', icon: '📚', color: '#3b82f6' },
  { id: 'work', name: 'İş', icon: '💼', color: '#f59e0b' },
  { id: 'family', name: 'Aile', icon: '👨‍👩‍👧', color: '#ec4899' },
  { id: 'marriage', name: 'Evlilik', icon: '💍', color: '#8b5cf6' },
  { id: 'children', name: 'Çocuk', icon: '👶', color: '#14b8a6' },
  { id: 'travel', name: 'Seyahat', icon: '✈️', color: '#f97316' },
  { id: 'forgiveness', name: 'Af', icon: '🙏', color: '#ef4444' },
  { id: 'general', name: 'Genel', icon: '🤲', color: 'var(--nav-text-muted)' }
];

// Önerilen dualar
const SUGGESTED_DUAS = [
  { text: 'Rabbim bana hayırlı bir eş nasip et', category: 'marriage' },
  { text: 'Sınavımı başarıyla geçmeyi nasip et', category: 'exam' },
  { text: 'Hastalığımdan şifa ver', category: 'health' },
  { text: 'İşimde başarılı olmayı nasip et', category: 'work' },
  { text: 'Ailemi koru ve bağışla', category: 'family' }
];

const STORAGE_KEY = 'huzur_dua_tracker';

export function DuaTracker({ onClose }) {
  const { t } = useTranslation();
  const { addXP } = useGamification();
  const initialData = storageService.getItem(STORAGE_KEY, null);
  const [newDua, setNewDua] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDua, setEditingDua] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const [data] = useState(() => {
    if (initialData) {
      return {
        duas: initialData.duas || [],
        stats: initialData.stats || { total: 0, completed: 0, streak: 0 }
      };
    }
    return { duas: [], stats: { total: 0, completed: 0, streak: 0 } };
  });
  
  const [duas, setDuas] = useState(data.duas);
  const [stats, setStats] = useState(data.stats);

  const saveDuas = (newDuas, newStats) => {
    storageService.setItem(STORAGE_KEY, {
      duas: newDuas,
      stats: newStats,
      lastUpdated: new Date().toISOString()
    });
  };

  const addDua = () => {
    if (!newDua.trim()) return;
    const dua = {
      id: Date.now().toString(),
      text: newDua.trim(),
      category: selectedCategory,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };
    const newDuas = [dua, ...duas];
    const newStats = { ...stats, total: newDuas.length };
    setDuas(newDuas);
    setStats(newStats);
    saveDuas(newDuas, newStats);
    setNewDua('');
    setShowAddForm(false);
    addXP(5);
  };

  const toggleDua = (id) => {
    const newDuas = duas.map(dua => {
      if (dua.id === id) {
        const completed = !dua.completed;
        return { ...dua, completed, completedAt: completed ? new Date().toISOString() : null };
      }
      return dua;
    });
    const completedCount = newDuas.filter(d => d.completed).length;
    const newStats = { ...stats, completed: completedCount };
    setDuas(newDuas);
    setStats(newStats);
    saveDuas(newDuas, newStats);
    if (completedCount > stats.completed) addXP(10);
  };

  const deleteDua = (id) => {
    const newDuas = duas.filter(d => d.id !== id);
    const newStats = { ...stats, total: newDuas.length, completed: newDuas.filter(d => d.completed).length };
    setDuas(newDuas);
    setStats(newStats);
    saveDuas(newDuas, newStats);
  };

  const updateDua = (id, newText, newCategory) => {
    const newDuas = duas.map(dua => dua.id === id ? { ...dua, text: newText, category: newCategory } : dua);
    setDuas(newDuas);
    saveDuas(newDuas, stats);
    setEditingDua(null);
  };

  const filteredDuas = duas.filter(dua => {
    if (filter === 'all') return true;
    if (filter === 'completed') return dua.completed;
    if (filter === 'pending') return !dua.completed;
    return dua.category === filter;
  });

  const getCategoryInfo = (categoryId) => DUA_CATEGORIES.find(c => c.id === categoryId) || DUA_CATEGORIES[8];

  return (
    <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <IslamicBackButton onClick={onClose} size="medium" />
        <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                {t('dua.tracker_title', 'Dua Takipçisi')}
            </h2>
            <p className="settings-desc">{t('dua.tracker_subtitle', 'Dualarınızı kaydedin ve takip edin')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        <div className="settings-card" style={{ flexDirection: 'column', padding: '16px', textAlign: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle2 size={24} color="#10b981" />
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--nav-text)' }}>{stats.completed}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>KABUL</div>
        </div>
        <div className="settings-card" style={{ flexDirection: 'column', padding: '16px', textAlign: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
            <Sparkles size={24} color="#f59e0b" />
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--nav-text)' }}>{stats.total}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>TOPLAM</div>
        </div>
        <div className="settings-card" style={{ flexDirection: 'column', padding: '16px', textAlign: 'center', gap: '8px', background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
            <Heart size={24} color="#ec4899" />
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--nav-text)' }}>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</div>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>ORAN</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="velocity-target-grid" style={{ marginBottom: '24px' }}>
        <button className={`velocity-target-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tümü</button>
        <button className={`velocity-target-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Bekleyen</button>
        <button className={`velocity-target-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Kabul</button>
      </div>

      {/* Add Dua Section */}
      <div className="settings-group">
        <button 
            className="settings-card" 
            style={{ width: '100%', justifyContent: 'center', gap: '12px', border: '2px dashed var(--nav-border)', background: 'transparent', padding: '20px' }}
            onClick={() => setShowAddForm(!showAddForm)}
        >
            <Plus size={20} color="var(--nav-accent)" />
            <span style={{ fontWeight: '800', color: 'var(--nav-text)' }}>Yeni Dua Ekle</span>
        </button>

        {showAddForm && (
            <div className="settings-card reveal-stagger" style={{ flexDirection: 'column', gap: '20px', padding: '24px', marginTop: '16px', background: 'var(--nav-hover)' }}>
                <textarea
                    value={newDua}
                    onChange={(e) => setNewDua(e.target.value)}
                    placeholder="Duanızı yazın..."
                    className="dua-modern-textarea"
                />
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {DUA_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{ '--cat-color': cat.color }}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                <div className="suggested-container">
                    <p style={{ margin: '0 0 12px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--nav-text-muted)' }}>ÖNERİLENLER</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {SUGGESTED_DUAS.map((suggested, index) => (
                            <button
                                key={index}
                                className="suggested-pill"
                                onClick={() => { setNewDua(suggested.text); setSelectedCategory(suggested.category); }}
                            >
                                {suggested.text}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    className="velocity-action-btn"
                    onClick={addDua}
                    disabled={!newDua.trim()}
                    style={{ width: '100%' }}
                >
                    Kaydet
                </button>
            </div>
        )}
      </div>

      {/* Dua List */}
      <div className="settings-group" style={{ marginTop: '32px' }}>
        <div className="settings-group-title">Dua Listesi</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredDuas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', opacity: 0.5 }}>
                    <Heart size={48} style={{ marginBottom: '16px' }} />
                    <p style={{ fontWeight: '700', margin: 0 }}>Henüz dua bulunmuyor</p>
                </div>
            ) : (
                filteredDuas.map((dua) => {
                    const category = getCategoryInfo(dua.category);
                    const isEditing = editingDua === dua.id;

                    return (
                        <div key={dua.id} className={`settings-card ${dua.completed ? 'completed-dua' : ''}`} style={{ flexDirection: 'column', padding: '20px', gap: '16px' }}>
                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                                    <textarea 
                                        defaultValue={dua.text} 
                                        id={`edit-text-${dua.id}`}
                                        className="dua-modern-textarea"
                                    />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="velocity-action-btn" style={{ flex: 1 }} onClick={() => {
                                            const text = document.getElementById(`edit-text-${dua.id}`).value;
                                            updateDua(dua.id, text, dua.category);
                                        }}>Kaydet</button>
                                        <button className="velocity-target-btn" style={{ flex: 1 }} onClick={() => setEditingDua(null)}>İptal</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', width: '100%' }}>
                                        <button 
                                            className={`dua-check-btn ${dua.completed ? 'active' : ''}`}
                                            onClick={() => toggleDua(dua.id)}
                                        >
                                            {dua.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </button>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: '700', color: 'var(--nav-text)', fontSize: '1rem', textDecoration: dua.completed ? 'line-through' : 'none', opacity: dua.completed ? 0.6 : 1 }}>
                                                {dua.text}
                                            </p>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: category.color, background: `${category.color}15`, padding: '4px 8px', borderRadius: '6px' }}>
                                                    {category.icon} {category.name}
                                                </span>
                                                {dua.completed && dua.completedAt && (
                                                    <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--nav-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Calendar size={10} /> {new Date(dua.completedAt).toLocaleDateString('tr-TR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="icon-btn-small" onClick={() => setEditingDua(dua.id)}><Edit2 size={14} /></button>
                                            <button className="icon-btn-small delete" onClick={() => deleteDua(dua.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })
            )}
        </div>
      </div>

      {/* Tips */}
      <div className="settings-card" style={{ background: 'var(--nav-hover)', border: 'none', marginTop: '32px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Info size={18} color="var(--nav-accent)" />
            <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--nav-text)' }}>Dua Adabı</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                    Dualarınızı ihlasla, düzenli olarak tekrarlayın ve her türlü hayırlı isteğiniz için Rabbimize sığının.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default DuaTracker;
