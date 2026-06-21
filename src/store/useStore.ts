import { create } from 'zustand';
import type { Task, PomodoroSession, TimerState, AppSettings, WeeklyPlan, WeeklyPlanStatistics, AppStatistics, ImportResultData } from '../types';
import { storage, generateId, STORAGE_KEYS } from '../utils/storageUtils';
import { getTodayStatistics, getLast7DaysStatistics, getLast30DaysStatistics, getAllTimeStatistics, getOverallStatistics, calculateWeeklyPlanStatistics, getCurrentWeekPlan, validateImportData, mergeImportData } from '../utils/statistics';
import { getWeekStart, getWeekEnd } from '../utils/dateUtils';

interface AppState {
  tasks: Task[];
  sessions: PomodoroSession[];
  weeklyPlans: WeeklyPlan[];
  settings: AppSettings;
  activeTask: Task | null;
  activeWeeklyPlan: WeeklyPlan | null;
  timerState: TimerState;
  remainingTime: number;
  currentDuration: number;
  interruptions: number;
  selectedTags: string[];
  showReviewModal: boolean;
  completedSessionData: {
    taskId: string;
    weeklyPlanId?: string;
    duration: number;
    plannedDuration: number;
    startTime: string;
    endTime: string;
  } | null;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setActiveTask: (task: Task | null) => void;

  addWeeklyPlan: (plan: Omit<WeeklyPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlan>) => void;
  deleteWeeklyPlan: (id: string) => void;
  setActiveWeeklyPlan: (plan: WeeklyPlan | null) => void;
  getCurrentWeekPlan: () => WeeklyPlan | null;
  getWeeklyPlanStatistics: (planId: string) => WeeklyPlanStatistics | null;

