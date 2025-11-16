import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import type { Recipe } from '../types';
import NutritionDisplay from './NutritionDisplay';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <Link to={`/recipes/${recipe.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {recipe.imageUrl && (
          <img
            src={`http://localhost:3001${recipe.imageUrl}`}
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {recipe.cookTimeMin} min
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {recipe.servings} servings
            </div>
          </div>

          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <NutritionDisplay
            kcal={recipe.kcalPerServing}
            protein={recipe.proteinPerServing}
            fat={recipe.fatPerServing}
            carbs={recipe.carbsPerServing}
            size="sm"
          />
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;


