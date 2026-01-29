import { useState, useEffect, useCallback } from 'react';

import { 
  X, 
  Plus, 
  Minus, 
  Moon, 
  Sun, 
  Sunrise, 
  Star,
  CheckCircle2,
  Circle,
  Trophy,
  Flame
} from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import './NafilePrayers.css';

// Nafile namaz tipleri
const NAFILE_PRAYERS = [
  {
    id: 'teravih',
    name: 'Teravih',
    nameTr: 'Teravih Namazı',
    description: 'Ramazan ayında yatsı namazından sonra kılınan 20 rekatlık namaz',
    icon: '🌙',
    rekat: 20,
    color: '#8b5cf6',
    category: 'ramazan',
    time: 'yatsi_after'
  },
  {
    id: 'duha',
    name: 'Duha',
    nameTr: 'Duha Namazı',
    description: 'Güneş doğduktan 15-20 dakika sonra kılınan 2-8 rekatlık namaz',
    icon: '☀️',
    rekat: 8,
    color: '#f59e0b',
    category: 'daily',
    time: 'morning'
  },
  {
    id: 'teheccud',
    name: 'Tahajjud',
    nameTr: 'Tahaccüt Namazı',
    description: 'Gece yarısından sonra kılınan 2-12 rekatlık namaz',
    icon: '🌟',
    rekat: 12,
    color: '#3b82f6',
    category: 'night',
    time: 'midnight'
  },
  {
    id: 'kusluk',
    name: 'Ishraq',
    nameTr: 'Kuşluk Namazı',
    description: 'Güneş doğup 45 derece yükseldikten sonra kılınan 2-4 rekatlık namaz',
    icon: '🌅',
    rekat: 4,
    color: '#ec4899',
    category: 'morning',
    time: 'mid_morning'
  },
  {
    id: 'vitr',
    name: 'Witr',
    nameTr: 'Vitir Namazı',
    description: 'Yatsı namazından sonra kılınan tek rekatlık namaz',
    icon: '✨',
    rekat: 3,
    color: '#22c55e',
    category: 'daily',
    time: 'yatsi_after'
  },
  {
    id: 'istihare',
    name: 'Istikhara',
    nameTr: 'İstihare Namazı',
    description: 'Bir işe başlamadan önce danışma namazı',
    icon: '🤲',
    rekat: 2,
    color: '#14b8a6',
    category: 'special',
    time: 'any'
  },
  {
    id: 'tevbe',
    name: 'Tawba',
    nameTr: 'Tevbe Namazı',
    description: 'Günahların affı için kılınan namaz',
    icon: '🙏',
    rekat: 2,
    color: '#ef4444',
    category: 'special',
    time: 'any'
  },
  {
    id: 'hacet',
    name: 'Hajat',
    nameTr: 'Hacet Namazı',
    description: 'Bir ihtiyaç için kılınan namaz',
    icon: '💫',
    rekat: 2,
    color: '#f97316',
    category: 'special',
    time: 'any'
  }
];

// Storage key
const STORAGE_KEY = 'huzur_nafile_prayers';

