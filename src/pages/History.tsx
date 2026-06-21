import { useState } from 'react';
import { Plus, Calendar, Filter, Search, User } from 'lucide-react';
import { SessionCard } from '../components/SessionCard';
import { useStore } from '../store/useStore';
import { formatDate, getTodayStr } from '../utils/dateUtils';
import type { PomodoroSession } from '../types';

export const History = () => {
  const { sessions, tasks, addManualSession } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'abandoned' | 'manual'>('all');
  const [dateFilter, setDateFilter] = useState('');

  const [manualForm, setManualForm] = useState({
    taskId: '',
    duration: 25,
    interruptions: 0,
    summary: '',
    startTime: new Date().toISOString().slice(0, 16),
  });

  const getTaskById = (id: string) => tasks.find((t) => t.id === id);

  const filteredSessions = sessions
    .filter((session) => {
      if (statusFilter !== 'all' && session.status !== statusFilter) return false;
      if (dateFilter) {
        const sessionDate = formatDate(new Date(session.startTime));
        if (sessionDate !== dateFilter) return false;
      }
      if (searchQuery) {
        const task = getTaskById(session.taskId);
        const query = searchQuery.toLowerCase();
        if (
          !task?.name.toLowerCase().includes(query) &&
          !session.summary.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = formatDate(new Date(session.startTime));
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, PomodoroSession[]>);

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.taskId) return;

    const startTime = new Date(manualForm.startTime).toISOString();
    const endTime = new Date(new Date(manualForm.startTime).getTime() + manualForm.duration * 60000).toISOString();

    addManualSession({
      taskId: manualForm.taskId,
      duration: manualForm.duration,
      plannedDuration: manualForm.duration,
      interruptions: manualForm.interruptions,
      summary: manualForm.summary,
      status: 'manual',
      startTime,
      endTime,
    });

    setShowAddForm(false);
    setManualForm({
      taskId: '',
      duration: 25,
      interruptions: 0,
      summary: '',
      startTime: new Date().toISOString().slice(0, 16),
    });
  };

  const availableTasks = tasks.filter((t) => t.status !== 'completed');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">历史记录</h1>
          <p className="text-gray-500">查看和补录你的番茄专注记录</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-secondary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          补录记录
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索记录..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            max={getTodayStr()}
            className="input"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              清除
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {(['all', 'completed', 'abandoned', 'manual'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status === 'all' ? '全部' : status === 'completed' ? '已完成' : status === 'abandoned' ? '已放弃' : '补录'}
            </button>
          ))}
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无记录</h3>
          <p className="text-gray-400 mb-4">开始你的第一个番茄钟吧</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSessions).map(([date, daySessions]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <h3 className="font-medium text-gray-600">
                  {date}
                  {date === getTodayStr() && (
                    <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                      今天
                    </span>
                  )}
                </h3>
                <span className="text-sm text-gray-400">
                  {daySessions.length} 条记录
                </span>
              </div>
              <div className="space-y-3">
                {daySessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    task={getTaskById(session.taskId)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-secondary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">补录记录</h2>
                <p className="text-sm text-gray-500">手动添加历史专注记录</p>
              </div>
            </div>

            <form onSubmit={handleAddManual} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择任务 *
                </label>
                <select
                  value={manualForm.taskId}
                  onChange={(e) => setManualForm({ ...manualForm, taskId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">请选择任务</option>
                  {availableTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.name}
                    </option>
                  ))}
                </select>
                {availableTasks.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    暂无可选任务，请先创建任务
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    专注时长（分钟）
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={manualForm.duration}
                    onChange={(e) => setManualForm({ ...manualForm, duration: parseInt(e.target.value) || 25 })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    打断次数
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={manualForm.interruptions}
                    onChange={(e) => setManualForm({ ...manualForm, interruptions: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始时间
                </label>
                <input
                  type="datetime-local"
                  value={manualForm.startTime}
                  onChange={(e) => setManualForm({ ...manualForm, startTime: e.target.value })}
                  max={new Date().toISOString().slice(0, 16)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  学习总结
                </label>
                <textarea
                  value={manualForm.summary}
                  onChange={(e) => setManualForm({ ...manualForm, summary: e.target.value })}
                  placeholder="记录一下这次专注的收获..."
                  className="textarea h-24"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 btn btn-ghost"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!manualForm.taskId}
                  className={`flex-1 btn btn-secondary ${
                    !manualForm.taskId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  保存记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
