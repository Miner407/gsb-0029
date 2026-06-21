import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { TimerCircle } from './TimerCircle';
import { TimerControls } from './TimerControls';
import { ReviewModal } from '../ReviewModal';

export const PomodoroTimer = () => {
  const {
    activeTask,
    timerState,
    remainingTime,
    currentDuration,
    settings,
    startTimer,
    pauseTimer,
    resumeTimer,
    abandonTimer,
    updateSettings,
  } = useStore();

  const [showAbandonReason, setShowAbandonReason] = useState(false);
  const [abandonReason, setAbandonReason] = useState('');

  useEffect(() => {
    if (settings.soundEnabled && timerState === 'completed') {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    }
  }, [timerState, settings.soundEnabled]);

  const handleStart = () => {
    if (activeTask) {
      startTimer(activeTask.id, currentDuration);
    }
  };

  const handleAbandon = () => {
    setShowAbandonReason(true);
  };

  const confirmAbandon = () => {
    abandonTimer(abandonReason);
    setShowAbandonReason(false);
    setAbandonReason('');
  };

  const handleDurationChange = (duration: number) => {
    updateSettings({ defaultDuration: duration });
  };

  return (
    <div className="card">
      <div className="flex flex-col items-center space-y-8 py-6">
        <TimerCircle
          remainingTime={remainingTime}
          totalDuration={currentDuration * 60}
          timerState={timerState}
          taskName={activeTask?.name}
        />

        <TimerControls
          timerState={timerState}
          currentDuration={currentDuration}
          hasActiveTask={!!activeTask}
          onStart={handleStart}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onStop={() => {}}
          onAbandon={handleAbandon}
          onDurationChange={handleDurationChange}
        />
      </div>

      {showAbandonReason && (
        <div className="modal-overlay" onClick={() => setShowAbandonReason(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">放弃本次专注</h3>
            <p className="text-gray-600 mb-4">请记录放弃的原因（可选）：</p>
            <textarea
              value={abandonReason}
              onChange={(e) => setAbandonReason(e.target.value)}
              placeholder="例如：被打扰、需要处理其他事情等"
              className="textarea h-24 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAbandonReason(false)}
                className="btn btn-ghost"
              >
                取消
              </button>
              <button
                onClick={confirmAbandon}
                className="btn btn-danger"
              >
                确认放弃
              </button>
            </div>
          </div>
        </div>
      )}

      <ReviewModal />
    </div>
  );
};
