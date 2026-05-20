import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sun, Moon, Plus, Check, Trash2, Play, ChevronRight, Zap
} from 'lucide-react';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { useGamification } from '../../../hooks/useGamification';
import { 
  getRoutines, getRoutineProgress, completeRoutineTask, 
  createCustomRoutine, deleteRoutine 
} from '../../../services/routineService';
import { markFirstIbadahActionCompleted } from '../../../services/activationService';
import { contributeFamilyGoalOncePerDay } from '../../../services/familyGoalContributionService';

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
    
    // Check if task already completed today
    const currentProgress = progress[routineId] || { completedTasks: [] };
    if (currentProgress.completedTasks.includes(taskId)) return; // Can't undo for now to keep it simple
    
    // Award standard XP for completing a sub-task (e.g., 5 XP)
    addPoints(5, { source: 'routine_task' });

    const routine = routines.find((item) => item.id === routineId);
    const task = routine?.tasks?.find((item) => item.id === taskId);
    if (IBADAH_ROUTINE_TASK_TYPES.has(task?.type)) {
      markFirstIbadahActionCompleted({
        feature: 'dailyTasks',
        source: `routine_task:${task.type}`,
      });
    }

    const result = completeRoutineTask(routineId, taskId);
    setProgress(result.progress);
    
    // Award bonus if routine fully completed
    if (result.isFullyCompleted) {
      addPoints(result.bonusXp, { source: 'routine_completion' });
      void contributeFamilyGoalOncePerDay(`routine_completion_${routineId}`, 'routine_completion');
    }
  }, [progress, addPoints, routines]);

  const handleAddCustomTask = () => {
    if (!newTaskInput.trim()) return;
    setNewTasks(prev => [...prev, { title: newTaskInput.trim(), type: 'custom', target: 1 }]);
    setNewTaskInput('');
  };

  const handleSaveRoutine = () => {
    if (!newRoutineName.trim() || newTasks.length === 0) return;
    const added = createCustomRoutine(newRoutineName, newRoutineTime, newTasks);
    setRoutines(prev => [...prev, added]);
    setNewRoutineName('');
    setNewTasks([]);
    setIsCreating(false);
  };

  const handleDeleteRoutine = (id) => {
    setRoutines(deleteRoutine(id));
  };

  const getPercentage = (routine) => {
    const routineProgress = progress[routine.id]?.completedTasks || [];
    if (routine.tasks.length === 0) return 0;
    return Math.round((routineProgress.length / routine.tasks.length) * 100);
  };

  const renderCreateForm = () => (
    <div className="settings-card reveal-stagger" style={{ flexDirection: 'column', padding: '24px', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: 'var(--nav-text)' }}>
        {t('routine.createNew', 'Yeni Rutin Oluştur')}
      </h3>
      
      <input 
        type="text" 
        placeholder={t('routine.namePlaceholder', 'Örn: Öğle Arası Zikirleri')}
        value={newRoutineName}
        onChange={(e) => setNewRoutineName(e.target.value)}
        style={{
          width: '100%', padding: '12px', borderRadius: '12px',
          border: '1px solid var(--nav-border)', background: 'var(--nav-bg)',
          color: 'var(--nav-text)', marginBottom: '16px'
        }}
      />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          onClick={() => setNewRoutineTime('morning')}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', background: newRoutineTime === 'morning' ? 'linear-gradient(135deg, #0f766e, #d4af37)' : 'var(--nav-hover)', color: newRoutineTime === 'morning' ? '#fff' : 'var(--nav-text)', border: 'none' }}
        >
          <Sun size={18} /> Sabah
        </button>
        <button 
          onClick={() => setNewRoutineTime('evening')}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', background: newRoutineTime === 'evening' ? 'linear-gradient(135deg, #0f766e, #d4af37)' : 'var(--nav-hover)', color: newRoutineTime === 'evening' ? '#fff' : 'var(--nav-text)', border: 'none' }}
        >
          <Moon size={18} /> Akşam
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--nav-text-muted)' }}>{t('routine.steps', 'Adımlar (Habit Stacking)')}</h4>
        {newTasks.map((t, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0', background: 'var(--nav-hover)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{idx + 1}</div>
            <span style={{ fontSize: '0.9rem', flex: 1 }}>{t.title}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input 
            type="text" 
            placeholder={t('routine.addTask', 'Yeni adım ekle...')}
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTask()}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--nav-border)', background: 'var(--nav-bg)' }}
          />
          <button onClick={handleAddCustomTask} style={{ padding: '10px', borderRadius: '8px', background: 'var(--accent-gold)', color: '#fff', border: 'none' }}>
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => setIsCreating(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--nav-border)', borderRadius: '12px', color: 'var(--nav-text)' }}>
          İptal
        </button>
        <button onClick={handleSaveRoutine} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #0f766e, #d4af37)', color: '#fff', border: 'none', borderRadius: '12px' }}>
          Kaydet
        </button>
      </div>
    </div>
  );

  const renderRoutineCard = (routine) => {
    const routineProg = progress[routine.id] || { completedTasks: [], isFullyCompleted: false };
    const pct = getPercentage(routine);

    return (
      <div key={routine.id} className="glass-card reveal-stagger" style={{ padding: '20px', marginBottom: '16px', border: routineProg.isFullyCompleted ? '1px solid #10b981' : undefined }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: routine.timeOfDay === 'morning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(79, 70, 229, 0.15)', color: routine.timeOfDay === 'morning' ? '#f59e0b' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {routine.timeOfDay === 'morning' ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <div>
              <h3 style={{ margin: '0', fontSize: '1.2rem', color: 'var(--nav-text)' }}>{routine.name}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="var(--accent-gold)" /> +{routine.bonusXp} XP {t('routine.bonus', 'Tamamlama Bonusu')}
              </div>
            </div>
          </div>
          {routine.id.startsWith('custom_') && (
            <button onClick={() => handleDeleteRoutine(routine.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '8px' }}>
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Dynamic Goal-Gradient Progress */}
        <div style={{ height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : 'var(--accent-gold)', borderRadius: '6px', transition: 'width 0.5s ease' }} />
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {routine.tasks.map((task, idx) => {
            const isDone = routineProg.completedTasks.includes(task.id);
            const isNext = !isDone && (idx === 0 || routineProg.completedTasks.includes(routine.tasks[idx - 1].id));
            
            return (
              <div 
                key={task.id} 
                onClick={() => isNext && handleTaskToggle(routine.id, task.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', 
                  padding: '12px', borderRadius: '12px',
                  background: isDone ? 'rgba(16, 185, 129, 0.1)' : 'var(--nav-bg)',
                  border: isNext ? '1px solid var(--accent-gold)' : '1px solid transparent',
                  opacity: isDone ? 0.7 : (!isNext && !isDone) ? 0.4 : 1,
                  cursor: isNext ? 'pointer' : 'default',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: isDone ? '#10b981' : isNext ? 'var(--accent-gold)' : 'var(--nav-border)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>
                  {isDone ? <Check size={16} /> : isNext ? <Play size={14} style={{ marginLeft: '2px' }} /> : <span>{idx + 1}</span>}
                </div>
                <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: isNext ? '700' : '600', color: isDone ? '#10b981' : 'var(--nav-text)', textDecoration: isDone ? 'line-through' : 'none' }}>
                  {task.title}
                </div>
                {isNext && <ChevronRight size={18} color="var(--accent-gold)" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="feature-overlay">
      <div className="feature-header blur-header">
        <IslamicBackButton onClick={onClose} label={t('routine.title', 'Günlük Rutinlerim')} />
      </div>
      
      <div className="feature-content" style={{ padding: '20px' }}>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="hover-lift"
            style={{ 
              width: '100%', padding: '16px', background: 'linear-gradient(135deg, var(--accent-gold-light), var(--accent-gold))', 
              color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1.05rem', fontWeight: '800', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Plus size={22} /> {t('routine.createBtn', 'Kendi Rutinini Oluştur')}
          </button>
        )}

        {isCreating && renderCreateForm()}

        {routines.map(renderRoutineCard)}
      </div>
    </div>
  );
};

export default RoutineBuilder;
