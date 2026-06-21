import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ReviewModal = () => {
  const { showReviewModal, activeTask, submitReview, closeReviewModal } = useStore();
  const [interruptions, setInterruptions] = useState(0);
  const [summary, setSummary] = useState('');

  if (!showReviewModal) return null;

  const handleSubmit = () => {
    submitReview(interruptions, summary);
    setInterruptions(0);
    setSummary('');
  };

  const handleClose = () => {
    closeReviewModal();
    setInterruptions(0);
    setSummary('');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-green-600">🎉 专注完成！</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {activeTask && (
          <div className="mb-6 p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-green-600">任务</p>
            <p className="font-medium text-green-800">{activeTask.name}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              本次专注被打断了几次？
            </label>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setInterruptions(Math.max(0, interruptions - 1))}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-4xl font-bold text-gray-800 w-16 text-center">
                {interruptions}
              </span>
              <button
                onClick={() => setInterruptions(interruptions + 1)}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-3">
              {[0, 1, 2, 3, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setInterruptions(num)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    interruptions === num
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {num}次
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              学习总结（可选）
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="记录一下本次专注的收获、遇到的问题或改进方向..."
              className="textarea h-28"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 btn btn-ghost"
            >
              跳过
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 btn btn-primary"
            >
              保存记录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
