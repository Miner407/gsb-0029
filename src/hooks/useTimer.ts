import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerState } from '../types';

interface UseTimerOptions {
  onComplete?: () => void;
  onTick?: (remainingTime: number) => void;
}

export const useTimer = (options: UseTimerOptions = {}) => {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);
  
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const hasCompletedRef = useRef(false);

  const tick = useCallback(() => {
    if (timerState !== 'running') return;

    const now = performance.now();
    const elapsed = Math.floor((now - startTimeRef.current) / 1000) + elapsedBeforePause;
    const remaining = Math.max(0, totalDuration - elapsed);

    setRemainingTime(remaining);
    options.onTick?.(remaining);

    if (remaining <= 0 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      setTimerState('completed');
      cancelAnimationFrame(animationFrameRef.current);
      options.onComplete?.();
      return;
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [timerState, totalDuration, elapsedBeforePause, options]);

  const start = useCallback((durationMinutes: number) => {
    const duration = durationMinutes * 60;
    setTotalDuration(duration);
    setRemainingTime(duration);
    setElapsedBeforePause(0);
    setTimerState('running');
    startTimeRef.current = performance.now();
    hasCompletedRef.current = false;
  }, []);

  const pause = useCallback(() => {
    if (timerState !== 'running') return;
    
    cancelAnimationFrame(animationFrameRef.current);
    const elapsed = Math.floor((performance.now() - startTimeRef.current) / 1000) + elapsedBeforePause;
    setElapsedBeforePause(elapsed);
    setTimerState('paused');
  }, [timerState, elapsedBeforePause]);

  const resume = useCallback(() => {
    if (timerState !== 'paused') return;
    
    setTimerState('running');
    startTimeRef.current = performance.now();
  }, [timerState]);

  const stop = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current);
    setTimerState('idle');
    setRemainingTime(0);
    setTotalDuration(0);
    setElapsedBeforePause(0);
    hasCompletedRef.current = false;
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current);
    setTimerState('idle');
    setRemainingTime(0);
    setElapsedBeforePause(0);
    hasCompletedRef.current = false;
  }, []);

  const getElapsedSeconds = useCallback(() => {
    if (timerState === 'running') {
      return Math.floor((performance.now() - startTimeRef.current) / 1000) + elapsedBeforePause;
    }
    return elapsedBeforePause;
  }, [timerState, elapsedBeforePause]);

  useEffect(() => {
    if (timerState === 'running') {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [timerState, tick]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return {
    timerState,
    remainingTime,
    totalDuration,
    start,
    pause,
    resume,
    stop,
    reset,
    getElapsedSeconds,
  };
};
