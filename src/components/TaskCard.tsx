import { Check, Edit2, Trash2, Play, Clock, Tag } from 'lucide-react';
import type { Task } from '../types';
import { calculateTaskProgress } from '../utils/statistics';
import { useStore } from '../store/useStore';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  showActions?: boolean;
  onEdit?: (task: Task) => void;
  compact?: boolean;
}

const tagColors = [
  'tag-primary',
  'tag-secondary',
  'tag-success',
  'tag-warning',
  'tag-danger',
];

const getTagColor = (index: number) => tagColors[index % tagColors.length];

export const TaskCard = ({ task, showActions = true, onEdit, compact = false }: TaskCardProps) => {
  const { activeTask, setActiveTask, updateTask, deleteTask, timerState, startTimer } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const progress = calculateTaskProgress(task);
  const isActive = activeTask?.id === task.id;
  const canStart = timerState === 'idle';

  const handleQuickStart = () => {
    if (canStart) {
      setActiveTask(task);
    }
  };

  const handleStartTimer = () => {
    startTimer(task.id);
  };

  const handleToggleComplete = () => {
    updateTask(task.id, {
      status: task.status === 'completed' ? 'pending' : 'completed',
    });
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setShowDeleteConfirm(false);
  };

  const statusConfig = {
    'pending': { label: '待开始', class: 'tag-default' },
    'in-progress': { label: '进行中', class: 'tag-warning' },
    'completed': { label: '已完成', class: 'tag-success' },
  };

  if (compact) {
    return (
      <div
        onClick={handleQuickStart}
        className={`p-3 rounded-xl cursor-pointer transition-all ${
          isActive
            ? 'bg-primary-50 border-2 border-primary-300'
            : 'bg-white border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50'
        } ${!canStart ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            task.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {task.status === 'completed' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${
              task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'
            }`}>
              {task.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">
                {task.completedPomodoros}/{task.estimatedPomodoros} 番茄
              </span>
              {task.tags.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Tag className="w-3 h-3" />
                  {task.tags[0]}
                </span>
              )}
            </div>
          </div>
          {isActive && (
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`card card-hover ${isActive ? 'ring-2 ring-primary-300' : ''}`}>
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggleComplete}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            task.status === 'completed'
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          {task.status === 'completed' && (
            <Check className="w-4 h-4 text-white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold ${
              task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'
            }`}>
              {task.name}
            </h3>
            <span className={`tag tag-sm ${statusConfig[task.status].class}`}>
              {statusConfig[task.status].label}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-gray-500 mb-2">{task.description}</p>
          )}

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {task.tags.map((tag, index) => (
                <span key={tag} className={`tag tag-sm ${getTagColor(index)}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {task.completedPomodoros} / {task.estimatedPomodoros} 番茄 · {Math.round(progress)}%
              </p>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            {canStart && task.status !== 'completed' && (
              <button
                onClick={handleStartTimer}
                className="p-2 rounded-xl bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
                title="开始专注"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl hover:bg-red-50 transition-colors text-gray-500 hover:text-red-500"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content p-6 max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">确认删除</h3>
            <p className="text-gray-600 mb-4">
              确定要删除任务「{task.name}」吗？相关的番茄记录也会被删除。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-ghost"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
