import { Clock, CheckCircle2, Target, Flame, Calendar, TrendingUp, Sparkles, ListTodo, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { TaskCard } from '../components/TaskCard';
import { StatCard } from '../components/StatCard';
import { TagFilter } from '../components/TagFilter';
import { WeeklyPlanCard } from '../components/WeeklyPlanCard';
import { useStore } from '../store/useStore';
import { filterTasksByTags, getSuggestedTasks } from '../utils/statistics';
import { formatDuration, getDayOfWeek, getTodayStr } from '../utils/dateUtils';

export const Dashboard = () => {
  const {
    tasks,
    selectedTags,
    activeTask,
    timerState,
    getStatistics,
    getCurrentWeekPlan,
    sessions,
  } = useStore();

  const stats = getStatistics();
  const currentPlan = getCurrentWeekPlan();

  const incompleteTasks = tasks.filter((task) => task.status !== 'completed');
  const filteredTasks = filterTasksByTags(incompleteTasks, selectedTags);
  const suggestedTasks = getSuggestedTasks(tasks, currentPlan, sessions);

  const unreviewedCount = sessions.filter(
    (s) => !s.summary && !s.reviewNote && s.status === 'completed'
  ).length;

  const greetingText = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '深夜好，注意休息！';
    if (hour < 12) return '早上好，开始高效的一天吧！';
    if (hour < 14) return '中午好，专注学习吧！';
    if (hour < 18) return '下午好，保持专注状态！';
    return '晚上好，冲刺今天的目标！';
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {greetingText()}
          </h1>
          <p className="text-gray-500 text-sm">
            {getTodayStr()} · {getDayOfWeek(getTodayStr())}
            {unreviewedCount > 0 && (
              <span className="ml-3 inline-flex items-center gap-1 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                {unreviewedCount} 条记录待复盘
                <Link to="/history" className="underline hover:text-amber-700 ml-1">
                  去处理
                </Link>
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Clock}
          label="今日专注"
          value={formatDuration(stats.today.totalFocusMinutes)}
          subValue={`${stats.today.completedPomodoros} 个番茄`}
          color="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="完成番茄"
          value={stats.today.completedPomodoros}
          subValue={`放弃 ${stats.today.abandonedPomodoros} 个`}
          color="success"
        />
        <StatCard
          icon={Target}
          label="任务完成率"
          value={`${Math.round(stats.today.taskCompletionRate * 100)}%`}
          subValue={`${stats.today.tasksCompleted}/${stats.today.totalTasks} 任务`}
          color="secondary"
        />
        <StatCard
          icon={Flame}
          label="近7天趋势"
          value={`${stats.last7Days.reduce((s, d) => s + d.completedPomodoros, 0)}`}
          subValue="累计番茄"
          color="warning"
        />
      </div>

      {currentPlan ? (
        <div className="card bg-gradient-to-br from-primary-50/60 via-white to-secondary-50/60 border-primary-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              <h2 className="font-semibold text-gray-700">本周计划进度</h2>
            </div>
            <Link
              to="/weekly"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
            >
              查看详情
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <WeeklyPlanCard plan={currentPlan} compact />
        </div>
      ) : (
        <Link
          to="/weekly"
          className="card border-dashed border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all block"
        >
          <div className="flex items-center justify-center flex-col py-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-medium text-gray-700 mb-1">还没有本周计划</h3>
            <p className="text-sm text-gray-500 mb-2">
              创建周计划，设定目标，高效推进学习
            </p>
            <span className="btn btn-primary btn-sm inline-flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              创建周计划
            </span>
          </div>
        </Link>
      )}

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <PomodoroTimer />

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary-500" />
                <h2 className="font-semibold text-gray-700">近 7 天专注趋势</h2>
              </div>
              <Link
                to="/statistics"
                className="text-sm text-secondary-600 hover:text-secondary-700 flex items-center gap-0.5"
              >
                完整统计
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {stats.last7Days.map((day) => {
                const maxMinutes = Math.max(
                  ...stats.last7Days.map((d) => d.totalFocusMinutes),
                  1
                );
                const heightPercent = Math.max(
                  10,
                  (day.totalFocusMinutes / maxMinutes) * 100
                );
                const isToday = day.date === getTodayStr();
                return (
                  <div key={day.date} className="flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end h-28 gap-1">
                      <div className="text-xs font-medium text-center text-gray-600">
                        {day.totalFocusMinutes > 0 ? day.totalFocusMinutes + 'm' : '-'}
                      </div>
                      <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isToday
                              ? 'bg-gradient-to-t from-primary-500 to-primary-400'
                              : 'bg-gradient-to-t from-secondary-400 to-secondary-300'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        isToday ? 'text-primary-600 font-bold' : 'text-gray-500'
                      }`}
                    >
                      {getDayOfWeek(day.date).replace('周', '')}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {day.completedPomodoros}🍅
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {suggestedTasks.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="font-semibold text-gray-700">今日建议</h2>
                </div>
                <span className="text-xs text-gray-400">
                  基于周计划智能推荐
                </span>
              </div>
              <div className="space-y-2">
                {suggestedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    compact
                    showActions={false}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary-500" />
                <h2 className="font-semibold text-gray-700">待办任务</h2>
              </div>
              <Link
                to="/tasks"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
              >
                管理
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {timerState === 'idle' && <TagFilter compact />}

            <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-hide mt-3 pr-1">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">暂无待办任务</p>
                  <Link
                    to="/tasks"
                    className="text-primary-500 text-sm hover:underline"
                  >
                    去创建任务
                  </Link>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    compact
                    showActions={false}
                  />
                ))
              )}
            </div>

            {activeTask && timerState === 'idle' && (
              <div className="mt-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
                <p className="text-sm text-primary-600 font-medium">
                  已选择：{activeTask.name}
                </p>
                <p className="text-xs text-primary-400 mt-1">
                  点击上方「开始专注」按钮开始计时
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
