import { useState, useEffect } from 'react';
import { X, Plus, Calendar, Target, Clock, FileText } from 'lucide-react';
import type { WeeklyPlan } from '../types';
import { useStore } from '../store/useStore';
import { getWeekStart, getWeekEnd } from '../utils/dateUtils';
import { getAllTags } from '../utils/statistics';

interface WeeklyPlanFormProps {
  onClose: () => void;
  editPlan?: WeeklyPlan;
}

export const WeeklyPlanForm = ({ onClose, editPlan }: WeeklyPlanFormProps) => {
  const { addWeeklyPlan, updateWeeklyPlan, tasks, getCurrentWeekPlan, weeklyPlans } = useStore();
  const [title, setTitle] = useState('');
  const [weekStartDate, setWeekStartDate] = useState(getWeekStart());
  const [weekEndDate, setWeekEndDate] = useState(getWeekEnd());
  const [targetFocusMinutes, setTargetFocusMinutes] = useState(900);
  const [targetPomodoros, setTargetPomodoros] = useState(40);
  const [focusTags, setFocusTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState('');
  const [unachievedReason, setUnachievedReason] = useState('');
  const [status, setStatus] = useState<WeeklyPlan['status']>('active');

  const existingTags = getAllTags(tasks);

  useEffect(() => {
    if (editPlan) {
      setTitle(editPlan.title);
      setWeekStartDate(editPlan.weekStartDate);
      setWeekEndDate(editPlan.weekEndDate);
      setTargetFocusMinutes(editPlan.targetFocusMinutes);
      setTargetPomodoros(editPlan.targetPomodoros);
      setFocusTags(editPlan.focusTags);
      setDescription(editPlan.description);
      setUnachievedReason(editPlan.unachievedReason || '');
      setStatus(editPlan.status);
    } else {
      const existingCurrent = getCurrentWeekPlan();
      if (existingCurrent) {
        setWeekStartDate(existingCurrent.weekStartDate);
        setWeekEndDate(existingCurrent.weekEndDate);
      }
    }
  }, [editPlan, getCurrentWeekPlan]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !focusTags.includes(trimmed)) {
      setFocusTags([...focusTags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFocusTags(focusTags.filter((t) => t !== tag));
  };

  const handleAddExistingTag = (tag: string) => {
    if (!focusTags.includes(tag)) {
      setFocusTags([...focusTags, tag]);
    }
  };

  const handleWeekStartChange = (date: string) => {
    setWeekStartDate(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    setWeekEndDate(getWeekEnd(end));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const planData = {
      title: title.trim(),
      weekStartDate,
      weekEndDate,
      targetFocusMinutes,
      targetPomodoros,
      focusTags,
      description: description.trim(),
      unachievedReason: unachievedReason.trim() || undefined,
      status,
    };

    if (editPlan) {
      updateWeeklyPlan(editPlan.id, planData);
    } else {
      addWeeklyPlan(planData);
    }
    onClose();
  };

  const hasConflict = weeklyPlans.some(
    (p) =>
      p.id !== editPlan?.id &&
      weekStartDate <= p.weekEndDate &&
      weekEndDate >= p.weekStartDate
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content p-6 max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {editPlan ? '编辑周计划' : '创建周计划'}
              </h2>
              <p className="text-sm text-gray-500">
                {editPlan ? '修改本周学习目标' : '规划本周学习目标'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {hasConflict && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-700">
              ⚠️ 该周期间已有计划，建议避免重复创建
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              计划标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：期末复习周"
              className="input"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                周开始
              </label>
              <input
                type="date"
                value={weekStartDate}
                onChange={(e) => handleWeekStartChange(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                周结束
              </label>
              <input
                type="date"
                value={weekEndDate}
                onChange={(e) => setWeekEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                目标专注时长：{targetFocusMinutes}分钟
              </label>
              <input
                type="range"
                min="60"
                max="3000"
                step="30"
                value={targetFocusMinutes}
                onChange={(e) => setTargetFocusMinutes(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1小时</span>
                <span>50小时</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                目标番茄数：{targetPomodoros}个
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={targetPomodoros}
                onChange={(e) => setTargetPomodoros(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5个</span>
                <span>100个</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              重点标签
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), handleAddTag())
                }
                placeholder="输入标签后回车添加"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {existingTags.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">已有标签：</p>
                <div className="flex flex-wrap gap-1">
                  {existingTags
                    .filter((t) => !focusTags.includes(t))
                    .slice(0, 10)
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddExistingTag(tag)}
                        className="tag tag-default hover:bg-gray-200 text-xs"
                      >
                        + {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {focusTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {focusTags.map((tag) => (
                  <span
                    key={tag}
                    className="tag tag-primary text-xs flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              计划说明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="本周的学习重点、具体安排..."
              className="textarea h-20"
            />
          </div>

          {editPlan && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  计划状态
                </label>
                <div className="flex gap-2">
                  {(['active', 'completed', 'failed'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        status === s
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s === 'active'
                        ? '进行中'
                        : s === 'completed'
                        ? '已完成'
                        : '未达成'}
                    </button>
                  ))}
                </div>
              </div>

              {status === 'failed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    未达成原因
                  </label>
                  <textarea
                    value={unachievedReason}
                    onChange={(e) => setUnachievedReason(e.target.value)}
                    placeholder="分析未达成目标的原因..."
                    className="textarea h-20"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-ghost"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className={`flex-1 btn btn-primary ${
                !title.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {editPlan ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
