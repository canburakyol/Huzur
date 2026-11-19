import { useCallback, useState } from 'react';
import { Check, ChevronRight, LockKeyhole, Moon, Play, Plus, Sun, Trash2, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { useGamification } from '../../../hooks/useGamification';
import { getRoutines, getRoutineProgress, completeRoutineTask, createCustomRoutine, deleteRoutine } from '../../../services/routineService';
import { markFirstIbadahActionCompleted } from '../../../services/activationService';
import { contributeFamilyGoalOncePerDay } from '../../../services/familyGoalContributionService';
import '../../../styles/PracticePages.css';

const IBADAH_ROUTINE_TASK_TYPES = new Set(['prayer', 'quran', 'dhikr']);

const RoutineBuilder = ({ onClose }) => {
  const { t } = useTranslation();
  const { addPoints } = useGamification();
  const [routines, setRoutines] = useState(() => getRoutines());
  const [progress, setProgress] = useState(() => getRoutineProgress());
  const [isCreating, setIsCreating] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineTime, setNewRoutineTime] = useState('morning');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTasks, setNewTasks] = useState([]);

  const handleTaskToggle = useCallback((routineId, taskId) => {
    const currentProgress = progress[routineId] || { completedTasks: [] };
    if (currentProgress.completedTasks.includes(taskId)) return;
    addPoints(5, { source: 'routine_task' });
    const routine = routines.find((item) => item.id === routineId);
    const task = routine?.tasks?.find((item) => item.id === taskId);
    if (IBADAH_ROUTINE_TASK_TYPES.has(task?.type)) {
      markFirstIbadahActionCompleted({ feature: 'dailyTasks', source: `routine_task:${task.type}` });
    }
    const result = completeRoutineTask(routineId, taskId);
    setProgress(result.progress);
    if (result.isFullyCompleted) {
      addPoints(result.bonusXp, { source: 'routine_completion' });
      void contributeFamilyGoalOncePerDay(`routine_completion_${routineId}`, 'routine_completion');
    }
  }, [addPoints, progress, routines]);

  const addCustomTask = () => {
    if (!newTaskInput.trim()) return;
    setNewTasks((previous) => [...previous, { title: newTaskInput.trim(), type: 'custom', target: 1 }]);
    setNewTaskInput('');
  };

  const saveRoutine = () => {
    if (!newRoutineName.trim() || newTasks.length === 0) return;
    const added = createCustomRoutine(newRoutineName.trim(), newRoutineTime, newTasks);
    setRoutines((previous) => [...previous, added]);
    setNewRoutineName('');
    setNewTasks([]);
    setIsCreating(false);
  };

  const percentage = (routine) => {
    const completed = progress[routine.id]?.completedTasks || [];
    return routine.tasks.length ? Math.round((completed.length / routine.tasks.length) * 100) : 0;
  };

  return (
    <main className="practice-page">
      <header className="practice-header">
        <IslamicBackButton onClick={onClose} size="medium" />
        <div className="practice-header__copy">
          <h1 className="practice-title">{t('routine.title', 'Günlük Rutinlerim')}</h1>
          <p className="practice-subtitle">{t('routine.subtitle', 'Adımları sırayla tamamlayarak düzeninizi koruyun.')}</p>
        </div>
      </header>

      {!isCreating && (
        <button type="button" className="practice-primary-button practice-wide" onClick={() => setIsCreating(true)}>
          <Plus size={18} /> {t('routine.createBtn', 'Kendi Rutinini Oluştur')}
        </button>
      )}

      {isCreating && (
        <section className="practice-panel" aria-label={t('routine.newRoutineForm', 'Yeni rutin formu')}>
          <h2 className="practice-section-title">{t('routine.newRoutine', 'Yeni rutin')}</h2>
          <input className="practice-field" value={newRoutineName} onChange={(event) => setNewRoutineName(event.target.value)} placeholder={t('routine.namePlaceholder', 'Örn: Öğle arası zikirleri')} />
          <div className="practice-segments" style={{ marginTop: 10, gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <button type="button" className={`practice-segment ${newRoutineTime === 'morning' ? 'practice-segment--active' : ''}`} onClick={() => setNewRoutineTime('morning')}><Sun size={16} /> {t('routine.morning', 'Sabah')}</button>
            <button type="button" className={`practice-segment ${newRoutineTime === 'evening' ? 'practice-segment--active' : ''}`} onClick={() => setNewRoutineTime('evening')}><Moon size={16} /> {t('routine.evening', 'Akşam')}</button>
          </div>
          {newTasks.length > 0 && (
            <div className="practice-list" style={{ marginBottom: 10 }}>
              {newTasks.map((task, index) => (
                <div className="practice-row" key={`${task.title}-${index}`}>
                  <span className="practice-row__icon">{index + 1}</span>
                  <span className="practice-row__title">{task.title}</span>
                </div>
              ))}
            </div>
          )}
          <div className="practice-form-row">
            <input className="practice-field" value={newTaskInput} onChange={(event) => setNewTaskInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addCustomTask()} placeholder={t('routine.addTask', 'Yeni adım ekle...')} />
            <button type="button" className="practice-icon-button" aria-label={t('routine.addStep', 'Adımı ekle')} onClick={addCustomTask}><Plus size={19} /></button>
          </div>
          <div className="practice-actions">
            <button type="button" className="practice-secondary-button" onClick={() => setIsCreating(false)}>{t('common.cancel', 'İptal')}</button>
            <button type="button" className="practice-primary-button" disabled={!newRoutineName.trim() || newTasks.length === 0} onClick={saveRoutine}>{t('common.save', 'Kaydet')}</button>
          </div>
        </section>
      )}

      <div className="practice-list" style={{ marginTop: 16 }}>
        {routines.map((routine) => {
          const routineProgress = progress[routine.id] || { completedTasks: [], isFullyCompleted: false };
          const pct = percentage(routine);
          return (
            <section className="practice-panel" style={{ marginTop: 0 }} key={routine.id}>
              <div className="practice-summary__top">
                <div style={{ display: 'flex', gap: 10, minWidth: 0, alignItems: 'center' }}>
                  <span className="practice-row__icon">{routine.timeOfDay === 'morning' ? <Sun size={18} /> : <Moon size={18} />}</span>
                  <div style={{ minWidth: 0 }}>
                    <h2 className="practice-row__title">{t(`routine.defaults.${routine.id}`, routine.name)}</h2>
                    <p className="practice-row__text"><Zap size={12} /> +{routine.bonusXp} XP tamamlama bonusu</p>
                  </div>
                </div>
                {routine.id.startsWith('custom_') && (
                  <button type="button" className="practice-icon-button" aria-label={t('routine.deleteLabel', { name: t(`routine.defaults.${routine.id}`, routine.name), defaultValue: '{{name}} rutinini sil' })} onClick={() => setRoutines(deleteRoutine(routine.id))}><Trash2 size={17} /></button>
                )}
              </div>
              <div className="practice-progress"><span style={{ width: `${pct}%` }} /></div>
              <div className="practice-list" style={{ marginTop: 12 }}>
                {routine.tasks.map((task, index) => {
                  const isDone = routineProgress.completedTasks.includes(task.id);
                  const isNext = !isDone && (index === 0 || routineProgress.completedTasks.includes(routine.tasks[index - 1].id));
                  return (
                    <button
                      type="button"
                      className={`practice-row ${isDone ? 'practice-row--done' : ''}`}
                      key={task.id}
                      disabled={!isNext}
                      onClick={() => isNext && handleTaskToggle(routine.id, task.id)}
                      style={{ opacity: 1 }}
                    >
                      <span className={`practice-check ${isDone ? 'practice-check--done' : ''}`} aria-hidden="true">
                        {isDone ? <Check size={18} /> : isNext ? <Play size={16} /> : <LockKeyhole size={15} />}
                      </span>
                      <span className="practice-row__body">
                        <span className="practice-row__title" style={{ textDecoration: isDone ? 'line-through' : 'none' }}>{t(`routine.defaultTasks.${task.id}`, task.title)}</span>
                        {!isDone && !isNext && <span className="practice-row__text">{t('routine.completePrevious', 'Önceki adımı tamamlayın')}</span>}
                      </span>
                      {isNext && <ChevronRight size={18} />}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
};

export default RoutineBuilder;
