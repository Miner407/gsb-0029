import type { Task, PomodoroSession, DailyStatistics, WeeklyPlan, WeeklyPlanStatistics, HistoryFilterOptions, AllTimeStatistics, OverallStatistics, TagStatistics, TopTaskStatistics } from '../types';
import { getLast7Days, getLast30Days, getTodayStr, formatDate, isDateInRange } from './dateUtils';

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

export const getLast30DaysStatistics = (tasks: Task[], sessions: PomodoroSession[]): DailyStatistics[] => {
  const days = getLast30Days();
  return days.map((day) => calculateDailyStatistics(day, tasks, sessions));
};

export const getAllTimeStatistics = (tasks: Task[], sessions: PomodoroSession[]): AllTimeStatistics => {
  const completedSessions = sessions.filter((s) => s.status === 'completed' || s.status === 'manual');
  const abandonedSessions = sessions.filter((s) => s.status === 'abandoned');

  const totalFocusMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0);
  const completedPomodoros = completedSessions.length;
  const abandonedPomodoros = abandonedSessions.length;
  const total = completedPomodoros + abandonedPomodoros;
  const avgCompletionRate = total > 0 ? completedPomodoros / total : 0;

  const tagMap = new Map<string, TagStatistics>();

  completedSessions.forEach((session) => {
    const task = tasks.find((t) => t.id === session.taskId);
    if (!task) return;
    task.tags.forEach((tag) => {
      const current = tagMap.get(tag) || { tag, minutes: 0, pomodoros: 0 };
      current.minutes += session.duration;
      current.pomodoros += 1;
      tagMap.set(tag, current);
    });
  });

  const tags = Array.from(tagMap.values()).sort((a, b) => b.minutes - a.minutes);

  return {
    totalFocusMinutes,
    completedPomodoros,
    abandonedPomodoros,
    avgCompletionRate,
    tags,
  };
};

export const getOverallStatistics = (tasks: Task[], sessions: PomodoroSession[]): OverallStatistics => {
  const taskPomMap = new Map<string, number>();

  sessions
    .filter((s) => s.status === 'completed' || s.status === 'manual')
    .forEach((s) => {
      taskPomMap.set(s.taskId, (taskPomMap.get(s.taskId) || 0) + 1);
    });

  const topTasks: TopTaskStatistics[] = Array.from(taskPomMap.entries())
    .map(([taskId, pomodoros]) => ({ taskId, pomodoros }))
    .sort((a, b) => b.pomodoros - a.pomodoros)
    .slice(0, 10);

  return { topTasks };
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

export const calculateWeeklyPlanStatistics = (
  plan: WeeklyPlan,
  tasks: Task[],
  sessions: PomodoroSession[]
): WeeklyPlanStatistics => {
  const planSessions = sessions.filter((s) => {
    const sessionDate = formatDate(new Date(s.startTime));
    return isDateInRange(sessionDate, plan.weekStartDate, plan.weekEndDate);
  });

  const completedSessions = planSessions.filter((s) => s.status === 'completed' || s.status === 'manual');
  const completedFocusMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0);
  const completedPomodoros = completedSessions.length;

  const focusRate = plan.targetFocusMinutes > 0
    ? Math.min((completedFocusMinutes / plan.targetFocusMinutes) * 100, 100)
    : 0;
  const pomodoroRate = plan.targetPomodoros > 0
    ? Math.min((completedPomodoros / plan.targetPomodoros) * 100, 100)
    : 0;

  const tagMap = new Map<string, { minutes: number; pomodoros: number }>();
  completedSessions.forEach((session) => {
    const task = tasks.find((t) => t.id === session.taskId);
    if (task) {
      task.tags.forEach((tag) => {
        const existing = tagMap.get(tag) || { minutes: 0, pomodoros: 0 };
        tagMap.set(tag, {
          minutes: existing.minutes + session.duration,
          pomodoros: existing.pomodoros + 1,
        });
      });
    }
  });

  const tagContributions = Array.from(tagMap.entries())
    .map(([tag, data]) => ({ tag, ...data }))
    .sort((a, b) => b.minutes - a.minutes);

  const unreviewedSessions = planSessions.filter((s) => {
    const task = tasks.find((t) => t.id === s.taskId);
    return task && !s.summary && !s.reviewNote;
  }).length;

  return {
    planId: plan.id,
    completedFocusMinutes,
    completedPomodoros,
    focusRate,
    pomodoroRate,
    tagContributions,
    unreviewedSessions,
  };
};

export const getCurrentWeekPlan = (plans: WeeklyPlan[]): WeeklyPlan | null => {
  const today = getTodayStr();
  return plans.find((p) =>
    isDateInRange(today, p.weekStartDate, p.weekEndDate)
  ) || null;
};

