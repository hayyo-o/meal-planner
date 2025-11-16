import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useRecipes, useTags, useCategories } from '../api/recipes';
import RecipeCard from '../components/RecipeCard';
import RecipeFilters from '../components/RecipeFilters';

const RecipeList = () => {
  const [filters, setFilters] = useState<any>({
    query: '',
    tags: '',
    categories: '',
    minKcal: '',
    maxKcal: '',
    minProtein: '',
    maxProtein: '',
    minFat: '',
    maxFat: '',
    minCarbs: '',
    maxCarbs: '',
    page: 1,
    limit: 50,
  });

  const { data, isLoading, error } = useRecipes(filters);
  const { data: availableTags } = useTags();
  const { data: availableCategories } = useCategories();

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value, page: 1 }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading recipes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Error loading recipes</div>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      <aside className="w-64 flex-shrink-0">
        <RecipeFilters
          filters={filters}
          availableTags={availableTags || []}
          availableCategories={availableCategories || []}
          onFilterChange={handleFilterChange}
        />
      </aside>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
          <Link
            to="/recipes/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Recipe
          </Link>
        </div>

        {data?.recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No recipes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.recipes.map((recipe: any) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeList;


