export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  note?: string;
}

export interface Recipe {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  imageUrl: string | null;
  tags: string[];
  category: string;
  servings: number;
  cookTimeMin: number;
  kcalPerServing: number;
  proteinPerServing: number;
  fatPerServing: number;
  carbsPerServing: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeCreate {
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  imageUrl?: string;
  tags: string[];
  category: string;
  servings: number;
  cookTimeMin: number;
  kcalPerServing: number;
  proteinPerServing: number;
  fatPerServing: number;
  carbsPerServing: number;
}

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2' | 'snack3';

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string;
  goalsKcal: number;
  goalsProtein: number;
  goalsFat: number;
  goalsCarbs: number;
  mealsPerDay: number;
  createdAt: string;
}

export interface MealEntry {
  id: string;
  mealPlanId: string;
  date: string;
  slot: MealSlot;
  recipeId: string;
  servingsCount: number;
  recipe?: Recipe;
}


