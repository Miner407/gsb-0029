const TASKS_KEY = 'pomodoro_tasks';
const SESSIONS_KEY = 'pomodoro_sessions';
const SETTINGS_KEY = 'pomodoro_settings';
const WEEKLY_PLANS_KEY = 'pomodoro_weekly_plans';

export const STORAGE_KEYS = {
  tasks: TASKS_KEY,
  sessions: SESSIONS_KEY,
  settings: SETTINGS_KEY,
  weeklyPlans: WEEKLY_PLANS_KEY,
} as const;

export const storage = {
  getTasks: () => {
    try {
      const data = localStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setTasks: (tasks: unknown[]) => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks:', e);
    }
  },

  getSessions: () => {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setSessions: (sessions: unknown[]) => {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  },

  getSettings: () => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSettings: (settings: unknown) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  getWeeklyPlans: () => {
    try {
      const data = localStorage.getItem(WEEKLY_PLANS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setWeeklyPlans: (plans: unknown[]) => {
    try {
      localStorage.setItem(WEEKLY_PLANS_KEY, JSON.stringify(plans));
    } catch (e) {
      console.error('Failed to save weekly plans:', e);
    }
  },

  clearAll: () => {
    localStorage.removeItem(TASKS_KEY);
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(WEEKLY_PLANS_KEY);
  },

  exportData: () => {
    return {
      tasks: storage.getTasks(),
      sessions: storage.getSessions(),
      settings: storage.getSettings(),
      weeklyPlans: storage.getWeeklyPlans(),
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };
  },

  importData: (data: { tasks: unknown[]; sessions: unknown[]; settings?: unknown; weeklyPlans?: unknown[] }) => {
    if (data.tasks) storage.setTasks(data.tasks);
    if (data.sessions) storage.setSessions(data.sessions);
    if (data.settings) storage.setSettings(data.settings);
    if (data.weeklyPlans) storage.setWeeklyPlans(data.weeklyPlans);
  },
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