export const getSuggestedTasks = (
  tasks: Task[],
  plan: WeeklyPlan | null,
  sessions: PomodoroSession[]
): Task[] => {
  const today = getTodayStr();
  const todaySessions = sessions.filter((s) => formatDate(new Date(s.startTime)) === today);
  const todayTaskIds = new Set(todaySessions.map((s) => s.taskId));

  let candidateTasks = tasks.filter((t) => t.status !== 'completed');

  if (plan) {
    const planTasks = candidateTasks.filter((t) => {
      if (plan.focusTags.length === 0) return true;
      return plan.focusTags.some((tag) => t.tags.includes(tag));
    });
    if (planTasks.length > 0) {
      candidateTasks = planTasks;
    }
  }

  const prioritized = candidateTasks.sort((a, b) => {
    const aWorkedToday = todayTaskIds.has(a.id) ? 1 : 0;
    const bWorkedToday = todayTaskIds.has(b.id) ? 1 : 0;
    if (aWorkedToday !== bWorkedToday) return aWorkedToday - bWorkedToday;

    const aRemaining = a.estimatedPomodoros - a.completedPomodoros;
    const bRemaining = b.estimatedPomodoros - b.completedPomodoros;
    return bRemaining - aRemaining;
  });

  return prioritized.slice(0, 5);
};

export const filterSessionsByOptions = (
  sessions: PomodoroSession[],
  tasks: Task[],
  options: HistoryFilterOptions
): PomodoroSession[] => {
  return sessions.filter((session) => {
    if (options.weeklyPlanId) {
      if (session.weeklyPlanId !== options.weeklyPlanId) return false;
    }

    if (options.tags && options.tags.length > 0) {
      const task = tasks.find((t) => t.id === session.taskId);
      if (!task || !options.tags.some((tag) => task.tags.includes(tag))) {
        return false;
      }
    }

    if (options.status && options.status !== 'all') {
      if (session.status !== options.status) return false;
    }

    if (options.startDate || options.endDate) {
      const sessionDate = formatDate(new Date(session.startTime));
      if (options.startDate && sessionDate < options.startDate) return false;
      if (options.endDate && sessionDate > options.endDate) return false;
    }

    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      const task = tasks.find((t) => t.id === session.taskId);
      if (
        !task?.name.toLowerCase().includes(query) &&
        !session.summary.toLowerCase().includes(query) &&
        !session.reviewNote?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    return true;
  });
};

export const generateMarkdownReport = (
  sessions: PomodoroSession[],
  tasks: Task[],
  plans: WeeklyPlan[],
  title: string = '番茄钟专注报告'
): string => {
  const completedSessions = sessions.filter((s) => s.status === 'completed' || s.status === 'manual');
  const totalFocusMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalPomodoros = completedSessions.length;
  const abandonedPomodoros = sessions.filter((s) => s.status === 'abandoned').length;

  const taskMap = new Map<string, Task>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = formatDate(new Date(session.startTime));
    if (!acc.has(date)) acc.set(date, []);
    acc.get(date)!.push(session);
    return acc;
  }, new Map<string, PomodoroSession[]>());

  const sortedDates = Array.from(sessionsByDate.keys()).sort();

  let md = `# ${title}\n\n`;
  md += `> 生成时间：${new Date().toLocaleString('zh-CN')}\n\n`;
  md += `## 📊 总览\n\n`;
  md += `| 指标 | 数值 |\n`;
  md += `|------|------|\n`;
  md += `| 专注总时长 | ${totalFocusMinutes} 分钟 (${Math.floor(totalFocusMinutes / 60)}小时${totalFocusMinutes % 60}分钟) |\n`;
  md += `| 完成番茄数 | ${totalPomodoros} 个 |\n`;
  md += `| 放弃番茄数 | ${abandonedPomodoros} 个 |\n`;
  md += `| 总记录数 | ${sessions.length} 条 |\n\n`;

  if (plans.length > 0) {
    md += `## 📅 关联周计划\n\n`;
    plans.forEach((plan) => {
      md += `### ${plan.title}\n`;
      md += `- 周期：${plan.weekStartDate} ~ ${plan.weekEndDate}\n`;
      md += `- 目标：${plan.targetFocusMinutes}分钟 / ${plan.targetPomodoros}个番茄\n`;
      md += `- 重点标签：${plan.focusTags.join('、') || '无'}\n`;
      md += `- 说明：${plan.description || '无'}\n\n`;
    });
  }

  md += `## 📝 详细记录\n\n`;

  sortedDates.forEach((date) => {
    const daySessions = sessionsByDate.get(date)!;
    const dayCompleted = daySessions.filter((s) => s.status === 'completed' || s.status === 'manual').length;
    const dayFocus = daySessions
      .filter((s) => s.status === 'completed' || s.status === 'manual')
      .reduce((sum, s) => sum + s.duration, 0);

    md += `### ${date}\n\n`;
    md += `> 当日完成 ${dayCompleted} 个番茄，专注 ${dayFocus} 分钟\n\n`;
    md += `| 时间 | 任务 | 时长 | 状态 | 打断 | 总结 |\n`;
    md += `|------|------|------|------|------|------|\n`;

    daySessions
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .forEach((session) => {
        const task = taskMap.get(session.taskId);
        const startTime = new Date(session.startTime).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const statusMap: Record<string, string> = {
          completed: '✅ 完成',
          abandoned: '❌ 放弃',
          manual: '📝 补录',
        };
        const summary = (session.summary + (session.reviewNote ? ` | ${session.reviewNote}` : ''))
          .replace(/\|/g, '\\|')
          .replace(/\n/g, ' ') || '-';
        md += `| ${startTime} | ${task?.name || '未知任务'} | ${session.duration}分钟 | ${statusMap[session.status]} | ${session.interruptions}次 | ${summary} |\n`;
      });
    md += '\n';
  });

  md += `## 🎯 任务统计\n\n`;
  const taskStats = new Map<string, { count: number; minutes: number }>();
  completedSessions.forEach((s) => {
    const existing = taskStats.get(s.taskId) || { count: 0, minutes: 0 };
    taskStats.set(s.taskId, {
      count: existing.count + 1,
      minutes: existing.minutes + s.duration,
    });
  });

  Array.from(taskStats.entries())
    .sort((a, b) => b[1].minutes - a[1].minutes)
    .forEach(([taskId, data]) => {
      const task = taskMap.get(taskId);
      if (task) {
        md += `- **${task.name}**：${data.count} 个番茄，${data.minutes} 分钟\n`;
      }
    });

  return md;
};

