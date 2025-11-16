import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateMealPlan } from '../api/mealPlans';

const mealPlanSchema = z.object({
  weekStart: z.string().min(1, 'Week start is required'),
  goalsKcal: z.coerce.number().int().positive(),
  goalsProtein: z.coerce.number().nonnegative(),
  goalsFat: z.coerce.number().nonnegative(),
  goalsCarbs: z.coerce.number().nonnegative(),
  mealsPerDay: z.coerce.number().int().min(3).max(6),
});

type MealPlanFormData = z.infer<typeof mealPlanSchema>;

const MealPlanForm = () => {
  const navigate = useNavigate();
  const createMutation = useCreateMealPlan();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MealPlanFormData>({
    resolver: zodResolver(mealPlanSchema),
    defaultValues: {
      goalsKcal: 14000,
      goalsProtein: 700,
      goalsFat: 350,
      goalsCarbs: 1750,
      mealsPerDay: 3,
    },
  });

  const onSubmit = async (data: MealPlanFormData) => {
    try {
      const result = await createMutation.mutateAsync({
        ...data,
        weekStart: new Date(data.weekStart).toISOString(),
      });
      navigate(`/meal-plans/${result.id}`);
    } catch (error) {
      console.error('Error creating meal plan:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Meal Plan</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Week Start (Monday)</label>
          <input
            type="date"
            {...register('weekStart')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.weekStart && <p className="text-red-500 text-sm mt-1">{errors.weekStart.message}</p>}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Goals</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calories (kcal/week)</label>
              <input
                type="number"
                {...register('goalsKcal')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.goalsKcal && <p className="text-red-500 text-sm mt-1">{errors.goalsKcal.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Protein (g/week)</label>
              <input
                type="number"
                {...register('goalsProtein')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.goalsProtein && <p className="text-red-500 text-sm mt-1">{errors.goalsProtein.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fat (g/week)</label>
              <input
                type="number"
                {...register('goalsFat')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.goalsFat && <p className="text-red-500 text-sm mt-1">{errors.goalsFat.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carbs (g/week)</label>
              <input
                type="number"
                {...register('goalsCarbs')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.goalsCarbs && <p className="text-red-500 text-sm mt-1">{errors.goalsCarbs.message}</p>}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meals per Day</label>
          <select
            {...register('mealsPerDay')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="3">3 meals</option>
            <option value="4">4 meals</option>
            <option value="5">5 meals</option>
            <option value="6">6 meals</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/meal-plans')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Create Meal Plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default MealPlanForm;


