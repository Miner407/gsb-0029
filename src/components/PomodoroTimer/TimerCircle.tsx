import { formatTime } from '../../utils/dateUtils';

interface TimerCircleProps {
  remainingTime: number;
  totalDuration: number;
  timerState: string;
  taskName?: string;
}

export const TimerCircle = ({ remainingTime, totalDuration, timerState, taskName }: TimerCircleProps) => {
  const radius = 120;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = totalDuration > 0 ? (totalDuration - remainingTime) / totalDuration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const getStatusColor = () => {
    switch (timerState) {
      case 'running':
        return '#FF6B35';
      case 'paused':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      default:
        return '#E5E7EB';
    }
  };

  const getStatusText = () => {
    switch (timerState) {
      case 'running':
        return '专注中';
      case 'paused':
        return '已暂停';
      case 'completed':
        return '已完成';
      default:
        return '准备开始';
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#F3F4F6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={getStatusColor()}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-100 ease-linear"
        />
      </svg>
      
      <div className="absolute flex flex-col items-center justify-center">
        <div className={`text-sm font-medium mb-1 ${
          timerState === 'running' ? 'text-primary-500' :
          timerState === 'paused' ? 'text-amber-500' :
          timerState === 'completed' ? 'text-green-500' :
          'text-gray-400'
        }`}>
          {getStatusText()}
        </div>
        <div className={`text-5xl font-bold font-mono tracking-wider ${
          timerState === 'running' ? 'text-primary-600 animate-pulse-slow' :
          timerState === 'completed' ? 'text-green-600' :
          'text-gray-700'
        }`}>
          {formatTime(remainingTime)}
        </div>
        {taskName && (
          <div className="mt-3 text-sm text-gray-500 max-w-48 text-center truncate px-4">
            {taskName}
          </div>
        )}
      </div>
    </div>
  );
};
