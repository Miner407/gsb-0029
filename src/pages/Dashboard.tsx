import { Clock, CheckCircle2, Target, Flame } from 'lucide-react';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { TaskCard } from '../components/TaskCard';
import { StatCard } from '../components/StatCard';
import { TagFilter } from '../components/TagFilter';
import { useStore } from '../store/useStore';
import { filterTasksByTags } from '../utils/statistics';
import { formatDuration } from '../utils/dateUtils';

export const Dashboard = () => {
  const { tasks, selectedTags, setActiveTask, activeTask, timerState, getStatistics } = useStore();
  const stats = getStatistics();

  const incompleteTasks = tasks.filter((task) => task.status !== 'completed');
  const filteredTasks = filterTasksByTags(incompleteTasks, selectedTags);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">今日专注</h1>
        <p className="text-gray-500">让我们开始高效的一天吧！</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="专注时长"
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
          label="连续天数"
          value={7}
          subValue="保持专注！"
          color="warning"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PomodoroTimer />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">待办任务</h2>
              <span className="text-sm text-gray-400">
                点击选择任务
              </span>
            </div>

            {timerState === 'idle' && <TagFilter compact />}

            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide mt-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>暂无待办任务</p>
                  <p className="text-sm">去任务管理创建一个吧</p>
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
