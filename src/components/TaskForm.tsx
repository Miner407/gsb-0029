import { useState, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import type { Task } from '../types';
import { useStore } from '../store/useStore';
import { getAllTags } from '../utils/statistics';

interface TaskFormProps {
  onClose: () => void;
  editTask?: Task;
}

export const TaskForm = ({ onClose, editTask }: TaskFormProps) => {
  const { addTask, updateTask, tasks } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(2);
  const [status, setStatus] = useState<Task['status']>('pending');

  const existingTags = getAllTags(tasks);

  useEffect(() => {
    if (editTask) {
      setName(editTask.name);
      setDescription(editTask.description);
      setTags(editTask.tags);
      setEstimatedPomodoros(editTask.estimatedPomodoros);
      setStatus(editTask.status);
    }
  }, [editTask]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddExistingTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const taskData = {
      name: name.trim(),
      description: description.trim(),
      tags,
      estimatedPomodoros,
      completedPomodoros: editTask?.completedPomodoros || 0,
      status,
    };

    if (editTask) {
      updateTask(editTask.id, taskData);
    } else {
      addTask(taskData);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {editTask ? '编辑任务' : '新建任务'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任务名称 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：学习React Hooks"
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简单描述一下这个任务..."
              className="textarea h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="w-4 h-4 inline mr-1" />
              标签
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
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
                    .filter((tag) => !tags.includes(tag))
                    .slice(0, 8)
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

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预估番茄数：{estimatedPomodoros} 个
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={estimatedPomodoros}
              onChange={(e) => setEstimatedPomodoros(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {editTask && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <div className="flex gap-2">
                {(['pending', 'in-progress', 'completed'] as const).map((s) => (
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
                    {s === 'pending' ? '待开始' : s === 'in-progress' ? '进行中' : '已完成'}
                  </button>
                ))}
              </div>
            </div>
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
              disabled={!name.trim()}
              className={`flex-1 btn btn-primary ${
                !name.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {editTask ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
