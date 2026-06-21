export interface Task {
  id: string;
  name: string;
  description: string;
  tags: string[];
  estimatedPomodoros: number;
  completedPomodoros: number;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  duration: number;
  plannedDuration: number;
  interruptions: number;
  summary: string;
  status: 'completed' | 'abandoned' | 'manual';
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface DailyStatistics {
  date: string;
  totalFocusMinutes: number;
  completedPomodoros: number;
  abandonedPomodoros: number;
  taskCompletionRate: number;
  tasksCompleted: number;
  totalTasks: number;
}

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface AppSettings {
  defaultDuration: number;
  autoStartBreak: boolean;
  breakDuration: number;
  soundEnabled: boolean;
}
