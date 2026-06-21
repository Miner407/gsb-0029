import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Area,
  Legend,
} from 'recharts';
import { Clock, CheckCircle2, Target, TrendingUp, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDuration, getDayOfWeek } from '../utils/dateUtils';
import { StatCard } from '../components/StatCard';
import { getTotalFocusTime } from '../utils/statistics';

export const Statistics = () => {
  const { sessions, tasks, getStatistics } = useStore();
  const stats = getStatistics();

  const chartData = stats.last7Days.map((day) => ({
    date: day.date.slice(5),
    星期: getDayOfWeek(day.date),
    专注分钟: day.totalFocusMinutes,
    完成番茄: day.completedPomodoros,
    完成率: Math.round(day.taskCompletionRate * 100),
  }));

  const totalFocusTime = getTotalFocusTime(sessions);
  const totalCompletedPomodoros = sessions.filter((s) => s.status === 'completed' || s.status === 'manual').length;
  const totalAbandonedPomodoros = sessions.filter((s) => s.status === 'abandoned').length;
  const completionRate = totalCompletedPomodoros + totalAbandonedPomodoros > 0
    ? Math.round((totalCompletedPomodoros / (totalCompletedPomodoros + totalAbandonedPomodoros)) * 100)
    : 0;

  const averageDailyFocus = stats.last7Days.reduce((sum, day) => sum + day.totalFocusMinutes, 0) / 7;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">数据统计</h1>
        <p className="text-gray-500">追踪你的学习进度和专注趋势</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="总专注时长"
          value={formatDuration(totalFocusTime)}
          subValue={`共 ${totalCompletedPomodoros} 个番茄`}
          color="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="番茄完成率"
          value={`${completionRate}%`}
          subValue={`放弃 ${totalAbandonedPomodoros} 个`}
          color="success"
        />
        <StatCard
          icon={Target}
          label="总任务数"
          value={tasks.length}
          subValue={`已完成 ${tasks.filter((t) => t.status === 'completed').length} 个`}
          color="secondary"
        />
        <StatCard
          icon={TrendingUp}
          label="日均专注"
          value={formatDuration(Math.round(averageDailyFocus))}
          subValue="近7天平均"
          color="warning"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-primary-500" />
            <h2 className="font-semibold text-gray-700">近7天专注时长</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="星期" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`${value} 分钟`, '专注时长']}
                />
                <Bar dataKey="专注分钟" fill="url(#colorMinutes)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-secondary-500" />
            <h2 className="font-semibold text-gray-700">近7天完成趋势</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004E89" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#004E89" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="星期" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="完成番茄"
                  stroke="#004E89"
                  strokeWidth={2}
                  fill="url(#colorArea)"
                  name="完成番茄数"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="完成率"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="任务完成率(%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">每日详情</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">日期</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">星期</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">专注时长</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">完成番茄</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">放弃番茄</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">完成任务</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">完成率</th>
              </tr>
            </thead>
            <tbody>
              {[...stats.last7Days].reverse().map((day, index) => (
                <tr 
                  key={day.date} 
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    index === 0 ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-gray-700">{day.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{getDayOfWeek(day.date)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-right font-medium">
                    {formatDuration(day.totalFocusMinutes)}
                  </td>
                  <td className="py-3 px-4 text-sm text-green-600 text-right">
                    {day.completedPomodoros}
                  </td>
                  <td className="py-3 px-4 text-sm text-red-500 text-right">
                    {day.abandonedPomodoros}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-right">
                    {day.tasksCompleted}/{day.totalTasks}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      day.taskCompletionRate >= 0.7 ? 'bg-green-100 text-green-700' :
                      day.taskCompletionRate >= 0.4 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {Math.round(day.taskCompletionRate * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