  startTimer: (taskId: string, duration?: number, weeklyPlanId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  abandonTimer: (reason?: string) => void;
  completeTimer: () => void;
  submitReview: (interruptions: number, summary: string, reviewNote?: string) => void;
  closeReviewModal: () => void;

  addManualSession: (session: Omit<PomodoroSession, 'id' | 'createdAt'>) => void;
  updateSession: (id: string, updates: Partial<PomodoroSession>) => void;
  deleteSession: (id: string) => void;

  setSelectedTags: (tags: string[]) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;

  getStatistics: () => AppStatistics;

  exportAllData: () => { tasks: Task[]; sessions: PomodoroSession[]; settings: AppSettings; weeklyPlans: WeeklyPlan[]; exportedAt: string; version: string };
  importAllData: (data: unknown, mode?: 'merge' | 'replace') => ImportResultData;

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
  weeklyPlans: [],
  settings: defaultSettings,
  activeTask: null,
  activeWeeklyPlan: null,
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

  addWeeklyPlan: (planData) => {
    const now = new Date().toISOString();
    const newPlan: WeeklyPlan = {
      ...planData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const weeklyPlans = [...get().weeklyPlans, newPlan];
    set({ weeklyPlans });
    storage.setWeeklyPlans(weeklyPlans);
  },

  updateWeeklyPlan: (id, updates) => {
    const weeklyPlans = get().weeklyPlans.map((plan) =>
      plan.id === id
        ? { ...plan, ...updates, updatedAt: new Date().toISOString() }
        : plan
    );
    set({ weeklyPlans });
    storage.setWeeklyPlans(weeklyPlans);
  },

  deleteWeeklyPlan: (id) => {
    const weeklyPlans = get().weeklyPlans.filter((p) => p.id !== id);
    const tasks = get().tasks.map((t) =>
      t.weeklyPlanId === id ? { ...t, weeklyPlanId: undefined } : t
    );
    const sessions = get().sessions.map((s) =>
      s.weeklyPlanId === id ? { ...s, weeklyPlanId: undefined } : s
    );
    set({ weeklyPlans, tasks, sessions });
    storage.setWeeklyPlans(weeklyPlans);
    storage.setTasks(tasks);
    storage.setSessions(sessions);
  },

  setActiveWeeklyPlan: (plan) => {
    set({ activeWeeklyPlan: plan });
  },

  getCurrentWeekPlan: () => {
    return getCurrentWeekPlan(get().weeklyPlans);
  },

  getWeeklyPlanStatistics: (planId) => {
    const plan = get().weeklyPlans.find((p) => p.id === planId);
    if (!plan) return null;
    return calculateWeeklyPlanStatistics(plan, get().tasks, get().sessions);
  },

  startTimer: (taskId, duration, weeklyPlanId) => {
    const settings = get().settings;
    const actualDuration = duration || settings.defaultDuration;
    const task = get().tasks.find((t) => t.id === taskId) || null;
    const plan = weeklyPlanId
      ? get().weeklyPlans.find((p) => p.id === weeklyPlanId) || null
      : getCurrentWeekPlan(get().weeklyPlans);

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
      activeWeeklyPlan: plan,
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
        weeklyPlanId: state.activeWeeklyPlan?.id,
        duration: elapsedMinutes,
        actualDuration: elapsedMinutes,
        plannedDuration: state.currentDuration,
        interruptions: state.interruptions,
        summary: reason,
        abandonReason: reason,
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
      activeWeeklyPlan: null,
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
        weeklyPlanId: state.activeWeeklyPlan?.id,
        duration: state.currentDuration,
        plannedDuration: state.currentDuration,
        startTime: new Date(Date.now() - state.currentDuration * 60000).toISOString(),
        endTime: now,
      },
    });
  },

  submitReview: (interruptions, summary, reviewNote) => {
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
      weeklyPlanId: sessionData.weeklyPlanId,
      duration: sessionData.duration,
      actualDuration: sessionData.duration,
      plannedDuration: sessionData.plannedDuration,
      interruptions,
      summary,
      reviewNote,
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
          weeklyPlanId: task.weeklyPlanId || sessionData.weeklyPlanId,
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
      activeWeeklyPlan: null,
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
      activeWeeklyPlan: null,
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
          weeklyPlanId: task.weeklyPlanId || sessionData.weeklyPlanId,
          updatedAt: now,
        };
      }
      return task;
    });

    set({ sessions, tasks });
    storage.setSessions(sessions);
    storage.setTasks(tasks);
  },

  updateSession: (id, updates) => {
    const sessions = get().sessions.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    set({ sessions });
    storage.setSessions(sessions);
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
      last30Days: getLast30DaysStatistics(tasks, sessions),
      allTime: getAllTimeStatistics(tasks, sessions),
      overall: getOverallStatistics(tasks, sessions),
    };
  },

  exportAllData: () => {
    return storage.exportData() as ReturnType<AppState['exportAllData']>;
  },

  importAllData: (data, mode = 'merge') => {
    const validation = validateImportData(data);

    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    const obj = data as Record<string, unknown>;
    const existing = {
      tasks: get().tasks,
      sessions: get().sessions,
      weeklyPlans: get().weeklyPlans,
    };

    const importedTasks = obj.tasks as Task[];
    const importedSessions = obj.sessions as PomodoroSession[];
    const importedPlans = obj.weeklyPlans as WeeklyPlan[];

    const merged = mergeImportData(
      existing,
      {
        tasks: importedTasks,
        sessions: importedSessions,
        weeklyPlans: importedPlans,
      },
      mode
    );

    const settings = (obj.settings as AppSettings) || (mode === 'replace' ? defaultSettings : get().settings);

    set({
      tasks: merged.tasks,
      sessions: merged.sessions,
      weeklyPlans: merged.weeklyPlans,
      settings,
      activeTask: null,
      timerState: 'idle',
      remainingTime: 0,
    });

    storage.setTasks(merged.tasks);
    storage.setSessions(merged.sessions);
    storage.setWeeklyPlans(merged.weeklyPlans);
    storage.setSettings(settings);

    const tasksImported = mode === 'merge'
      ? merged.tasks.length - existing.tasks.length
      : importedTasks.length;
    const sessionsImported = mode === 'merge'
      ? merged.sessions.length - existing.sessions.length
      : importedSessions.length;
    const plansImported = mode === 'merge'
      ? merged.weeklyPlans.length - existing.weeklyPlans.length
      : importedPlans.length;

    return {
      success: true,
      errors: [],
      warnings: validation.warnings,
      tasksImported: Math.max(0, tasksImported),
      sessionsImported: Math.max(0, sessionsImported),
      plansImported: Math.max(0, plansImported),
    };
  },

  loadFromStorage: () => {
    const tasks = storage.getTasks() as Task[];
    const sessions = storage.getSessions() as PomodoroSession[];
    const weeklyPlans = storage.getWeeklyPlans() as WeeklyPlan[];
    const settings = (storage.getSettings() as AppSettings) || defaultSettings;

    set({
      tasks,
      sessions,
      weeklyPlans,
      settings,
      currentDuration: settings.defaultDuration,
    });
  },

  resetAllData: () => {
    storage.clearAll();
    set({
      tasks: [],
      sessions: [],
      weeklyPlans: [],
      settings: defaultSettings,
      activeTask: null,
      activeWeeklyPlan: null,
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
    const weeklyPlans: WeeklyPlan[] = [];

    const tags = ['学习', '工作', '阅读', '编程', '英语', '运动'];
    const taskNames = [
      '学习React Hooks',
      '阅读《深入理解计算机系统》',
      '完成项目报告',
      '背诵英语单词',
      '练习算法题',
      '复习数学公式',
    ];

    const weekPlan: WeeklyPlan = {
      id: generateId(),
      title: '本周学习计划',
      weekStartDate: getWeekStart(now),
      weekEndDate: getWeekEnd(now),
      targetFocusMinutes: 900,
      targetPomodoros: 40,
      focusTags: ['学习', '编程', '阅读'],
      description: '本周重点攻克React学习和项目进度',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    weeklyPlans.push(weekPlan);

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
        weeklyPlanId: i < 3 ? weekPlan.id : undefined,
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
          weeklyPlanId: task.weeklyPlanId,
          duration: 25,
          actualDuration: 25,
          plannedDuration: 25,
          interruptions: Math.floor(Math.random() * 3),
          summary: j === 0 ? '专注度很高，效率不错' : j === 1 ? '中间有点分心，但还是完成了' : '',
          reviewNote: j === 0 ? '掌握了核心概念' : undefined,
          status: 'completed',
          startTime: sessionDate.toISOString(),
          endTime: new Date(sessionDate.getTime() + 25 * 60 * 1000).toISOString(),
          createdAt: sessionDate.toISOString(),
        };
        sessions.push(session);
      }
    }

    set({ tasks, sessions, weeklyPlans });
    storage.setTasks(tasks);
    storage.setSessions(sessions);
    storage.setWeeklyPlans(weeklyPlans);
  },
}));

export { STORAGE_KEYS };
