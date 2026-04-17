import { storageService } from './storageService';

const ROUTINE_KEY = 'huzur_user_routines';
const ROUTINE_HISTORY_KEY = 'huzur_routine_history';

// Varsayılan Sabit Rutin Şablonları (Boş veya Yeni Başlayanlar İçin)
const DEFAULT_ROUTINES = [
  {
    id: 'morning_routine',
    name: 'Sabah Rutini',
    timeOfDay: 'morning',
    tasks: [
      { id: 'm1', title: 'Sabah Namazı', type: 'prayer', target: 1 },
      { id: 'm2', title: 'Sabah Zikri (Adhkar)', type: 'dhikr', target: 33 },
      { id: 'm3', title: '1 Sayfa Kuran', type: 'quran', target: 1 }
    ],
    isActive: true,
    bonusXp: 50
  },
  {
    id: 'evening_routine',
    name: 'Akşam Yansımaları',
    timeOfDay: 'evening',
    tasks: [
      { id: 'e1', title: 'Akşam Namazı', type: 'prayer', target: 1 },
      { id: 'e2', title: 'Amel Defteri Doldur', type: 'deed', target: 1 },
      { id: 'e3', title: 'Günlük Tövbeler', type: 'dhikr', target: 70 }
    ],
    isActive: true,
    bonusXp: 50
  }
];

export const getRoutines = () => {
  const customRoutines = storageService.getItem(ROUTINE_KEY, null);
  if (!customRoutines) {
    storageService.setItem(ROUTINE_KEY, DEFAULT_ROUTINES);
    return DEFAULT_ROUTINES;
  }
  return customRoutines;
};

export const saveRoutines = (routines) => {
  storageService.setItem(ROUTINE_KEY, routines);
  return routines;
};

export const getRoutineProgress = () => {
  const today = new Date().toDateString();
  const history = storageService.getItem(ROUTINE_HISTORY_KEY, {});
  
  if (!history[today]) {
    history[today] = {};
  }
  
  return history[today];
};

export const completeRoutineTask = (routineId, taskId) => {
  const today = new Date().toDateString();
  const history = storageService.getItem(ROUTINE_HISTORY_KEY, {});
  
  if (!history[today]) history[today] = {};
  if (!history[today][routineId]) history[today][routineId] = { completedTasks: [], isFullyCompleted: false };
  
  if (!history[today][routineId].completedTasks.includes(taskId)) {
    history[today][routineId].completedTasks.push(taskId);
  }
  
  // Check if fully completed
  const routines = getRoutines();
  const routine = routines.find(r => r.id === routineId);
  const totalTasks = routine ? routine.tasks.length : 0;
  
  let newlyCompleted = false;
  if (routine && history[today][routineId].completedTasks.length === totalTasks && !history[today][routineId].isFullyCompleted) {
    history[today][routineId].isFullyCompleted = true;
    newlyCompleted = true;
  }
  
  storageService.setItem(ROUTINE_HISTORY_KEY, history);
  
  return {
    progress: history[today],
    isFullyCompleted: newlyCompleted,
    bonusXp: newlyCompleted ? routine.bonusXp : 0
  };
};

export const createCustomRoutine = (name, timeOfDay, tasks) => {
  const routines = getRoutines();
  const newRoutine = {
    id: `custom_${Date.now()}`,
    name,
    timeOfDay,
    tasks: tasks.map((t, index) => ({ ...t, id: `task_${Date.now()}_${index}` })),
    isActive: true,
    bonusXp: Math.max(20, tasks.length * 15) // Dynamic bonus XP
  };
  
  routines.push(newRoutine);
  saveRoutines(routines);
  return newRoutine;
};

export const deleteRoutine = (routineId) => {
  let routines = getRoutines();
  routines = routines.filter(r => r.id !== routineId);
  saveRoutines(routines);
  return routines;
};
