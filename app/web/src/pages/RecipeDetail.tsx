import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useRecipe, useDeleteRecipe } from '../api/recipes';
import NutritionDisplay from '../components/NutritionDisplay';

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: recipe, isLoading } = useRecipe(id!);
  const deleteMutation = useDeleteRecipe();

  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'steps' | 'nutrition'>('overview');

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      await deleteMutation.mutateAsync(id!);
      navigate('/');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading recipe...</div>;
  }

  if (!recipe) {
    return <div className="text-center py-12">Recipe not found</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'steps', label: 'Steps' },
    { id: 'nutrition', label: 'Nutrition' },
  ];

  return (
    <div>
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Recipes
      </Link>

      {recipe.imageUrl && (
        <img
          src={`http://localhost:3001${recipe.imageUrl}`}
          alt={recipe.title}
          className="w-full h-96 object-cover rounded-lg mb-6"
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
            <p className="text-gray-600">{recipe.description}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/recipes/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="flex gap-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <span className="font-medium">Category:</span> {recipe.category}
              </div>
              <div>
                <span className="font-medium">Cook Time:</span> {recipe.cookTimeMin} minutes
              </div>
              <div>
                <span className="font-medium">Servings:</span> {recipe.servings}
              </div>
              {recipe.tags.length > 0 && (
                <div>
                  <span className="font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm font-medium text-primary-700 bg-primary-100 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Ingredient</th>
                  <th className="text-left py-2 font-medium">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {recipe.ingredients.map((ing, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{ing.name}</td>
                    <td className="py-2">
                      {ing.quantity} {ing.unit}
                      {ing.note && <span className="text-gray-500 ml-2">({ing.note})</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'steps' && (
            <ol className="list-decimal list-inside space-y-2">
              {recipe.steps.map((step, idx) => (
                <li key={idx} className="text-gray-700">{step}</li>
              ))}
            </ol>
          )}

          {activeTab === 'nutrition' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">Per serving:</p>
              <NutritionDisplay
                kcal={recipe.kcalPerServing}
                protein={recipe.proteinPerServing}
                fat={recipe.fatPerServing}
                carbs={recipe.carbsPerServing}
                size="md"
                showLabels
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;


