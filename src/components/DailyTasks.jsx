import { useState } from 'react';
import { ArrowLeft, Check, Circle, Trophy, Star, Flame, Target, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    <div className="daily-tasks-container">
      {/* Header */}
      <div className="daily-tasks-header">
        <button className="back-button" onClick={onClose}>
          <ArrowLeft size={24} />
        </button>
        <div className="header-content">
          <h1>{t('menu.dailyTasks')}</h1>
          <p className="subtitle">{t('home.dailyTasksSubtitle')}</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="progress-card glass-card">
        <div className="progress-info">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-progress">
              <path
                className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
              />
              <path
                className="circle-progress"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeDasharray={`${progress.percentage}, 100`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <span className="progress-percentage">{progress.percentage}%</span>
          </div>
          <div className="progress-text">
            <h3>{progress.completed} / {progress.total} {t('dailyTasks.task')}</h3>
            <p>+{progress.points} {t('dailyTasks.pointsToday')}</p>
          </div>
        </div>
        
        {stats && (
          <div className="stats-row">
            <div className="stat-item">
              <Trophy size={18} />
              <span>{stats.totalPoints}</span>
              <small>{t('dailyTasks.badges.point_100.title').replace('100 ', '')}</small>
            </div>
            <div className="stat-item">
              <Flame size={18} />
              <span>{stats.consecutiveDays}</span>
              <small>{t('dailyTasks.badges.week_streak.title').replace('Haftalık ', '')}</small>
            </div>
            <div className="stat-item">
              <Target size={18} />
              <span>{stats.totalTasksCompleted}</span>
              <small>{t('dailyTasks.task')}</small>
            </div>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="tasks-list">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className={`task-item glass-card ${task.completed ? 'completed' : ''} ${animatingTask === task.id ? 'animating' : ''}`}
            onClick={() => handleToggleTask(task.id)}
          >
            <div 
              className="task-checkbox"
              style={{ borderColor: getCategoryColor(task.category) }}
            >
              {task.completed ? (
                <Check size={18} style={{ color: getCategoryColor(task.category) }} />
              ) : (
                <Circle size={18} style={{ color: 'rgba(255,255,255,0.3)' }} />
              )}
            </div>
            
            <div className="task-content">
              <div className="task-header">
                <span className="task-icon">{task.icon}</span>
                <h4 className={task.completed ? 'line-through' : ''}>{t(task.title)}</h4>
              </div>
              <p className="task-description">{t(task.description)}</p>
              <div className="task-meta">
                <span 
                  className="category-badge"
                  style={{ backgroundColor: `${getCategoryColor(task.category)}20`, color: getCategoryColor(task.category) }}
                >
                  {getCategoryName(task.category)}
                </span>
                <span className="points-badge">
                  <Star size={12} />
                  +{task.points}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Earned Badges Section */}
      {stats && stats.earnedBadges.length > 0 && (
        <div className="badges-section glass-card">
          <h3><Gift size={18} /> {t('dailyTasks.earnedBadges')}</h3>
          <div className="badges-grid">
            {getEarnedBadges().map((badge) => (
              <div key={badge.id} className="badge-item">
                <span className="badge-emoji">{badge.emoji}</span>
                <span className="badge-title">{t(badge.title)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Earned Modal */}
      {showBadgeModal && (
        <div className="badge-modal-overlay" onClick={() => setShowBadgeModal(null)}>
          <div className="badge-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="badge-modal-icon celebrate-animation">
              {showBadgeModal.emoji}
            </div>
            <h2>{t('dailyTasks.newBadge')}</h2>
            <h3>{t(showBadgeModal.title)}</h3>
            <p>{t(showBadgeModal.requirement)}</p>
            <button className="close-modal-btn" onClick={() => setShowBadgeModal(null)}>
              {t('home.awesome')}
            </button>
          </div>
        </div>
      )}

      {/* All Complete Celebration */}
      {showAllComplete && (
        <div className="celebration-overlay" onClick={() => setShowAllComplete(false)}>
          <div className="celebration-content">
            <div className="celebration-emoji">🎉</div>
            <h2>{t('dailyTasks.congrats')}</h2>
            <p>{t('dailyTasks.allTasksCompleted')}</p>
            <p className="bonus-text">{t('dailyTasks.bonusPoints', { points: 50 })}</p>
          </div>
        </div>
      )}

      <style>{`
        .daily-tasks-container {
          min-height: 100vh;
          padding: 0 0 100px 0;
          background: var(--bg-primary);
        }

        .daily-tasks-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content h1 {
          font-size: 1.5rem;
          margin: 0;
          color: var(--text-primary);
        }

        .subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 4px 0 0 0;
        }

        .progress-card {
          margin: 0 16px 20px;
          padding: 20px;
          border-radius: 20px;
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .progress-circle {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .circular-progress {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }

        .progress-percentage {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--accent);
        }

        .progress-text h3 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .progress-text p {
          margin: 4px 0 0;
          font-size: 0.85rem;
          color: var(--accent);
        }

        .stats-row {
          display: flex;
          justify-content: space-around;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .stat-item svg {
          color: var(--accent);
        }

        .stat-item span {
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--text-primary);
        }

        .stat-item small {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .tasks-list {
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          align-items: flex-start;
        }

        .task-item:active {
          transform: scale(0.98);
        }

        .task-item.completed {
          opacity: 0.7;
        }

        .task-item.animating {
          animation: taskComplete 0.3s ease;
        }

        @keyframes taskComplete {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        .task-checkbox {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .task-item.completed .task-checkbox {
          background: rgba(255,255,255,0.1);
        }

        .task-content {
          flex: 1;
        }

        .task-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .task-icon {
          font-size: 1.2rem;
        }

        .task-header h4 {
          margin: 0;
          font-size: 1rem;
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .task-header h4.line-through {
          text-decoration: line-through;
          opacity: 0.7;
        }

        .task-description {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0 0 8px 0;
        }

        .task-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .category-badge {
          font-size: 0.7rem;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .points-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--accent);
          font-weight: 600;
        }

        .badges-section {
          margin: 24px 16px;
          padding: 20px;
          border-radius: 20px;
        }

        .badges-section h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px 0;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .badges-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .badge-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          min-width: 70px;
        }

        .badge-emoji {
          font-size: 1.5rem;
        }

        .badge-title {
          font-size: 0.65rem;
          color: var(--text-secondary);
          text-align: center;
        }

        .badge-modal-overlay,
        .celebration-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .badge-modal {
          padding: 32px;
          border-radius: 24px;
          text-align: center;
          max-width: 300px;
          animation: slideUp 0.4s ease;
        }

        .badge-modal-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .celebrate-animation {
          animation: celebrate 0.6s ease infinite;
        }

        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(-5deg); }
          75% { transform: scale(1.1) rotate(5deg); }
        }

        .badge-modal h2 {
          margin: 0;
          font-size: 1.3rem;
          color: var(--accent);
        }

        .badge-modal h3 {
          margin: 8px 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .badge-modal p {
          margin: 0 0 20px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .close-modal-btn {
          background: var(--accent);
          color: var(--bg-primary);
          border: none;
          padding: 12px 32px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .close-modal-btn:active {
          transform: scale(0.95);
        }

        .celebration-content {
          text-align: center;
          animation: slideUp 0.4s ease;
        }

        .celebration-emoji {
          font-size: 5rem;
          animation: bounce 0.6s ease infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .celebration-content h2 {
          font-size: 2rem;
          color: var(--accent);
          margin: 16px 0 8px;
        }

        .celebration-content p {
          color: var(--text-primary);
          font-size: 1.1rem;
          margin: 0;
        }

        .bonus-text {
          color: #22c55e !important;
          font-weight: bold;
          font-size: 1.3rem !important;
          margin-top: 12px !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DailyTasks;
