import type { Task, PomodoroSession, DailyStatistics } from '../types';
import { getLast7Days, getTodayStr, formatDate } from './dateUtils';

export const calculateDailyStatistics = (
  dateStr: string,
  tasks: Task[],
  sessions: PomodoroSession[]
): DailyStatistics => {
  const daySessions = sessions.filter((s) => {
    const sessionDate = formatDate(new Date(s.startTime));
    return sessionDate === dateStr;
  });

  const dayTasks = tasks.filter((t) => {
    const taskDate = formatDate(new Date(t.createdAt));
    return taskDate <= dateStr;
  });

  const completedPomodoros = daySessions.filter((s) => s.status === 'completed' || s.status === 'manual').length;
  const abandonedPomodoros = daySessions.filter((s) => s.status === 'abandoned').length;
  const totalFocusMinutes = daySessions
    .filter((s) => s.status === 'completed' || s.status === 'manual')
    .reduce((sum, s) => sum + s.duration, 0);

  const tasksCompleted = dayTasks.filter((t) => {
    if (t.status !== 'completed') return false;
    const completedDate = formatDate(new Date(t.updatedAt));
    return completedDate === dateStr;
  }).length;

  const totalTasks = dayTasks.length;
  const taskCompletionRate = totalTasks > 0 ? tasksCompleted / totalTasks : 0;

  return {
    date: dateStr,
    totalFocusMinutes,
    completedPomodoros,
    abandonedPomodoros,
    taskCompletionRate,
    tasksCompleted,
    totalTasks,
  };
};

export const getTodayStatistics = (tasks: Task[], sessions: PomodoroSession[]): DailyStatistics => {
  return calculateDailyStatistics(getTodayStr(), tasks, sessions);
};

export const getLast7DaysStatistics = (tasks: Task[], sessions: PomodoroSession[]): DailyStatistics[] => {
  const days = getLast7Days();
  return days.map((day) => calculateDailyStatistics(day, tasks, sessions));
};

export const calculateTaskProgress = (task: Task): number => {
  if (task.estimatedPomodoros === 0) return 0;
  return Math.min((task.completedPomodoros / task.estimatedPomodoros) * 100, 100);
};

export const getAllTags = (tasks: Task[]): string[] => {
  const tagSet = new Set<string>();
  tasks.forEach((task) => {
    task.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet);
};

export const filterTasksByTags = (tasks: Task[], selectedTags: string[]): Task[] => {
  if (selectedTags.length === 0) return tasks;
  return tasks.filter((task) => 
    selectedTags.some((tag) => task.tags.includes(tag))
  );
};

export const getTaskById = (tasks: Task[], taskId: string): Task | undefined => {
  return tasks.find((task) => task.id === taskId);
};

export const getSessionsByTaskId = (sessions: PomodoroSession[], taskId: string): PomodoroSession[] => {
  return sessions.filter((s) => s.taskId === taskId).sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
};

export const getTotalFocusTime = (sessions: PomodoroSession[]): number => {
  return sessions
    .filter((s) => s.status === 'completed' || s.status === 'manual')
    .reduce((sum, s) => sum + s.duration, 0);
};
