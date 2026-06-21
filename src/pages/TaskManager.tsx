import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { TagFilter } from '../components/TagFilter';
import { useStore } from '../store/useStore';
import { filterTasksByTags } from '../utils/statistics';
import type { Task } from '../types';

export const TaskManager = () => {
  const { tasks, selectedTags } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const filteredTasks = tasks
    .filter((task) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase()) && !task.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const statusOrder = { 'in-progress': 0, 'pending': 1, 'completed': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

  const displayedTasks = filterTasksByTags(filteredTasks, selectedTags);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditTask(undefined);
  };

  const statusCounts = {
    all: tasks.length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">任务管理</h1>
          <p className="text-gray-500">管理你的学习任务清单</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          新建任务
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {(['all', 'in-progress', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status === 'all' ? '全部' : status === 'in-progress' ? '进行中' : status === 'pending' ? '待开始' : '已完成'}
              <span className="ml-1 opacity-70">({statusCounts[status]})</span>
            </button>
          ))}
        </div>
      </div>

      <TagFilter />

      <div className="space-y-4">
        {displayedTasks.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">没有找到任务</h3>
            <p className="text-gray-400 mb-4">试试调整筛选条件或创建新任务</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary btn-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              创建任务
            </button>
          </div>
        ) : (
          displayedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {showForm && <TaskForm onClose={handleClose} editTask={editTask} />}
    </div>
  );
};
