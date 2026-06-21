import { Play, Pause, RotateCcw, X, Plus, Minus } from 'lucide-react';
import type { TimerState } from '../../types';

interface TimerControlsProps {
  timerState: TimerState;
  currentDuration: number;
  hasActiveTask: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onAbandon: () => void;
  onDurationChange: (duration: number) => void;
}

export const TimerControls = ({
  timerState,
  currentDuration,
  hasActiveTask,
  onStart,
  onPause,
  onResume,
  onAbandon,
  onDurationChange,
}: TimerControlsProps) => {
  const isIdle = timerState === 'idle';
  const isRunning = timerState === 'running';
  const isPaused = timerState === 'paused';

  const durationOptions = [15, 25, 30, 45, 60];

  return (
    <div className="space-y-6">
      {isIdle && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-2">
            {durationOptions.map((duration) => (
              <button
                key={duration}
                onClick={() => onDurationChange(duration)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentDuration === duration
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {duration}分钟
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => onDurationChange(Math.max(1, currentDuration - 5))}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              disabled={currentDuration <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-2xl font-bold text-gray-700 w-20 text-center">
              {currentDuration}分
            </span>
            <button
              onClick={() => onDurationChange(Math.min(120, currentDuration + 5))}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              disabled={currentDuration >= 120}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        {isIdle && (
          <button
            onClick={onStart}
            disabled={!hasActiveTask}
            className={`btn btn-primary btn-lg flex items-center gap-2 ${
              !hasActiveTask ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Play className="w-6 h-6" />
            开始专注
          </button>
        )}

        {isRunning && (
          <>
            <button
              onClick={onPause}
              className="btn btn-secondary btn-lg flex items-center gap-2"
            >
              <Pause className="w-6 h-6" />
              暂停
            </button>
            <button
              onClick={onAbandon}
              className="btn btn-outline btn-lg flex items-center gap-2"
            >
              <X className="w-6 h-6" />
              放弃
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={onResume}
              className="btn btn-primary btn-lg flex items-center gap-2"
            >
              <Play className="w-6 h-6" />
              继续
            </button>
            <button
              onClick={onAbandon}
              className="btn btn-outline btn-lg flex items-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              放弃
            </button>
          </>
        )}
      </div>

      {isIdle && !hasActiveTask && (
        <p className="text-center text-sm text-gray-500">
          请先从下方选择一个任务
        </p>
      )}
    </div>
  );
};
