interface ProgressBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
}

const ProgressBar = ({ label, current, goal, unit }: ProgressBarProps) => {
  // Ensure values are numbers
  const numCurrent = typeof current === 'number' ? current : Number(current) || 0;
  const numGoal = typeof goal === 'number' ? goal : Number(goal) || 1;
  
  const percentage = Math.min((numCurrent / numGoal) * 100, 100);
  const deviation = ((numCurrent - numGoal) / numGoal * 100).toFixed(1);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {numCurrent.toFixed(1)} / {numGoal.toFixed(1)} {unit} ({deviation}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage >= 100 ? 'bg-green-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;


