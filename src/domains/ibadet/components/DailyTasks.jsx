import { useState } from 'react';
import { Check, Circle, Trophy, Star, Flame, Target, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { getTodayTasks, completeTask, uncompleteTask, getStats, getTodayProgress, getEarnedBadges } from '../../../services/dailyTasksService';
import { markFirstIbadahActionCompleted } from '../../../services/activationService';

const IBADAH_TASK_CATEGORIES = new Set(['namaz', 'kuran', 'zikir']);

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
      uncompleteTask(taskId);
    } else {
      const result = completeTask(taskId);
      
      if (result.success) {
        if (IBADAH_TASK_CATEGORIES.has(task.category)) {
          markFirstIbadahActionCompleted({
            feature: 'dailyTasks',
            source: `daily_task:${task.category}`,
          });
        }

        if (result.newBadge) {
          setTimeout(() => {
            setShowBadgeModal(result.newBadge);
          }, 500);
        }
        
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
      namaz: 'var(--surface-container)',
      kuran: 'var(--accent-gold-light)',
      zikir: 'var(--accent-gold-shimmer)',
      ilim: 'var(--accent-gold)',
      iyilik: 'var(--secondary-container)'
    };
    return colors[category] || 'var(--text-secondary)';
  };

  const getCategoryName = (category) => {
    return t(`dailyTasks.categories.${category}`);
  };

  return (
    <div className="settings-container reveal-stagger pb-120">
      {/* Header */}
      <div className="flex items-center gap-16 mb-32">
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
      <div className="settings-card reveal-stagger flex flex-col items-stretch mb-24 border-none rounded-24" style={{ 
        padding: '32px 24px',
        background: 'linear-gradient(135deg, var(--nav-accent) 0%, var(--primary) 100%)',
        color: 'var(--on-primary)',
        boxShadow: '0 15px 35px rgba(var(--nav-accent-rgb, 245, 158, 11), 0.25)'
      }}>
        <div className="flex items-center gap-24 mb-32">
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
                stroke='var(--on-primary)'
                strokeWidth="3.5"
                strokeDasharray={`${progress.percentage}, 100`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
            <div className="flex-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.25rem', fontWeight: '950', color: 'var(--on-primary)' }}>
                {progress.percentage}%
            </div>
          </div>
          <div className="flex-1">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--on-primary)', fontWeight: '950' }}>{progress.completed} / {progress.total}</h3>
            <div className="flex items-center gap-6" style={{ marginTop: '4px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', fontWeight: '700' }}>
                <Star size={16} fill='var(--on-primary)' />
                +{progress.points} {t('dailyTasks.pointsToday')}
            </div>
          </div>
        </div>
        
        {stats && (
          <div className="flex justify-between" style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="flex flex-col items-center gap-4">
              <Trophy size={20} color='var(--on-primary)' />
              <span style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--on-primary)' }}>{stats.totalPoints}</span>
              <small className="uppercase" style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.8 }}>Puan</small>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Flame size={20} color='var(--on-primary)' />
              <span style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--on-primary)' }}>{stats.consecutiveDays}</span>
              <small className="uppercase" style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.8 }}>Seri</small>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Target size={20} color='var(--on-primary)' />
              <span style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--on-primary)' }}>{stats.totalTasksCompleted}</span>
              <small className="uppercase" style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.8 }}>Görev</small>
            </div>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="reveal-stagger flex flex-col gap-12">
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
              className="settings-icon-box rounded-10 shrink-0 mr-8"
              style={{ 
                  width: '32px', height: '32px', 
                  background: task.completed ? `${getCategoryColor(task.category)}20` : 'transparent',
                  border: `2px solid ${getCategoryColor(task.category)}`,
                  color: getCategoryColor(task.category)
              }}
            >
              {task.completed ? <Check size={18} strokeWidth={3} /> : <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }} />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-8 mb-4">
                <span style={{ fontSize: '1.25rem' }}>{task.icon}</span>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--nav-text)', fontWeight: '800', textDecoration: task.completed ? 'line-through' : 'none', transition: 'all 0.3s' }}>{t(task.title)}</h4>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>{t(task.description)}</p>
              <div className="flex gap-8 items-center">
                <span 
                  className="uppercase"
                  style={{ 
                      fontSize: '0.65rem', padding: '4px 10px', borderRadius: '8px', fontWeight: '900',
                      letterSpacing: '0.5px',
                      backgroundColor: `${getCategoryColor(task.category)}15`, color: getCategoryColor(task.category) 
                  }}
                >
                  {getCategoryName(task.category)}
                </span>
                <span className="flex items-center gap-4" style={{ fontSize: '0.75rem', color: 'var(--accent-gold-light)', fontWeight: '800' }}>
                  <Star size={12} fill="var(--accent-gold-light)" />
                  +{task.points}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Earned Badges Section */}
      {stats && stats.earnedBadges.length > 0 && (
        <div className="settings-card reveal-stagger mt-32 p-24 flex flex-col items-stretch">
          <h3 className="m-0 mb-20 flex items-center gap-10" style={{ fontSize: '1rem', fontWeight: '950', color: 'var(--nav-text)' }}>
              <Gift size={20} color="var(--nav-accent)" /> {t('dailyTasks.earnedBadges')}
          </h3>
          <div className="grid-2" style={{ gap: '12px' }}>
            {getEarnedBadges().map((badge) => (
              <div key={badge.id} className="settings-card flex flex-col" style={{ gap: '6px', padding: '12px 8px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)' }}>
                <span style={{ fontSize: '1.75rem' }}>{badge.emoji}</span>
                <span className="text-center" style={{ fontSize: '0.6rem', color: 'var(--nav-text-muted)', fontWeight: '800', lineHeight: '1.2' }}>{t(badge.title)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Earned Modal */}
      {showBadgeModal && (
        <div className="badge-modal-overlay" onClick={() => setShowBadgeModal(null)} style={{ backdropFilter: 'blur(10px)', zIndex: 2000 }}>
          <div className="settings-card reveal-stagger flex flex-col p-24 max-w-340 text-center rounded-24" onClick={e => e.stopPropagation()} style={{ background: 'var(--nav-bg)', border: '1px solid var(--nav-border)' }}>
            <div className="celebrate-animation mb-20" style={{ fontSize: '5rem' }}>
              {showBadgeModal.emoji}
            </div>
            <h2 className="m-0 mb-8" style={{ color: 'var(--nav-accent)', fontWeight: '950', fontSize: '1.5rem' }}>{t('dailyTasks.newBadge')}</h2>
            <h3 className="m-0 mb-12" style={{ color: 'var(--nav-text)', fontWeight: '900', fontSize: '1.25rem' }}>{t(showBadgeModal.title)}</h3>
            <p className="m-0 mb-32 leading-relaxed" style={{ color: 'var(--nav-text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>{t(showBadgeModal.requirement)}</p>
            <button className="velocity-target-btn p-16" style={{ padding: '16px 48px' }} onClick={() => setShowBadgeModal(null)}>
              {t('home.awesome')}
            </button>
          </div>
        </div>
      )}

      {/* All Complete Celebration */}
      {showAllComplete && (
        <div className="celebration-overlay" onClick={() => setShowAllComplete(false)} style={{ backdropFilter: 'blur(10px)', zIndex: 2000 }}>
          <div className="text-center reveal-stagger">
            <div className="celebrate-animation mb-20" style={{ fontSize: '6rem' }}>🎉</div>
            <h2 className="m-0 mb-8" style={{ fontSize: '2.5rem', fontWeight: '950', color: 'var(--accent-gold-light)' }}>{t('dailyTasks.congrats')}</h2>
            <p className="m-0 mb-12" style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--on-primary)' }}>{t('dailyTasks.allTasksCompleted')}</p>
            <p style={{ color: 'var(--surface-container)', fontWeight: '950', fontSize: '1.5rem' }}>{t('dailyTasks.bonusPoints', { points: 50 })}</p>
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
