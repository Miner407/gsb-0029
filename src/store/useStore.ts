import { create } from 'zustand';
import type { Task, PomodoroSession, TimerState, DailyStatistics, AppSettings } from '../types';
import { storage, generateId } from '../utils/storageUtils';
import { getTodayStatistics, getLast7DaysStatistics } from '../utils/statistics';

interface AppState {
  tasks: Task[];
  sessions: PomodoroSession[];
  settings: AppSettings;
  activeTask: Task | null;
  timerState: TimerState;
  remainingTime: number;
  currentDuration: number;
  interruptions: number;
  selectedTags: string[];
  showReviewModal: boolean;
  completedSessionData: {
    taskId: string;
    duration: number;
    plannedDuration: number;
    startTime: string;
    endTime: string;
  } | null;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setActiveTask: (task: Task | null) => void;
  
  startTimer: (taskId: string, duration?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  abandonTimer: (reason?: string) => void;
  completeTimer: () => void;
  submitReview: (interruptions: number, summary: string) => void;
  closeReviewModal: () => void;
  
  addManualSession: (session: Omit<PomodoroSession, 'id' | 'createdAt'>) => void;
  deleteSession: (id: string) => void;
  
  setSelectedTags: (tags: string[]) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  getStatistics: () => {
    today: DailyStatistics;
    last7Days: DailyStatistics[];
  };

  loadFromStorage: () => void;
  resetAllData: () => void;
  generateDemoData: () => void;
}

const defaultSettings: AppSettings = {
  defaultDuration: 25,
  autoStartBreak: false,
  breakDuration: 5,
  soundEnabled: true,
};

let timerInterval: ReturnType<typeof setInterval> | null = null;
let startTime: number = 0;
let elapsedBeforePause: number = 0;

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  sessions: [],
  settings: defaultSettings,
  activeTask: null,
  timerState: 'idle',
  remainingTime: 0,
  currentDuration: 25,
  interruptions: 0,
  selectedTags: [],
  showReviewModal: false,
  completedSessionData: null,

