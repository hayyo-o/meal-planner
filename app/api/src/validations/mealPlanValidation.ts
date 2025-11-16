import { z } from 'zod';

export const mealPlanCreateSchema = z.object({
  weekStart: z.coerce.date(),
  goalsKcal: z.number().int().positive('Weekly calories goal must be positive'),
  goalsProtein: z.number().nonnegative('Weekly protein goal must be non-negative'),
  goalsFat: z.number().nonnegative('Weekly fat goal must be non-negative'),
  goalsCarbs: z.number().nonnegative('Weekly carbs goal must be non-negative'),
  mealsPerDay: z.number().int().min(3, 'At least 3 meals per day').max(6, 'Maximum 6 meals per day'),
});

export const mealPlanUpdateSchema = mealPlanCreateSchema.partial();

export const mealEntryCreateSchema = z.object({
  date: z.coerce.date(),
  slot: z.enum(['breakfast', 'lunch', 'dinner', 'snack1', 'snack2', 'snack3']),
  recipeId: z.string().uuid('Invalid recipe ID'),
  servingsCount: z.number().positive('Servings count must be positive').multipleOf(0.5),
});


