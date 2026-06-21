export interface Task {
  id: string;
  name: string;
  description: string;
  tags: string[];
  estimatedPomodoros: number;
  completedPomodoros: number;
  status: 'pending' | 'in-progress' | 'completed';
  weeklyPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  weeklyPlanId?: string;
  duration: number;
  plannedDuration: number;
  actualDuration: number;
  interruptions: number;
  summary: string;
  reviewNote?: string;
  rating?: number;
  abandonReason?: string;
  status: 'completed' | 'abandoned' | 'manual';
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface WeeklyPlan {
  id: string;
  title: string;
  weekStartDate: string;
  weekEndDate: string;
  targetFocusMinutes: number;
  targetPomodoros: number;
  focusTags: string[];
  description: string;
  unachievedReason?: string;
  status: 'active' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
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

export interface WeeklyPlanStatistics {
  planId: string;
  completedFocusMinutes: number;
  completedPomodoros: number;
  focusRate: number;
  pomodoroRate: number;
  tagContributions: { tag: string; minutes: number; pomodoros: number }[];
  unreviewedSessions: number;
}

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface AppSettings {
  defaultDuration: number;
  autoStartBreak: boolean;
  breakDuration: number;
  soundEnabled: boolean;
}

export interface HistoryFilterOptions {
  weeklyPlanId?: string;
  tags: string[];
  status: 'all' | 'completed' | 'abandoned' | 'manual';
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface TagStatistics {
  tag: string;
  minutes: number;
  pomodoros: number;
}

export interface TopTaskStatistics {
  taskId: string;
  pomodoros: number;
}

export interface OverallStatistics {
  topTasks: TopTaskStatistics[];
}

export interface AllTimeStatistics {
  totalFocusMinutes: number;
  completedPomodoros: number;
  abandonedPomodoros: number;
  avgCompletionRate: number;
  tags: TagStatistics[];
}

export interface AppStatistics {
  today: DailyStatistics;
  last7Days: DailyStatistics[];
  last30Days: DailyStatistics[];
  allTime: AllTimeStatistics;
  overall: OverallStatistics;
}

export interface ImportResultData {
  success: boolean;
  errors: string[];
  warnings: string[];
  tasksImported?: number;
  sessionsImported?: number;
  plansImported?: number;
}
