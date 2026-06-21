import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Target,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  AlertTriangle,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  formatDuration,
  getDayOfWeek,
} from '../utils/dateUtils';
import { WeeklyPlanCard } from '../components/WeeklyPlanCard';
import { Link } from 'react-router-dom';

export const Statistics = () => {
  const {
    getStatistics,
    weeklyPlans,
    tasks,
    getWeeklyPlanStatistics,
    getCurrentWeekPlan,
  } = useStore();

  const stats = getStatistics();
  const currentWeekPlan = getCurrentWeekPlan();
  const currentWeekStats = currentWeekPlan
    ? getWeeklyPlanStatistics(currentWeekPlan.id)
    : null;

  const tagPieData = stats.allTime.tags.map((t) => ({
    name: t.tag,
    value: t.minutes,
  }));

  const COLORS = [
    '#6366f1',
    '#14b8a6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#84cc16',
    '#f97316',
  ];

  const pastPlans = weeklyPlans
    .filter((p) => p.id !== currentWeekPlan?.id)
    .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime())
    .slice(0, 4);

  const averageTagContribution =
    currentWeekStats && currentWeekStats.tagContributions.length > 0
      ? Math.round(
          currentWeekStats.tagContributions.reduce((s, t) => s + t.minutes, 0) /
            currentWeekStats.tagContributions.length
        )
      : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">数据统计</h1>
        <p className="text-gray-500 text-sm">全面分析你的学习专注数据</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card !p-4 flex items-center gap-3">
          <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">累计专注</p>
            <p className="text-xl font-bold text-gray-800">
              {formatDuration(stats.allTime.totalFocusMinutes)}
            </p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className="w-11 h-11 bg-success-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-success-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">完成番茄</p>
            <p className="text-xl font-bold text-gray-800">
              {stats.allTime.completedPomodoros}
            </p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className="w-11 h-11 bg-secondary-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-secondary-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">平均专注率</p>
            <p className="text-xl font-bold text-gray-800">
              {Math.round(stats.allTime.avgCompletionRate * 100)}%
            </p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className="w-11 h-11 bg-warning-100 rounded-xl flex items-center justify-center">
            <Flame className="w-5 h-5 text-warning-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">活跃标签</p>
            <p className="text-xl font-bold text-gray-800">
              {stats.allTime.tags.length}
            </p>
          </div>
        </div>
      </div>

      {currentWeekPlan && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-700">
                本周计划达成情况
              </h2>
            </div>
            <Link
              to="/weekly"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              管理周计划
            </Link>
          </div>
          <WeeklyPlanCard plan={currentWeekPlan} />

          {currentWeekStats && currentWeekStats.tagContributions.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-secondary-500" />
                各标签贡献时长（本周）
              </h3>
              <div className="grid lg:grid-cols-2 gap-6 items-center">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentWeekStats.tagContributions}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="minutes"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {currentWeekStats.tagContributions.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `${value} 分钟`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2.5">
                  {currentWeekStats.tagContributions.map((item, idx) => {
                    const maxMin = Math.max(
                      ...currentWeekStats.tagContributions.map((t) => t.minutes),
                      1
                    );
                    const pct = Math.round((item.minutes / maxMin) * 100);
                    return (
                      <div key={item.tag}>
                        <div className="flex items-center justify-between mb-1 text-sm">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: COLORS[idx % COLORS.length],
                              }}
                            />
                            <span className="font-medium text-gray-700">
                              {item.tag}
                            </span>
                          </span>
                          <span className="text-gray-500 text-xs">
                            {item.minutes} 分 · {item.pomodoros}🍅
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-gray-400 text-center pt-2">
                    平均每标签贡献 {averageTagContribution} 分钟
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentWeekPlan.status !== 'active' &&
            currentWeekPlan.unachievedReason && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  未达成原因备注
                </h3>
                <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                  {currentWeekPlan.unachievedReason}
                </p>
              </div>
            )}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <h2 className="font-semibold text-gray-700">近 30 天专注趋势</h2>
          </div>
          <span className="text-xs text-gray-400">
            累计 {stats.last30Days.reduce((s, d) => s + d.completedPomodoros, 0)} 个番茄
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.last30Days}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(value) => {
                  const d = value.slice(5);
                  return d;
                }}
                interval={3}
              />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => [`${value} 分钟`, '专注时长']}
                labelFormatter={(label) => `${label} ${getDayOfWeek(label)}`}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              />
              <Area
                type="monotone"
                dataKey="totalFocusMinutes"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorMinutes)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-secondary-500" />
              <h2 className="font-semibold text-gray-700">近 7 天番茄完成</h2>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickFormatter={(value) => getDayOfWeek(value).replace('周', '')}
                />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [`${value} 个`, '完成番茄']}
                  labelFormatter={(label) => `${label} ${getDayOfWeek(label)}`}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Bar
                  dataKey="completedPomodoros"
                  fill="#14b8a6"
                  radius={[6, 6, 0, 0]}
                  name="完成番茄"
                />
                <Bar
                  dataKey="abandonedPomodoros"
                  fill="#fecaca"
                  radius={[6, 6, 0, 0]}
                  name="放弃番茄"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-gray-700">标签分布（累计）</h2>
            </div>
          </div>
          {tagPieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              暂无数据
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tagPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {tagPieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value} 分钟`}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {pastPlans.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              <h2 className="font-semibold text-gray-700">历史周计划</h2>
            </div>
            <Link
              to="/weekly"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              查看全部
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {pastPlans.map((plan) => (
              <WeeklyPlanCard key={plan.id} plan={plan} compact />
            ))}
          </div>
        </div>
      )}

      {stats.overall.topTasks.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-success-500" />
            <h2 className="font-semibold text-gray-700">任务完成排行榜</h2>
          </div>
          <div className="space-y-3">
            {stats.overall.topTasks.map((item, idx) => {
              const task = tasks.find((t) => t.id === item.taskId);
              if (!task) return null;
              const maxPom = stats.overall.topTasks[0].pomodoros;
              return (
                <div key={item.taskId} className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-600'
                        : idx === 1
                        ? 'bg-gray-100 text-gray-600'
                        : idx === 2
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-700 truncate">
                        {task.name}
                      </p>
                      <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                        {item.pomodoros} 🍅
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                        style={{
                          width: `${Math.round((item.pomodoros / maxPom) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
