import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useMealPlans } from '../api/mealPlans';

const MealPlanList = () => {
  const { data: mealPlans, isLoading } = useMealPlans();

  if (isLoading) {
    return <div className="text-center py-12">Loading meal plans...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Meal Plans</h1>
        <Link
          to="/meal-plans/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Meal Plan
        </Link>
      </div>

      {mealPlans && mealPlans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No meal plans yet</p>
          <Link
            to="/meal-plans/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Meal Plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealPlans?.map((plan: any) => (
            <Link
              key={plan.id}
              to={`/meal-plans/${plan.id}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-sm text-gray-500 mb-2">
                {new Date(plan.weekStart).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })} - {new Date(new Date(plan.weekStart).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Weekly Meal Plan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories:</span>
                  <span className="font-medium">{plan.goalsKcal.toLocaleString()} kcal/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein:</span>
                  <span className="font-medium">{Number(plan.goalsProtein).toFixed(0)} g/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Meals per day:</span>
                  <span className="font-medium">{plan.mealsPerDay}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlanList;


