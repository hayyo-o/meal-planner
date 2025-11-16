import { prisma } from '../utils/db';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

interface MacroValues {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface RecipeMacro {
  id: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  title: string;
}

interface MealSlot {
  date: Date;
  slot: string;
}

export async function generateMealPlan(mealPlanId: string) {
  // Get meal plan
  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id: mealPlanId },
    include: {
      entries: true,
    },
  });

  if (!mealPlan) {
    throw new Error('Meal plan not found');
  }

  // Get all available recipes
  const allRecipes = await prisma.recipe.findMany();

  // Convert to macro-friendly format
  const recipeMacros: RecipeMacro[] = allRecipes.map(r => ({
    id: r.id,
    kcal: r.kcalPerServing,
    protein: Number(r.proteinPerServing),
    fat: Number(r.fatPerServing),
    carbs: Number(r.carbsPerServing),
    title: r.title,
  }));

  // Calculate weekly goals per serving on average
  const totalSlots = mealPlan.mealsPerDay * 7;
  const avgSlots = Math.max(1, totalSlots / mealPlan.mealsPerDay);

  const goalsPerSlot: MacroValues = {
    kcal: mealPlan.goalsKcal / totalSlots,
    protein: Number(mealPlan.goalsProtein) / totalSlots,
    fat: Number(mealPlan.goalsFat) / totalSlots,
    carbs: Number(mealPlan.goalsCarbs) / totalSlots,
  };

  // Generate all slots for the week
  const weekStart = new Date(mealPlan.weekStart);
  const slots: MealSlot[] = [];
  const slotTypes = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2', 'snack3'];

  for (let day = 0; day < 7; day++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + day);

    for (let i = 0; i < mealPlan.mealsPerDay; i++) {
      slots.push({ date, slot: slotTypes[i] });
    }
  }

  // Filter out locked slots
  const lockedSlots = new Set(
    mealPlan.entries.map(e => `${e.date.toISOString()}-${e.slot}`)
  );
  const freeSlots = slots.filter(
    s => !lockedSlots.has(`${s.date.toISOString()}-${s.slot}`)
  );

  // Calculate macro-distance score for each recipe
  const recipeScores = recipeMacros.map(r => ({
    ...r,
    score: calculateMacroDistance(r, goalsPerSlot),
  }));

  // Sort by score (lower is better)
  recipeScores.sort((a, b) => a.score - b.score);

  // Greedy assignment
  const assignments: Array<{ date: Date; slot: string; recipeId: string; servingsCount: number }> = [];

  let currentTotals: MacroValues = {
    kcal: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };

  // Add locked entries to current totals
  for (const entry of mealPlan.entries) {
    const recipe = recipeMacros.find(r => r.id === entry.recipeId);
    if (recipe) {
      const servings = Number(entry.servingsCount);
      currentTotals.kcal += recipe.kcal * servings;
      currentTotals.protein += recipe.protein * servings;
      currentTotals.fat += recipe.fat * servings;
      currentTotals.carbs += recipe.carbs * servings;
    }
  }

  // Assign to free slots
  for (const slot of freeSlots) {
    const remaining = freeSlots.length - assignments.length;
    const remainingGoals = {
      kcal: (mealPlan.goalsKcal - currentTotals.kcal) / remaining,
      protein: (Number(mealPlan.goalsProtein) - currentTotals.protein) / remaining,
      fat: (Number(mealPlan.goalsFat) - currentTotals.fat) / remaining,
      carbs: (Number(mealPlan.goalsCarbs) - currentTotals.carbs) / remaining,
    };

    const bestRecipe = findBestRecipe(recipeScores, remainingGoals);
    
    if (bestRecipe) {
      assignments.push({
        date: slot.date,
        slot: slot.slot,
        recipeId: bestRecipe.id,
        servingsCount: bestRecipe.servingsCount,
      });

      currentTotals.kcal += bestRecipe.kcal * bestRecipe.servingsCount;
      currentTotals.protein += bestRecipe.protein * bestRecipe.servingsCount;
      currentTotals.fat += bestRecipe.fat * bestRecipe.servingsCount;
      currentTotals.carbs += bestRecipe.carbs * bestRecipe.servingsCount;
    }
  }

  // Simple local optimization: try swapping adjacent recipes
  for (let i = 0; i < assignments.length - 1; i++) {
    for (let j = i + 1; j < assignments.length; j++) {
      const improvement = trySwap(assignments, i, j, mealPlan, recipeMacros);
      if (improvement) {
        break; // Only one swap per iteration
      }
    }
  }

  // Insert all assignments
  const createdEntries = [];
  for (const assignment of assignments) {
    const entry = await prisma.mealEntry.create({
      data: {
        mealPlanId: mealPlan.id,
        date: assignment.date,
        slot: assignment.slot,
        recipeId: assignment.recipeId,
        servingsCount: assignment.servingsCount,
      },
      include: {
        recipe: true,
      },
    });
    createdEntries.push(entry);
  }

  return createdEntries;
}

function calculateMacroDistance(recipe: RecipeMacro, goals: MacroValues): number {
  // Normalized Euclidean distance in macro space
  const dKcal = Math.abs(recipe.kcal - goals.kcal) / goals.kcal;
  const dProtein = Math.abs(recipe.protein - goals.protein) / (goals.protein || 1);
  const dFat = Math.abs(recipe.fat - goals.fat) / (goals.fat || 1);
  const dCarbs = Math.abs(recipe.carbs - goals.carbs) / (goals.carbs || 1);

  return dKcal + 0.8 * dProtein + 0.6 * dFat + 0.6 * dCarbs;
}

function findBestRecipe(
  candidates: Array<RecipeMacro & { score: number }>,
  goals: MacroValues
): (RecipeMacro & { servingsCount: number }) | null {
  if (candidates.length === 0) return null;

  // Try different serving sizes: 0.5, 1.0, 1.5, 2.0
  let best: (RecipeMacro & { servingsCount: number }) | null = null;
  let bestScore = Infinity;

  for (const candidate of candidates.slice(0, 20)) { // Limit to top 20 candidates
    for (const servings of [0.5, 1.0, 1.5, 2.0]) {
      const adjusted = {
        ...candidate,
        kcal: candidate.kcal * servings,
        protein: candidate.protein * servings,
        fat: candidate.fat * servings,
        carbs: candidate.carbs * servings,
      };

      const score = calculateMacroDistance(adjusted, goals);

      if (score < bestScore) {
        bestScore = score;
        best = { ...candidate, servingsCount: servings };
      }
    }
  }

  return best;
}

function trySwap(
  assignments: Array<{ recipeId: string; servingsCount: number }>,
  i: number,
  j: number,
  mealPlan: any,
  recipes: RecipeMacro[]
): boolean {
  // This is a simplified version - in production would calculate full macro impact
  // For now, just swap if it seems beneficial
  const recipeI = recipes.find(r => r.id === assignments[i].recipeId);
  const recipeJ = recipes.find(r => r.id === assignments[j].recipeId);

  if (!recipeI || !recipeJ) return false;

  // Simple heuristic: swap if it brings us closer to goals
  const currentDev = Math.abs(recipeI.score - recipeJ.score);
  const [temp] = assignments.slice(i, i + 1);
  assignments[i] = assignments[j];
  assignments[j] = temp;
  const newDev = Math.abs(recipeI.score - recipeJ.score);

  if (newDev >= currentDev) {
    // Swap back
    [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
    return false;
  }

  return true;
}