export const validateImportData = (data: unknown): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['数据格式无效，必须是一个 JSON 对象'], warnings };
  }

  const obj = data as Record<string, unknown>;

  if (!obj.tasks && !obj.sessions) {
    errors.push('数据文件缺少 tasks 和 sessions 字段');
  }

  if (obj.tasks && !Array.isArray(obj.tasks)) {
    errors.push('tasks 字段必须是数组');
  }

  if (obj.sessions && !Array.isArray(obj.sessions)) {
    errors.push('sessions 字段必须是数组');
  }

  if (obj.weeklyPlans && !Array.isArray(obj.weeklyPlans)) {
    errors.push('weeklyPlans 字段必须是数组');
  }

  if (obj.tasks && Array.isArray(obj.tasks)) {
    const requiredFields = ['id', 'name', 'status', 'createdAt'];
    obj.tasks.forEach((task: Record<string, unknown>, i: number) => {
      const missing = requiredFields.filter((f) => !(f in task));
      if (missing.length > 0) {
        errors.push(`第 ${i + 1} 个任务缺少字段: ${missing.join(', ')}`);
      }
    });
  }

  if (obj.sessions && Array.isArray(obj.sessions)) {
    const requiredFields = ['id', 'taskId', 'duration', 'status', 'startTime', 'endTime'];
    obj.sessions.forEach((session: Record<string, unknown>, i: number) => {
      const missing = requiredFields.filter((f) => !(f in session));
      if (missing.length > 0) {
        errors.push(`第 ${i + 1} 条记录缺少字段: ${missing.join(', ')}`);
      }
    });
  }

  if (obj.weeklyPlans && Array.isArray(obj.weeklyPlans)) {
    const requiredFields = ['id', 'title', 'weekStartDate', 'weekEndDate', 'status'];
    obj.weeklyPlans.forEach((plan: Record<string, unknown>, i: number) => {
      const missing = requiredFields.filter((f) => !(f in plan));
      if (missing.length > 0) {
        errors.push(`第 ${i + 1} 个周计划缺少字段: ${missing.join(', ')}`);
      }
    });
  }

  if (obj.version !== '2.0' && obj.tasks && obj.sessions) {
    warnings.push('数据为旧版本格式，导入时可能会有字段不完整');
  }

  if (!obj.exportedAt) {
    warnings.push('数据缺少导出时间信息');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

export const mergeImportData = (
  existing: { tasks: Task[]; sessions: PomodoroSession[]; weeklyPlans: WeeklyPlan[] },
  imported: { tasks?: Task[]; sessions?: PomodoroSession[]; weeklyPlans?: WeeklyPlan[] },
  mode: 'merge' | 'replace' = 'merge'
): { tasks: Task[]; sessions: PomodoroSession[]; weeklyPlans: WeeklyPlan[] } => {
  if (mode === 'replace') {
    return {
      tasks: imported.tasks || [],
      sessions: imported.sessions || [],
      weeklyPlans: imported.weeklyPlans || [],
    };
  }

  const mergeById = <T extends { id: string }>(existingItems: T[], importedItems: T[] | undefined): T[] => {
    if (!importedItems || importedItems.length === 0) return existingItems;

    const idSet = new Set(existingItems.map((item) => item.id));
    const newItems = importedItems.filter((item) => !idSet.has(item.id));
    return [...existingItems, ...newItems];
  };

  return {
    tasks: mergeById(existing.tasks, imported.tasks),
    sessions: mergeById(existing.sessions, imported.sessions),
    weeklyPlans: mergeById(existing.weeklyPlans, imported.weeklyPlans),
  };
};
