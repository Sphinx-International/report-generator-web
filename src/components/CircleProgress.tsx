import '../styles/CircleProgress.css';

const CircularProgress = ({ progress }: { progress: number }) => {
  // Further reduce dimensions
  const radius = 14; // Smaller radius
  const strokeWidth = 2; // Adjust stroke width for a smaller size
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="circular-progress  flex items-center justify-center" >
      <svg width={`${2.3 * radius}px`} height={`${2.3 * radius}px`}>
        <circle
          className="background"
          cx={16}
          cy={16}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress"
          cx={16}
          cy={16}
          r={radius}
          strokeWidth={strokeWidth}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-primary text-[10px]">
        {progress}%
      </span>
    </div>
  );
};

export default CircularProgress;
