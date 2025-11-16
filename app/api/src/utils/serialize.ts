/**
 * Convert Prisma Decimal to number for JSON serialization
 */
export function serializeDecimal(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  // Handle Prisma Decimal type
  if (value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  // Fallback to Number conversion
  return Number(value);
}

/**
 * Serialize a recipe object, converting Decimal fields to numbers
 */
export function serializeRecipe(recipe: any) {
  return {
    ...recipe,
    proteinPerServing: serializeDecimal(recipe.proteinPerServing),
    fatPerServing: serializeDecimal(recipe.fatPerServing),
    carbsPerServing: serializeDecimal(recipe.carbsPerServing),
  };
}

/**
 * Serialize an array of recipes
 */
export function serializeRecipes(recipes: any[]) {
  return recipes.map(serializeRecipe);
}

/**
 * Serialize a meal plan object
 */
export function serializeMealPlan(mealPlan: any) {
  return {
    ...mealPlan,
    goalsProtein: serializeDecimal(mealPlan.goalsProtein),
    goalsFat: serializeDecimal(mealPlan.goalsFat),
    goalsCarbs: serializeDecimal(mealPlan.goalsCarbs),
    entries: mealPlan.entries?.map((entry: any) => ({
      ...entry,
      servingsCount: serializeDecimal(entry.servingsCount),
      recipe: entry.recipe ? serializeRecipe(entry.recipe) : undefined,
    })) || [],
  };
}

