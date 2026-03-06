import { useState } from 'react';
import { Check, Circle, Trophy, Star, Flame, Target, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from './shared/IslamicBackButton';
import { getTodayTasks, completeTask, uncompleteTask, getStats, getTodayProgress, getEarnedBadges } from '../services/dailyTasksService';

const DailyTasks = ({ onClose }) => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState(() => getTodayTasks());
  const [stats, setStats] = useState(() => getStats());
  const [progress, setProgress] = useState(() => getTodayProgress());
  const [showBadgeModal, setShowBadgeModal] = useState(null);
  const [showAllComplete, setShowAllComplete] = useState(false);
  const [animatingTask, setAnimatingTask] = useState(null);

  const loadData = () => {
    const todayTasks = getTodayTasks();
    setTasks(todayTasks);
    setStats(getStats());
    setProgress(getTodayProgress());
  };

  const handleToggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setAnimatingTask(taskId);

    if (task.completed) {
      // Geri al
      uncompleteTask(taskId);
    } else {
      // Tamamla
      const result = completeTask(taskId);
      
      if (result.success) {
        // Yeni rozet kazanıldıysa göster
        if (result.newBadge) {
          setTimeout(() => {
            setShowBadgeModal(result.newBadge);
          }, 500);
        }
        
        // Tüm görevler tamamlandıysa kutlama
        if (result.allCompleted) {
          setTimeout(() => {
            setShowAllComplete(true);
          }, 300);
        }
      }
    }

    setTimeout(() => {
      setAnimatingTask(null);
      loadData();
    }, 300);
  };

  const getCategoryColor = (category) => {
    const colors = {
      namaz: '#22c55e',
      kuran: '#3b82f6',
      zikir: '#a855f7',
      ilim: '#f59e0b',
      iyilik: '#ec4899'
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryName = (category) => {
    return t(`dailyTasks.categories.${category}`);
  };

  return (
    <div className="settings-container reveal-stagger" style={{ paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <IslamicBackButton onClick={onClose} size="medium" />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
            {t('menu.dailyTasks')}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
            {t('home.dailyTasksSubtitle')}
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="settings-card reveal-stagger" style={{ 
        padding: '32px 24px', 
        marginBottom: '24px',
        background: 'linear-gradient(135deg, var(--nav-accent) 0%, #10b981 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '28px',
        boxShadow: '0 15px 35px rgba(79, 70, 229, 0.25)',
        flexDirection: 'column',
        alignItems: 'stretch'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
          <div style={{ position: 'relative', width: '84px', height: '84px' }}>
            <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="white"
                strokeWidth="3.5"
                strokeDasharray={`${progress.percentage}, 100`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
            <div style={{ 
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '1.25rem', fontWeight: '950', color: 'white'
            }}>
                {progress.percentage}%
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white', fontWeight: '950' }}>{progress.completed} / {progress.total}</h3>
            <div style={{ 
                marginTop: '4px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', 
                fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' 
            }}>
                <Star size={16} fill="white" />
                +{progress.points} {t('dailyTasks.pointsToday')}
            </div>
          </div>
        </div>
        
        {stats && (
          <div style={{ 
              display: 'flex', justifyContent: 'space-between', 
              paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.2)' 
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Trophy size={20} color="white" />
              <span style={{ fontSize: '1.25rem', fontWeight: '950', color: 'white' }}>{stats.totalPoints}</span>
              <small style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8 }}>Puan</small>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Flame size={20} color="white" />
              <span style={{ fontSize: '1.25rem', fontWeight: '950', color: 'white' }}>{stats.consecutiveDays}</span>
              <small style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8 }}>Seri</small>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Target size={20} color="white" />
              <span style={{ fontSize: '1.25rem', fontWeight: '950', color: 'white' }}>{stats.totalTasksCompleted}</span>
              <small style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8 }}>Görev</small>
            </div>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="reveal-stagger">
        {tasks.map((task, index) => (
          <div 
            key={task.id}
            className={`settings-card ${task.completed ? 'completed' : ''} ${animatingTask === task.id ? 'animating' : ''}`}
            onClick={() => handleToggleTask(task.id)}
            style={{ 
                padding: '16px 20px', 
                background: task.completed ? 'rgba(255,255,255,0.01)' : 'var(--nav-hover)',
                opacity: task.completed ? 0.6 : 1,
                border: task.completed ? '1px dashed var(--nav-border)' : '1px solid var(--nav-border)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '--delay': `${index * 0.05}s`
            }}
          >
            <div 
              className="settings-icon-box"
              style={{ 
                  width: '32px', height: '32px', 
                  borderRadius: '10px',
                  background: task.completed ? `${getCategoryColor(task.category)}20` : 'transparent',
                  border: `2px solid ${getCategoryColor(task.category)}`,
                  color: getCategoryColor(task.category),
                  flexShrink: 0,
                  marginRight: '16px'
              }}
            >
              {task.completed ? <Check size={18} strokeWidth={3} /> : <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }} />}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.25rem' }}>{task.icon}</span>
                <h4 style={{ 
                    margin: 0, fontSize: '1rem', color: 'var(--nav-text)', 
                    fontWeight: '800', textDecoration: task.completed ? 'line-through' : 'none',
                    transition: 'all 0.3s'
                }}>{t(task.title)}</h4>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>{t(task.description)}</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span 
                  style={{ 
                      fontSize: '0.65rem', padding: '4px 10px', borderRadius: '8px', fontWeight: '900',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      backgroundColor: `${getCategoryColor(task.category)}15`, color: getCategoryColor(task.category) 
                  }}
                >
                  {getCategoryName(task.category)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#f59e0b', fontWeight: '800' }}>
                  <Star size={12} fill="#f59e0b" />
                  +{task.points}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Earned Badges Section */}
      {stats && stats.earnedBadges.length > 0 && (
        <div className="settings-card reveal-stagger" style={{ 
            marginTop: '32px', padding: '24px', flexDirection: 'column', alignItems: 'stretch' 
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: '950', color: 'var(--nav-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Gift size={20} color="var(--nav-accent)" /> {t('dailyTasks.earnedBadges')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {getEarnedBadges().map((badge) => (
              <div key={badge.id} className="settings-card" style={{ 
                  flexDirection: 'column', gap: '6px', padding: '12px 8px', 
                  background: 'var(--nav-hover)', border: '1px solid var(--nav-border)'
              }}>
                <span style={{ fontSize: '1.75rem' }}>{badge.emoji}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--nav-text-muted)', fontWeight: '800', textAlign: 'center', lineHeight: '1.2' }}>{t(badge.title)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Earned Modal */}
      {showBadgeModal && (
        <div className="badge-modal-overlay" onClick={() => setShowBadgeModal(null)} style={{ backdropFilter: 'blur(10px)', zIndex: 2000 }}>
          <div className="settings-card reveal-stagger" onClick={e => e.stopPropagation()} style={{ 
              flexDirection: 'column', padding: '32px', maxWidth: '340px', textAlign: 'center',
              background: 'var(--nav-bg)', border: '1px solid var(--nav-border)', borderRadius: '32px'
          }}>
            <div className="celebrate-animation" style={{ fontSize: '5rem', marginBottom: '20px' }}>
              {showBadgeModal.emoji}
            </div>
            <h2 style={{ margin: '0 0 8px 0', color: 'var(--nav-accent)', fontWeight: '950', fontSize: '1.5rem' }}>{t('dailyTasks.newBadge')}</h2>
            <h3 style={{ margin: '0 0 12px 0', color: 'var(--nav-text)', fontWeight: '900', fontSize: '1.25rem' }}>{t(showBadgeModal.title)}</h3>
            <p style={{ margin: '0 0 32px 0', color: 'var(--nav-text-muted)', fontWeight: '600', fontSize: '0.9rem', lineHeight: '1.5' }}>{t(showBadgeModal.requirement)}</p>
            <button className="velocity-target-btn" onClick={() => setShowBadgeModal(null)} style={{ padding: '16px 48px' }}>
              {t('home.awesome')}
            </button>
          </div>
        </div>
      )}

      {/* All Complete Celebration */}
      {showAllComplete && (
        <div className="celebration-overlay" onClick={() => setShowAllComplete(false)} style={{ backdropFilter: 'blur(10px)', zIndex: 2000 }}>
          <div style={{ textAlign: 'center' }} className="reveal-stagger">
            <div className="celebrate-animation" style={{ fontSize: '6rem', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#f59e0b', margin: '0 0 8px 0' }}>{t('dailyTasks.congrats')}</h2>
            <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', margin: '0 0 12px 0' }}>{t('dailyTasks.allTasksCompleted')}</p>
            <p style={{ color: '#10b981', fontWeight: '950', fontSize: '1.5rem' }}>{t('dailyTasks.bonusPoints', { points: 50 })}</p>
          </div>
        </div>
      )}

      <style>{`
        .celebrate-animation {
          animation: celebrate 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(-8deg); }
          75% { transform: scale(1.1) rotate(8deg); }
        }

        .animating {
          animation: taskComplete 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes taskComplete {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .badge-modal-overlay, .celebration-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default DailyTasks;
