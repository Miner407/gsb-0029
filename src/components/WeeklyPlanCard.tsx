import { Calendar, Clock, Target, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import type { WeeklyPlan, WeeklyPlanStatistics } from '../types';
import { useStore } from '../store/useStore';
import { formatDuration, getRemainingDays } from '../utils/dateUtils';
import { useState } from 'react';

interface WeeklyPlanCardProps {
  plan: WeeklyPlan;
  statistics?: WeeklyPlanStatistics;
  compact?: boolean;
  onEdit?: (plan: WeeklyPlan) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

const statusConfig = {
  active: { label: '进行中', class: 'tag-warning' },
  completed: { label: '已完成', class: 'tag-success' },
  failed: { label: '未达成', class: 'tag-danger' },
};

export const WeeklyPlanCard = ({
  plan,
  statistics,
  compact = false,
  onEdit,
  onDelete,
  onClick,
}: WeeklyPlanCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { getWeeklyPlanStatistics } = useStore();

  const stats =
    statistics ||
    getWeeklyPlanStatistics(plan.id) || {
      completedFocusMinutes: 0,
      completedPomodoros: 0,
      focusRate: 0,
      pomodoroRate: 0,
      tagContributions: [],
      unreviewedSessions: 0,
    };

  const remainingDays = getRemainingDays(plan.weekEndDate);
  const overallRate = Math.round((stats.focusRate + stats.pomodoroRate) / 2);

  if (compact) {
    return (
      <div
        className={`card ${onClick ? 'cursor-pointer card-hover' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-800 line-clamp-1">
                {plan.title}
              </h3>
              <span className={`tag tag-sm ${statusConfig[plan.status].class}`}>
                {statusConfig[plan.status].label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {plan.weekStartDate.slice(5)} ~ {plan.weekEndDate.slice(5)}
              </span>
              {plan.status === 'active' && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  剩余 {remainingDays} 天
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>专注时长</span>
              <span className="text-gray-700 font-medium">
                {formatDuration(stats.completedFocusMinutes)} /{' '}
                {formatDuration(plan.targetFocusMinutes)}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.focusRate}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>番茄数</span>
              <span className="text-gray-700 font-medium">
                {stats.completedPomodoros} / {plan.targetPomodoros} 个
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.pomodoroRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-primary-600 font-medium">
              <TrendingUp className="w-4 h-4" />
              综合达成率 {overallRate}%
            </div>
            {plan.focusTags.length > 0 && (
              <div className="flex gap-1">
                {plan.focusTags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag tag-secondary text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{plan.title}</h3>
            <span className={`tag tag-sm ${statusConfig[plan.status].class}`}>
              {statusConfig[plan.status].label}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {plan.weekStartDate} ~ {plan.weekEndDate}
            </span>
            {plan.status === 'active' && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                剩余 {remainingDays} 天
              </span>
            )}
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(plan)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-primary-500"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-xl hover:bg-red-50 transition-colors text-gray-500 hover:text-red-500"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {plan.description && (
        <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-xl">
          {plan.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-primary-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-gray-600">专注时长</span>
          </div>
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {formatDuration(stats.completedFocusMinutes)}
          </div>
          <div className="text-xs text-gray-500">
            目标 {formatDuration(plan.targetFocusMinutes)}
          </div>
          <div className="progress-bar mt-2">
            <div className="progress-fill" style={{ width: `${stats.focusRate}%` }} />
          </div>
        </div>

        <div className="p-4 bg-secondary-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-secondary-500" />
            <span className="text-sm font-medium text-gray-600">番茄数</span>
          </div>
          <div className="text-2xl font-bold text-secondary-600 mb-2">
            {stats.completedPomodoros}
          </div>
          <div className="text-xs text-gray-500">目标 {plan.targetPomodoros} 个</div>
          <div className="progress-bar mt-2">
            <div
              className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full"
              style={{ width: `${stats.pomodoroRate}%` }}
            />
          </div>
        </div>
      </div>

      {plan.focusTags.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">重点标签</p>
          <div className="flex flex-wrap gap-1">
            {plan.focusTags.map((tag) => (
              <span key={tag} className="tag tag-primary text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {plan.status === 'failed' && plan.unachievedReason && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
          <p className="text-xs font-medium text-red-600 mb-1">未达成原因</p>
          <p className="text-sm text-red-700">{plan.unachievedReason}</p>
        </div>
      )}

      {stats.tagContributions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">标签贡献</p>
          <div className="space-y-2">
            {stats.tagContributions.slice(0, 3).map((item) => {
              const maxMinutes = Math.max(
                ...stats.tagContributions.map((t) => t.minutes),
                1
              );
              const percentage = Math.round((item.minutes / maxMinutes) * 100);
              return (
                <div key={item.tag}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{item.tag}</span>
                    <span>
                      {formatDuration(item.minutes)} · {item.pomodoros}个番茄
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-success to-warning rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="modal-content p-6 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">确认删除</h3>
            <p className="text-gray-600 mb-4">
              确定要删除周计划「{plan.title}」吗？删除不会影响已完成的番茄记录，但会解除关联。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-ghost"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onDelete?.(plan.id);
                  setShowDeleteConfirm(false);
                }}
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
