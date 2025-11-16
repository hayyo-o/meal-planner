import { z } from 'zod';

const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  note: z.string().optional(),
});

export const recipeCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient required'),
  steps: z.array(z.string().min(1)).min(1, 'At least one step required'),
  imageUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().min(1, 'Category is required'),
  servings: z.number().int().positive('Servings must be positive integer'),
  cookTimeMin: z.number().int().positive('Cook time must be positive integer'),
  kcalPerServing: z.number().int().nonnegative('Calories must be non-negative'),
  proteinPerServing: z.number().nonnegative('Protein must be non-negative'),
  fatPerServing: z.number().nonnegative('Fat must be non-negative'),
  carbsPerServing: z.number().nonnegative('Carbs must be non-negative'),
});

export const recipeUpdateSchema = recipeCreateSchema.partial();

export const recipeQuerySchema = z.object({
  query: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
  categories: z.string().optional(),
  minKcal: z.coerce.number().optional(),
  maxKcal: z.coerce.number().optional(),
  minProtein: z.coerce.number().optional(),
  maxProtein: z.coerce.number().optional(),
  minFat: z.coerce.number().optional(),
  maxFat: z.coerce.number().optional(),
  minCarbs: z.coerce.number().optional(),
  maxCarbs: z.coerce.number().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});


