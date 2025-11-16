import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMealPlan, useGenerateMealPlan, useDeleteMealPlan, useDeleteMealEntry, useShoppingList } from '../api/mealPlans';
import { useRecipes } from '../api/recipes';
import { ArrowLeft, Trash2, Download } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';

const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2', 'snack3'];

const MealPlanView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: mealPlan, isLoading } = useMealPlan(id!);
  const { data: allRecipes } = useRecipes({ limit: 1000 });
  const { data: shoppingList } = useShoppingList(id!);
  const generateMutation = useGenerateMealPlan();
  const deleteMealPlanMutation = useDeleteMealPlan();
  const deleteEntryMutation = useDeleteMealEntry();

  const handleGenerate = async () => {
    await generateMutation.mutateAsync(id!);
  };

  const handleDeletePlan = async () => {
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      await deleteMealPlanMutation.mutateAsync(id!);
      navigate('/meal-plans');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    await deleteEntryMutation.mutateAsync({ mealPlanId: id!, entryId });
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading meal plan...</div>;
  }

  if (!mealPlan) {
    return <div className="text-center py-12">Meal plan not found</div>;
  }

  // Calculate weekly totals
  const weeklyTotals = mealPlan.entries.reduce((acc, entry) => {
    if (entry.recipe) {
      const servings = Number(entry.servingsCount);
      return {
        kcal: acc.kcal + entry.recipe.kcalPerServing * servings,
        protein: acc.protein + Number(entry.recipe.proteinPerServing) * servings,
        fat: acc.fat + Number(entry.recipe.fatPerServing) * servings,
        carbs: acc.carbs + Number(entry.recipe.carbsPerServing) * servings,
      };
    }
    return acc;
  }, { kcal: 0, protein: 0, fat: 0, carbs: 0 });

  const weekStart = new Date(mealPlan.weekStart);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    days.push(date);
  }

  // Group entries by day
  const entriesByDay = new Map<string, typeof mealPlan.entries>();
  mealPlan.entries.forEach(entry => {
    const dayKey = new Date(entry.date).toISOString().split('T')[0];
    if (!entriesByDay.has(dayKey)) {
      entriesByDay.set(dayKey, []);
    }
    entriesByDay.get(dayKey)!.push(entry);
  });

  return (
    <div>
      <Link to="/meal-plans" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Meal Plans
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Meal Plan</h1>
            <p className="text-gray-600">
              {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {' '}
              {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Menu'}
            </button>
            <button
              onClick={handleDeletePlan}
              className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 inline mr-1" />
              Delete
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Progress</h2>
          <ProgressBar
            label="Calories"
            current={weeklyTotals.kcal}
            goal={mealPlan.goalsKcal}
            unit="kcal"
          />
          <ProgressBar
            label="Protein"
            current={weeklyTotals.protein}
            goal={Number(mealPlan.goalsProtein)}
            unit="g"
          />
          <ProgressBar
            label="Fat"
            current={weeklyTotals.fat}
            goal={Number(mealPlan.goalsFat)}
            unit="g"
          />
          <ProgressBar
            label="Carbs"
            current={weeklyTotals.carbs}
            goal={Number(mealPlan.goalsCarbs)}
            unit="g"
          />
        </div>

        <div className="mt-4 flex gap-2">
          <a
            href={`http://localhost:3001/api/meal-plans/${id}/export/pdf`}
            target="_blank"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </a>
          <a
            href={`http://localhost:3001/api/meal-plans/${id}/export/csv`}
            download
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </a>
        </div>

        {shoppingList && shoppingList.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Shopping List</h3>
            <ul className="bg-gray-50 rounded-lg p-4 space-y-1">
              {shoppingList.map((item: any, idx: number) => (
                <li key={idx} className="text-sm text-gray-700">
                  {item.name}: {Math.round(item.totalQuantity)} {item.unit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayKey = day.toISOString().split('T')[0];
          const dayEntries = entriesByDay.get(dayKey) || [];
          const dayEntriesBySlot = new Map(dayEntries.map(e => [e.slot, e]));

          return (
            <div key={dayKey} className="bg-white rounded-lg shadow-md p-3">
              <div className="font-semibold text-sm text-gray-900 mb-2">
                {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="space-y-2">
                {MEAL_SLOTS.slice(0, mealPlan.mealsPerDay).map((slot) => {
                  const entry = dayEntriesBySlot.get(slot);
                  return (
                    <div key={slot} className="text-xs">
                      <div className="font-medium text-gray-700 mb-1">{slot}</div>
                      {entry && entry.recipe ? (
                        <div className="bg-gray-50 rounded p-2">
                          <div className="font-medium">{entry.recipe.title}</div>
                          <div className="text-gray-600">{entry.servingsCount} servings</div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs italic">No meal</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MealPlanView;


