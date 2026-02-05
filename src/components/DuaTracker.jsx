import { useState } from 'react';
import { 
  X, 
  Plus, 
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  Heart,
  Sparkles,
  Bell
} from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import './DuaTracker.css';

// Dua kategorileri
const DUA_CATEGORIES = [
  { id: 'health', name: 'Sağlık', icon: '💚', color: '#22c55e' },
  { id: 'exam', name: 'Sınav', icon: '📚', color: '#3b82f6' },
  { id: 'work', name: 'İş', icon: '💼', color: '#f59e0b' },
  { id: 'family', name: 'Aile', icon: '👨‍👩‍👧‍👦', color: '#ec4899' },
  { id: 'marriage', name: 'Evlilik', icon: '💍', color: '#8b5cf6' },
  { id: 'children', name: 'Çocuk', icon: '👶', color: '#f97316' },
  { id: 'travel', name: 'Seyahat', icon: '✈️', color: '#14b8a6' },
  { id: 'forgiveness', name: 'Af', icon: '🙏', color: '#ef4444' },
  { id: 'general', name: 'Genel', icon: '🤲', color: '#6b7280' }
];

// Önerilen dualar
const SUGGESTED_DUAS = [
  { text: 'Rabbim bana hayırlı bir eş nasip et', category: 'marriage' },
  { text: 'Sınavımı başarıyla geçmeyi nasip et', category: 'exam' },
  { text: 'Hastalığımdan şifa ver', category: 'health' },
  { text: 'İşimde başarılı olmayı nasip et', category: 'work' },
  { text: 'Ailemi koru ve bağışla', category: 'family' },
  { text: 'Çocuklarımı hayırlı evlatlar eyle', category: 'children' },
  { text: 'Günahlarımı affet', category: 'forgiveness' },
  { text: 'Yolculuğumu kolaylaştır', category: 'travel' }
];

// Storage key
const STORAGE_KEY = 'huzur_dua_tracker';

