export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTimeFull = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};

export const getTodayStr = (): string => {
  return formatDate(new Date());
};

export const getDateStr = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDate(date);
};

export const getDateStrFromBase = (baseDate: Date, daysOffset: number): string => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + daysOffset);
  return formatDate(date);
};

export const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push(getDateStr(i));
  }
  return days;
};

export const getLast30Days = (): string[] => {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    days.push(getDateStr(i));
  }
  return days;
};

export const getDayOfWeek = (dateStr: string): string => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

export const isToday = (dateStr: string): boolean => {
  return dateStr === getTodayStr();
};

export const getStartOfDay = (dateStr: string): Date => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getEndOfDay = (dateStr: string): Date => {
  const date = new Date(dateStr);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const getWeekStart = (fromDate: Date = new Date()): string => {
  const date = new Date(fromDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return formatDate(date);
};

export const getWeekEnd = (fromDate: Date = new Date()): string => {
  const date = new Date(fromDate);
  const day = date.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(23, 59, 59, 999);
  return formatDate(date);
};

export const getDaysBetween = (startDate: string, endDate: string): string[] => {
  const days: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  while (current <= end) {
    days.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export const isDateInRange = (dateStr: string, startDate: string, endDate: string): boolean => {
  const date = new Date(dateStr);
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
};

export const getRemainingDays = (endDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