  addTask: (taskData) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const tasks = [...get().tasks, newTask];
    set({ tasks });
    storage.setTasks(tasks);
  },

  updateTask: (id, updates) => {
    const tasks = get().tasks.map((task) =>
      task.id === id
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    );
    set({ tasks });
    storage.setTasks(tasks);
  },

  deleteTask: (id) => {
    const tasks = get().tasks.filter((task) => task.id !== id);
    const sessions = get().sessions.filter((s) => s.taskId !== id);
    set({ tasks, sessions });
    storage.setTasks(tasks);
    storage.setSessions(sessions);
  },

  setActiveTask: (task) => {
    set({ activeTask: task });
  },

  startTimer: (taskId, duration) => {
    const settings = get().settings;
    const actualDuration = duration || settings.defaultDuration;
    const task = get().tasks.find((t) => t.id === taskId) || null;
    
    if (timerInterval) clearInterval(timerInterval);
    
    startTime = Date.now();
    elapsedBeforePause = 0;
    
    timerInterval = setInterval(() => {
      const state = get();
      if (state.timerState !== 'running') return;
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000) + elapsedBeforePause;
      const remaining = Math.max(0, actualDuration * 60 - elapsed);
      
      set({ remainingTime: remaining });
      
      if (remaining <= 0) {
        get().completeTimer();
      }
    }, 100);

    set({
      activeTask: task,
      timerState: 'running',
      remainingTime: actualDuration * 60,
      currentDuration: actualDuration,
      interruptions: 0,
    });
  },

  pauseTimer: () => {
    const state = get();
    if (state.timerState !== 'running') return;
    
    if (timerInterval) clearInterval(timerInterval);
    elapsedBeforePause += Math.floor((Date.now() - startTime) / 1000);
    
    set({ timerState: 'paused' });
  },

  resumeTimer: () => {
    const state = get();
    if (state.timerState !== 'paused') return;
    
    startTime = Date.now();
    
    timerInterval = setInterval(() => {
      const currentState = get();
      if (currentState.timerState !== 'running') return;
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000) + elapsedBeforePause;
      const remaining = Math.max(0, currentState.currentDuration * 60 - elapsed);
      
      set({ remainingTime: remaining });
      
      if (remaining <= 0) {
        get().completeTimer();
      }
    }, 100);

    set({ timerState: 'running' });
  },

  abandonTimer: (reason = '') => {
    if (timerInterval) clearInterval(timerInterval);
    
    const state = get();
    const elapsedMinutes = Math.ceil((elapsedBeforePause + (state.timerState === 'running' ? (Date.now() - startTime) / 1000 : 0)) / 60);
    
    if (state.activeTask && elapsedMinutes > 0) {
      const now = new Date().toISOString();
      const session: PomodoroSession = {
        id: generateId(),
        taskId: state.activeTask.id,
        duration: elapsedMinutes,
        plannedDuration: state.currentDuration,
        interruptions: state.interruptions,
        summary: reason,
        status: 'abandoned',
        startTime: new Date(Date.now() - elapsedMinutes * 60000).toISOString(),
        endTime: now,
        createdAt: now,
      };
      
      const sessions = [...get().sessions, session];
      set({ sessions });
      storage.setSessions(sessions);
    }

    set({
      timerState: 'idle',
      remainingTime: 0,
      currentDuration: get().settings.defaultDuration,
      interruptions: 0,
      activeTask: null,
    });
  },

  completeTimer: () => {
    if (timerInterval) clearInterval(timerInterval);
    
    const state = get();
    const now = new Date().toISOString();
    
    set({
      timerState: 'completed',
      showReviewModal: true,
      completedSessionData: {
        taskId: state.activeTask?.id || '',
        duration: state.currentDuration,
        plannedDuration: state.currentDuration,
        startTime: new Date(Date.now() - state.currentDuration * 60000).toISOString(),
        endTime: now,
      },
    });
  },

  submitReview: (interruptions, summary) => {
    const state = get();
    const sessionData = state.completedSessionData;
    
    if (!sessionData || !state.activeTask) {
      set({ showReviewModal: false, completedSessionData: null });
      return;
    }

    const now = new Date().toISOString();
    const session: PomodoroSession = {
      id: generateId(),
      taskId: sessionData.taskId,
      duration: sessionData.duration,
      plannedDuration: sessionData.plannedDuration,
      interruptions,
      summary,
      status: 'completed',
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      createdAt: now,
    };

    const sessions = [...state.sessions, session];
    const tasks = state.tasks.map((task) => {
      if (task.id === state.activeTask?.id) {
        const newCompletedPomodoros = task.completedPomodoros + 1;
        return {
          ...task,
          completedPomodoros: newCompletedPomodoros,
          status: newCompletedPomodoros >= task.estimatedPomodoros && task.estimatedPomodoros > 0
            ? 'completed'
            : task.status === 'pending'
            ? 'in-progress'
            : task.status,
          updatedAt: now,
        };
      }
      return task;
    });

    set({
      sessions,
      tasks,
      showReviewModal: false,
      completedSessionData: null,
      timerState: 'idle',
      remainingTime: 0,
      activeTask: null,
    });

    storage.setSessions(sessions);
    storage.setTasks(tasks);
  },

  closeReviewModal: () => {
    set({
      showReviewModal: false,
      completedSessionData: null,
      timerState: 'idle',
      remainingTime: 0,
      activeTask: null,
    });
  },

  addManualSession: (sessionData) => {
    const now = new Date().toISOString();
    const session: PomodoroSession = {
      ...sessionData,
      id: generateId(),
      createdAt: now,
    };

    const sessions = [...get().sessions, session];
    const tasks = get().tasks.map((task) => {
      if (task.id === sessionData.taskId) {
        const newCompletedPomodoros = task.completedPomodoros + 1;
        return {
          ...task,
          completedPomodoros: newCompletedPomodoros,
          status: newCompletedPomodoros >= task.estimatedPomodoros && task.estimatedPomodoros > 0
            ? 'completed'
            : task.status === 'pending'
            ? 'in-progress'
            : task.status,
          updatedAt: now,
        };
      }
      return task;
    });

    set({ sessions, tasks });
    storage.setSessions(sessions);
    storage.setTasks(tasks);
  },

  deleteSession: (id) => {
    const sessions = get().sessions.filter((s) => s.id !== id);
    set({ sessions });
    storage.setSessions(sessions);
  },

  setSelectedTags: (tags) => {
    set({ selectedTags: tags });
  },

  updateSettings: (updates) => {
    const settings = { ...get().settings, ...updates };
    set({ settings });
    storage.setSettings(settings);
  },

  getStatistics: () => {
    const { tasks, sessions } = get();
    return {
      today: getTodayStatistics(tasks, sessions),
      last7Days: getLast7DaysStatistics(tasks, sessions),
    };
  },

  loadFromStorage: () => {
    const tasks = storage.getTasks() as Task[];
    const sessions = storage.getSessions() as PomodoroSession[];
    const settings = (storage.getSettings() as AppSettings) || defaultSettings;
    
    set({
      tasks,
      sessions,
      settings,
      currentDuration: settings.defaultDuration,
    });
  },

  resetAllData: () => {
    storage.clearAll();
    set({
      tasks: [],
      sessions: [],
      settings: defaultSettings,
      activeTask: null,
      timerState: 'idle',
      remainingTime: 0,
      currentDuration: 25,
      interruptions: 0,
      selectedTags: [],
      showReviewModal: false,
      completedSessionData: null,
    });
  },

  generateDemoData: () => {
    const now = new Date();
    const tasks: Task[] = [];
    const sessions: PomodoroSession[] = [];

    const tags = ['学习', '工作', '阅读', '编程', '英语', '运动'];
    const taskNames = [
      '学习React Hooks',
      '阅读《深入理解计算机系统》',
      '完成项目报告',
      '背诵英语单词',
      '练习算法题',
      '复习数学公式',
    ];

    for (let i = 0; i < 6; i++) {
      const createdAt = new Date(now.getTime() - (5 - i) * 24 * 60 * 60 * 1000).toISOString();
      const estimatedPomodoros = Math.floor(Math.random() * 4) + 2;
      const completedPomodoros = Math.min(estimatedPomodoros, Math.floor(Math.random() * 3) + 1);
      
      const task: Task = {
        id: generateId(),
        name: taskNames[i],
        description: `这是${taskNames[i]}的任务描述`,
        tags: [tags[i % tags.length], tags[(i + 1) % tags.length]],
        estimatedPomodoros,
        completedPomodoros,
        status: completedPomodoros >= estimatedPomodoros ? 'completed' : i < 4 ? 'in-progress' : 'pending',
        createdAt,
        updatedAt: createdAt,
      };
      tasks.push(task);

      for (let j = 0; j < completedPomodoros; j++) {
        const sessionDate = new Date(createdAt);
        sessionDate.setHours(9 + j * 2, 0, 0, 0);
        
        const session: PomodoroSession = {
          id: generateId(),
          taskId: task.id,
          duration: 25,
          plannedDuration: 25,
          interruptions: Math.floor(Math.random() * 3),
          summary: j === 0 ? '专注度很高，效率不错' : j === 1 ? '中间有点分心，但还是完成了' : '',
          status: 'completed',
          startTime: sessionDate.toISOString(),
          endTime: new Date(sessionDate.getTime() + 25 * 60 * 1000).toISOString(),
          createdAt: sessionDate.toISOString(),
        };
        sessions.push(session);
      }
    }

    set({ tasks, sessions });
    storage.setTasks(tasks);
    storage.setSessions(sessions);
  },
}));
