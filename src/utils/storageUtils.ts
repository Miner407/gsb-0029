const TASKS_KEY = 'pomodoro_tasks';
const SESSIONS_KEY = 'pomodoro_sessions';
const SETTINGS_KEY = 'pomodoro_settings';

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

  clearAll: () => {
    localStorage.removeItem(TASKS_KEY);
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  },

  exportData: () => {
    return {
      tasks: storage.getTasks(),
      sessions: storage.getSessions(),
      settings: storage.getSettings(),
      exportedAt: new Date().toISOString(),
    };
  },

  importData: (data: { tasks: unknown[]; sessions: unknown[]; settings?: unknown }) => {
    if (data.tasks) storage.setTasks(data.tasks);
    if (data.sessions) storage.setSessions(data.sessions);
    if (data.settings) storage.setSettings(data.settings);
  },
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
