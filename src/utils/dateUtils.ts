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

export const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
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