export function DuaTracker({ onClose }) {
  const { addXP } = useGamification();
  const [newDua, setNewDua] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDua, setEditingDua] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Load duas from storage - using initial state instead of useEffect setState
  const [data] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        duas: parsed.duas || [],
        stats: parsed.stats || { total: 0, completed: 0, streak: 0 }
      };
    }
    return {
      duas: [],
      stats: { total: 0, completed: 0, streak: 0 }
    };
  });
  
  const [duas, setDuas] = useState(data.duas);
  const [stats, setStats] = useState(data.stats);

  // Save duas to storage
  const saveDuas = (newDuas, newStats) => {
    const data = {
      duas: newDuas,
      stats: newStats,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // Add new dua
  const addDua = () => {
    if (!newDua.trim()) return;

    const dua = {
      id: Date.now().toString(),
      text: newDua.trim(),
      category: selectedCategory,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      reminder: null
    };

    const newDuas = [dua, ...duas];
    const newStats = {
      ...stats,
      total: stats.total + 1
    };

    setDuas(newDuas);
    setStats(newStats);
    saveDuas(newDuas, newStats);
    
    setNewDua('');
    setShowAddForm(false);
    addXP(5);
  };

  // Toggle dua completion
  const toggleDua = (id) => {
    const newDuas = duas.map(dua => {
      if (dua.id === id) {
        const completed = !dua.completed;
        return {
          ...dua,
          completed,
          completedAt: completed ? new Date().toISOString() : null
        };
      }
      return dua;
    });

    const completedCount = newDuas.filter(d => d.completed).length;
    const newStats = {
      ...stats,
      completed: completedCount
    };

    setDuas(newDuas);
    setStats(newStats);
    saveDuas(newDuas, newStats);

    if (completedCount > stats.completed) {
      addXP(10);
    }
  };

  // Delete dua
  const deleteDua = (id) => {
    const newDuas = duas.filter(d => d.id !== id);
    const newStats = {
      ...stats,
      total: newDuas.length,
      completed: newDuas.filter(d => d.completed).length
    };

    setDuas(newDuas);
    setStats(newStats);
    saveDuas(newDuas, newStats);
  };

  // Edit dua
  const updateDua = (id, newText, newCategory) => {
    const newDuas = duas.map(dua => 
      dua.id === id ? { ...dua, text: newText, category: newCategory } : dua
    );
    setDuas(newDuas);
    saveDuas(newDuas, stats);
    setEditingDua(null);
  };

  // Filter duas
  const filteredDuas = duas.filter(dua => {
    if (filter === 'all') return true;
    if (filter === 'completed') return dua.completed;
    if (filter === 'pending') return !dua.completed;
    return dua.category === filter;
  });

  // Get category info
  const getCategoryInfo = (categoryId) => {
    return DUA_CATEGORIES.find(c => c.id === categoryId) || DUA_CATEGORIES[8];
  };

  return (
    <div className="dua-tracker-container">
      {/* Header */}
      <div className="dua-header">
        <button className="back-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="header-content">
          <h1>Dua Takipçisi</h1>
          <p>Dualarınızı kaydedin ve takip edin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="dua-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Kabul</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
            <Sparkles size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Toplam</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>
            <Heart size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
            <span className="stat-label">Oran</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tümü
        </button>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Bekleyen
        </button>
        <button 
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Kabul
        </button>
      </div>

      {/* Add Dua Button */}
      <button 
        className="add-dua-btn"
        onClick={() => setShowAddForm(!showAddForm)}
      >
        <Plus size={20} />
        Yeni Dua Ekle
      </button>

      {/* Add Dua Form */}
      {showAddForm && (
        <div className="add-dua-form">
          <textarea
            value={newDua}
            onChange={(e) => setNewDua(e.target.value)}
            placeholder="Duanızı yazın..."
            className="dua-input"
            rows={3}
          />
          
          <div className="category-selector">
            <span>Kategori:</span>
            <div className="category-options">
              {DUA_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`category-option ${selectedCategory === cat.id ? 'selected' : ''}`}
                  style={{ 
                    backgroundColor: selectedCategory === cat.id ? cat.color : 'transparent',
                    borderColor: cat.color
                  }}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="suggested-duas">
            <span>Önerilen Dualar:</span>
            <div className="suggested-list">
              {SUGGESTED_DUAS.map((suggested, index) => (
                <button
                  key={index}
                  className="suggested-item"
                  onClick={() => {
                    setNewDua(suggested.text);
                    setSelectedCategory(suggested.category);
                  }}
                >
                  {suggested.text}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="save-dua-btn"
            onClick={addDua}
            disabled={!newDua.trim()}
          >
            Kaydet
          </button>
        </div>
      )}

      {/* Dua List */}
      <div className="dua-list">
        {filteredDuas.length === 0 ? (
          <div className="empty-state">
            <Heart size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p>Henüz dua eklenmemiş</p>
            <p className="empty-hint">Yeni bir dua ekleyerek başlayın</p>
          </div>
        ) : (
          filteredDuas.map(dua => {
            const category = getCategoryInfo(dua.category);
            
            return (
              <div 
                key={dua.id}
                className={`dua-card ${dua.completed ? 'completed' : ''}`}
              >
                {editingDua === dua.id ? (
                  <div className="edit-form">
                    <textarea
                      defaultValue={dua.text}
                      id={`edit-text-${dua.id}`}
                      className="edit-input"
                      rows={2}
                    />
                    <select 
                      defaultValue={dua.category}
                      id={`edit-cat-${dua.id}`}
                      className="edit-select"
                    >
                      {DUA_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    <div className="edit-actions">
                      <button 
                        className="save-btn"
                        onClick={() => {
                          const text = document.getElementById(`edit-text-${dua.id}`).value;
                          const cat = document.getElementById(`edit-cat-${dua.id}`).value;
                          updateDua(dua.id, text, cat);
                        }}
                      >
                        Kaydet
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => setEditingDua(null)}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="dua-content">
                      <button 
                        className={`completion-btn ${dua.completed ? 'completed' : ''}`}
                        onClick={() => toggleDua(dua.id)}
                      >
                        {dua.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                      
                      <div className="dua-info">
                        <p className="dua-text">{dua.text}</p>
                        <div className="dua-meta">
                          <span 
                            className="dua-category"
                            style={{ color: category.color }}
                          >
                            {category.icon} {category.name}
                          </span>
                          {dua.completed && dua.completedAt && (
                            <span className="completed-date">
                              <Calendar size={12} />
                              {new Date(dua.completedAt).toLocaleDateString('tr-TR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="dua-actions">
                      <button 
                        className="action-btn"
                        onClick={() => setEditingDua(dua.id)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => deleteDua(dua.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Info Section */}
      <div className="dua-info-section">
        <h3>💡 Dua Hakkında</h3>
        <ul>
          <li>Dua, kulun Rabbi ile olan iletişimidir.</li>
          <li>Allah duaları işitir ve karşılık verir.</li>
          <li>Dualarınızı düzenli olarak tekrarlayın.</li>
          <li>Kabul olan dualarınızı işaretleyin.</li>
          <li>Dualarınızı başkalarıyla paylaşmayın.</li>
        </ul>
      </div>
    </div>
  );
}

export default DuaTracker;