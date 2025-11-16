import { Flame, Fish, Droplet, Apple } from 'lucide-react';

interface NutritionDisplayProps {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  size?: 'sm' | 'md';
  showLabels?: boolean;
}

const NutritionDisplay = ({ kcal, protein, fat, carbs, size = 'md', showLabels = false }: NutritionDisplayProps) => {
  const iconSize = size === 'sm' ? 14 : 16;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  // Ensure all values are numbers
  const numKcal = typeof kcal === 'number' ? kcal : Number(kcal) || 0;
  const numProtein = typeof protein === 'number' ? protein : Number(protein) || 0;
  const numFat = typeof fat === 'number' ? fat : Number(fat) || 0;
  const numCarbs = typeof carbs === 'number' ? carbs : Number(carbs) || 0;

  return (
    <div className={`grid grid-cols-2 gap-2 ${textSize}`}>
      <div className="flex items-center space-x-2 text-orange-600">
        <Flame size={iconSize} />
        <div className="flex items-baseline gap-1">
          {showLabels && <span className="text-gray-600">Calories</span>}
          <span className="font-medium">{Math.round(numKcal)}</span>
          <span className="text-gray-500">kcal</span>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-blue-600">
        <Fish size={iconSize} />
        <div className="flex items-baseline gap-1">
          {showLabels && <span className="text-gray-600">Protein</span>}
          <span className="font-medium">{numProtein.toFixed(1)}</span>
          <span className="text-gray-500">g</span>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-red-600">
        <Droplet size={iconSize} />
        <div className="flex items-baseline gap-1">
          {showLabels && <span className="text-gray-600">Fat</span>}
          <span className="font-medium">{numFat.toFixed(1)}</span>
          <span className="text-gray-500">g</span>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-green-600">
        <Apple size={iconSize} />
        <div className="flex items-baseline gap-1">
          {showLabels && <span className="text-gray-600">Carbs</span>}
          <span className="font-medium">{numCarbs.toFixed(1)}</span>
          <span className="text-gray-500">g</span>
        </div>
      </div>
    </div>
  );
};

export default NutritionDisplay;


