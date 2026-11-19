import { useState } from 'react';
import { Check, Flame, Gift, Star, Target, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { getTodayTasks, completeTask, uncompleteTask, getStats, getTodayProgress, getEarnedBadges } from '../../../services/dailyTasksService';
import { markFirstIbadahActionCompleted } from '../../../services/activationService';
import '../../../styles/PracticePages.css';

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
    setTasks(getTodayTasks());
    setStats(getStats());
    setProgress(getTodayProgress());
  };

  const handleToggleTask = (taskId) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    setAnimatingTask(taskId);

    if (task.completed) {
      uncompleteTask(taskId);
    } else {
      const result = completeTask(taskId);
      if (result.success) {
        if (IBADAH_TASK_CATEGORIES.has(task.category)) {
          markFirstIbadahActionCompleted({ feature: 'dailyTasks', source: `daily_task:${task.category}` });
        }
        if (result.newBadge) setTimeout(() => setShowBadgeModal(result.newBadge), 500);
        if (result.allCompleted) setTimeout(() => setShowAllComplete(true), 300);
      }
    }

    setTimeout(() => {
      setAnimatingTask(null);
      loadData();
    }, 260);
  };

  const getCategoryName = (category) => t(`dailyTasks.categories.${category}`, category);

  return (
    <main className="practice-page">
      <header className="practice-header">
        <IslamicBackButton onClick={onClose} size="medium" />
        <div className="practice-header__copy">
          <h1 className="practice-title">{t('menu.dailyTasks', 'Günlük Görevler')}</h1>
          <p className="practice-subtitle">{t('home.dailyTasksSubtitle', 'Bugünün küçük adımlarını tamamlayın')}</p>
        </div>
      </header>

      <section className="practice-summary" aria-label={t('dailyTasks.summaryLabel', 'Günlük görev özeti')}>
        <div className="practice-summary__top">
          <div>
            <div className="practice-summary__value">{progress.completed} / {progress.total}</div>
            <div className="practice-summary__label">{t('dailyTasks.completedToday', 'Bugün tamamlanan görevler')}</div>
          </div>
          <strong>{progress.percentage}%</strong>
        </div>
        <div className="practice-progress"><span style={{ width: `${progress.percentage}%` }} /></div>
        {stats && (
          <div className="practice-metrics">
            <div className="practice-metric"><strong>{stats.totalPoints}</strong><span><Trophy size={11} /> {t('dailyTasks.metricPoints', 'Puan')}</span></div>
            <div className="practice-metric"><strong>{stats.consecutiveDays}</strong><span><Flame size={11} /> {t('dailyTasks.metricStreak', 'Seri')}</span></div>
            <div className="practice-metric"><strong>{stats.totalTasksCompleted}</strong><span><Target size={11} /> {t('dailyTasks.metricTasks', 'Görev')}</span></div>
          </div>
        )}
      </section>

      <section className="practice-section">
        <h2 className="practice-section-title">{t('dailyTasks.todaysTasks', { points: progress.points, defaultValue: 'Bugünün görevleri · +{{points}} puan' })}</h2>
        <div className="practice-list">
          {tasks.map((task) => (
            <button
              type="button"
              key={task.id}
              className={`practice-row ${task.completed ? 'practice-row--done' : ''} ${animatingTask === task.id ? 'practice-task-pop' : ''}`}
              onClick={() => handleToggleTask(task.id)}
              aria-pressed={task.completed}
            >
              <span className={`practice-check ${task.completed ? 'practice-check--done' : ''}`} aria-hidden="true">
                {task.completed ? <Check size={20} strokeWidth={3} /> : null}
              </span>
              <span className="practice-row__body">
                <span className="practice-row__title" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                  <span aria-hidden="true">{task.icon} </span>{t(task.title)}
                </span>
                <span className="practice-row__text">{t(task.description)}</span>
                <span className="practice-row__meta">
                  <span className="practice-pill">{getCategoryName(task.category)}</span>
                  <span className="practice-pill"><Star size={11} /> +{task.points}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {stats?.earnedBadges?.length > 0 && (
        <section className="practice-section">
          <h2 className="practice-section-title"><Gift size={14} /> {t('dailyTasks.earnedBadges', 'KAZANILAN ROZETLER')}</h2>
          <div className="practice-chip-list">
            {getEarnedBadges().map((badge) => (
              <span className="practice-chip" key={badge.id}>{badge.emoji} {t(badge.title)}</span>
            ))}
          </div>
        </section>
      )}

      {showBadgeModal && (
        <div className="practice-modal" role="dialog" aria-modal="true" onClick={() => setShowBadgeModal(null)}>
          <div className="practice-modal__card" onClick={(event) => event.stopPropagation()}>
            <div style={{ fontSize: '3rem' }}>{showBadgeModal.emoji}</div>
            <h2 className="practice-title">{t('dailyTasks.newBadge', 'Yeni Rozet')}</h2>
            <p className="practice-row__text">{t(showBadgeModal.title)} · {t(showBadgeModal.requirement)}</p>
            <button type="button" className="practice-primary-button practice-wide" onClick={() => setShowBadgeModal(null)}>{t('home.awesome', 'Harika')}</button>
          </div>
        </div>
      )}

      {showAllComplete && (
        <div className="practice-modal" role="dialog" aria-modal="true" onClick={() => setShowAllComplete(false)}>
          <div className="practice-modal__card">
            <div style={{ fontSize: '3rem' }}>🎉</div>
            <h2 className="practice-title">{t('dailyTasks.congrats', 'Tebrikler')}</h2>
            <p className="practice-row__text">{t('dailyTasks.allTasksCompleted', 'Bugünün tüm görevlerini tamamladınız.')}</p>
            <button type="button" className="practice-primary-button practice-wide" onClick={() => setShowAllComplete(false)}>{t('home.awesome', 'Harika')}</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default DailyTasks;