export function NafilePrayers({ onClose }) {
  const { addXP } = useGamification();
  const [records, setRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [streak, setStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);

  // Load records from storage
  useEffect(() => {
    let mounted = true;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && mounted) {
      const data = JSON.parse(stored);
      setRecords(data.records || {});
      setStreak(data.streak || 0);
      setTotalCompleted(data.totalCompleted || 0);
    }
    return () => { mounted = false; };
  }, []);

  // Save records to storage
  const saveRecords = useCallback((newRecords, newStreak, newTotal) => {
    const data = {
      records: newRecords,
      streak: newStreak,
      totalCompleted: newTotal,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // Get today's records
  const getTodayRecords = useCallback(() => {
    return records[selectedDate] || {};
  }, [records, selectedDate]);

  // Update prayer count
  const updatePrayer = useCallback((prayerId, rekatCount, completed) => {
    const todayRecords = getTodayRecords();
    const oldCompleted = todayRecords[prayerId]?.completed || false;
    
    const newTodayRecords = {
      ...todayRecords,
      [prayerId]: {
        rekat: rekatCount,
        completed,
        timestamp: new Date().toISOString()
      }
    };

    const newRecords = {
      ...records,
      [selectedDate]: newTodayRecords
    };

    // Calculate streak
    let newStreak = streak;
    let newTotal = totalCompleted;
    
    if (completed && !oldCompleted) {
      newTotal += 1;
      
      // Check if any prayer was completed yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];
      
      if (records[yesterdayKey] && Object.values(records[yesterdayKey]).some(r => r.completed)) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      
      // Add XP
      addXP(10);
    }

    setRecords(newRecords);
    setStreak(newStreak);
    setTotalCompleted(newTotal);
    saveRecords(newRecords, newStreak, newTotal);
  }, [records, getTodayRecords, streak, totalCompleted, addXP, saveRecords]);

  // Increment/Decrement rekat
  const adjustRekat = useCallback((prayerId, delta) => {
    const todayRecords = getTodayRecords();
    const current = todayRecords[prayerId] || { rekat: 0, completed: false };
    const maxRekat = NAFILE_PRAYERS.find(p => p.id === prayerId)?.rekat || 20;
    
    const newRekat = Math.max(0, Math.min(maxRekat, current.rekat + delta));
    const completed = newRekat >= maxRekat;
    
    updatePrayer(prayerId, newRekat, completed);
  }, [getTodayRecords, updatePrayer]);

  // Toggle completion
  const toggleCompletion = useCallback((prayerId) => {
    const todayRecords = getTodayRecords();
    const current = todayRecords[prayerId] || { rekat: 0, completed: false };
    const maxRekat = NAFILE_PRAYERS.find(p => p.id === prayerId)?.rekat || 20;
    
    if (!current.completed) {
      updatePrayer(prayerId, maxRekat, true);
    } else {
      updatePrayer(prayerId, 0, false);
    }
  }, [getTodayRecords, updatePrayer]);

  // Get progress for a prayer
  const getProgress = useCallback((prayerId) => {
    const todayRecords = getTodayRecords();
    const record = todayRecords[prayerId];
    const prayer = NAFILE_PRAYERS.find(p => p.id === prayerId);
    
    if (!record || !prayer) return { current: 0, max: prayer?.rekat || 0, percentage: 0 };
    
    const percentage = (record.rekat / prayer.rekat) * 100;
    return {
      current: record.rekat,
      max: prayer.rekat,
      percentage,
      completed: record.completed
    };
  }, [getTodayRecords]);

  // Get today's total stats
  const getTodayStats = useCallback(() => {
    const todayRecords = getTodayRecords();
    const completed = Object.values(todayRecords).filter(r => r.completed).length;
    const totalRekat = Object.values(todayRecords).reduce((sum, r) => sum + (r.rekat || 0), 0);
    return { completed, totalRekat };
  }, [getTodayRecords]);

  const todayStats = getTodayStats();

  return (
    <div className="nafile-prayers-container">
      {/* Header */}
      <div className="nafile-header">
        <button className="back-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="header-content">
          <h1>Nafile Namazlar</h1>
          <p>Sünnet ve nafile ibadetlerinizi takip edin</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="nafile-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{todayStats.completed}</span>
            <span className="stat-label">Bugün Tamamlanan</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
            <Trophy size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalCompleted}</span>
            <span className="stat-label">Toplam</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>
            <Flame size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{streak}</span>
            <span className="stat-label">Gün Serisi</span>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="date-selector">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
      </div>

      {/* Prayer List */}
      <div className="nafile-list">
        {NAFILE_PRAYERS.map((prayer) => {
          const progress = getProgress(prayer.id);
          
          return (
            <div 
              key={prayer.id}
              className={`nafile-card ${progress.completed ? 'completed' : ''}`}
            >
              <div className="nafile-header-row">
                <div 
                  className="nafile-icon"
                  style={{ backgroundColor: `${prayer.color}20`, color: prayer.color }}
                >
                  {prayer.icon}
                </div>
                
                <div className="nafile-info">
                  <h3>{prayer.nameTr}</h3>
                  <p>{prayer.description}</p>
                </div>

                <button 
                  className={`completion-btn ${progress.completed ? 'completed' : ''}`}
                  onClick={() => toggleCompletion(prayer.id)}
                >
                  {progress.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-text">
                    {progress.completed ? 'Tamamlandı!' : `${progress.current} / ${progress.max} rekat`}
                  </span>
                  <span className="progress-percentage">
                    {Math.round(progress.percentage)}%
                  </span>
                </div>

                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${progress.percentage}%`,
                      backgroundColor: progress.completed ? '#22c55e' : prayer.color
                    }}
                  />
                </div>

                {/* Rekat Controls */}
                {!progress.completed && (
                  <div className="rekat-controls">
                    <button 
                      className="rekat-btn"
                      onClick={() => adjustRekat(prayer.id, -2)}
                      disabled={progress.current <= 0}
                    >
                      <Minus size={16} />
                    </button>
                    
                    <span className="rekat-count">{progress.current}</span>
                    
                    <button 
                      className="rekat-btn"
                      onClick={() => adjustRekat(prayer.id, 2)}
                      disabled={progress.current >= progress.max}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="nafile-info-section">
        <h3>💡 Nafile Namazlar Hakkında</h3>
        <ul>
          <li>Nafile namazlar farz namazların dışında kılınan sünnet ve müstehap namazlardır.</li>
          <li>Her nafile namaz için ayrı niyet etmek gerekir.</li>
          <li>Nafile namazlar günahların affına vesile olur.</li>
          <li>Düzenli nafile namaz kılmak alışkanlık kazandırır.</li>
        </ul>
      </div>
    </div>
  );
}

export default NafilePrayers;