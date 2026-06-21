import { Clock, AlertCircle, CheckCircle, Trash2, User } from 'lucide-react';
import type { PomodoroSession, Task } from '../types';
import { formatDateTime, formatDuration } from '../utils/dateUtils';
import { useStore } from '../store/useStore';
import { useState } from 'react';

interface SessionCardProps {
  session: PomodoroSession;
  task?: Task;
  showActions?: boolean;
}

export const SessionCard = ({ session, task, showActions = true }: SessionCardProps) => {
  const { deleteSession } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      label: '已完成',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    abandoned: {
      icon: AlertCircle,
      label: '已放弃',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    manual: {
      icon: User,
      label: '补录',
      color: 'text-secondary-500',
      bgColor: 'bg-secondary-50',
      borderColor: 'border-secondary-200',
    },
  };

  const config = statusConfig[session.status];
  const StatusIcon = config.icon;

  const handleDelete = () => {
    deleteSession(session.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={`p-4 rounded-xl border ${config.bgColor} ${config.borderColor} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <StatusIcon className={`w-5 h-5 ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {task && (
              <h4 className="font-medium text-gray-800 truncate">
                {task.name}
              </h4>
            )}
            <span className={`tag text-xs ${config.color} bg-white/50`}>
              {config.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(session.duration)}
            </span>
            {session.interruptions > 0 && (
              <span className="text-amber-600">
                打断 {session.interruptions} 次
              </span>
            )}
            <span className="text-gray-400">
              {formatDateTime(session.startTime)}
            </span>
          </div>

          {session.summary && (
            <p className="mt-2 text-sm text-gray-600 bg-white/50 rounded-lg p-2">
              {session.summary}
            </p>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-lg hover:bg-white/50 text-gray-400 hover:text-red-500 transition-colors"
              title="删除记录"
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
              确定要删除这条番茄记录吗？
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
