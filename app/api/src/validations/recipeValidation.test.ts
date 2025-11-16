import { describe, it, expect } from 'vitest';
import { recipeCreateSchema, recipeUpdateSchema } from './recipeValidation';

describe('Recipe Validation', () => {
  describe('recipeCreateSchema', () => {
    it('should validate a complete recipe', () => {
      const validRecipe = {
        title: 'Test Recipe',
        description: 'A test recipe description',
        ingredients: [
          { name: 'Tomato', quantity: 2, unit: 'pieces' },
        ],
        steps: ['Step 1', 'Step 2'],
        tags: ['lunch'],
        category: 'Main Course',
        servings: 2,
        cookTimeMin: 30,
        kcalPerServing: 250,
        proteinPerServing: 20.5,
        fatPerServing: 10.2,
        carbsPerServing: 25.3,
      };

      const result = recipeCreateSchema.safeParse(validRecipe);
      expect(result.success).toBe(true);
    });

    it('should reject recipe with empty title', () => {
      const invalidRecipe = {
        title: '',
        description: 'Description',
        ingredients: [{ name: 'Test', quantity: 1, unit: 'piece' }],
        steps: ['Step 1'],
        tags: [],
        category: 'Main Course',
        servings: 1,
        cookTimeMin: 10,
        kcalPerServing: 100,
        proteinPerServing: 10,
        fatPerServing: 5,
        carbsPerServing: 10,
      };

      const result = recipeCreateSchema.safeParse(invalidRecipe);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['title']);
      }
    });

    it('should reject recipe with no ingredients', () => {
      const invalidRecipe = {
        title: 'Test Recipe',
        description: 'Description',
        ingredients: [],
        steps: ['Step 1'],
        tags: [],
        category: 'Main Course',
        servings: 1,
        cookTimeMin: 10,
        kcalPerServing: 100,
        proteinPerServing: 10,
        fatPerServing: 5,
        carbsPerServing: 10,
      };

      const result = recipeCreateSchema.safeParse(invalidRecipe);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['ingredients']);
      }
    });

    it('should reject negative nutritional values', () => {
      const invalidRecipe = {
        title: 'Test Recipe',
        description: 'Description',
        ingredients: [{ name: 'Test', quantity: 1, unit: 'piece' }],
        steps: ['Step 1'],
        tags: [],
        category: 'Main Course',
        servings: 1,
        cookTimeMin: 10,
        kcalPerServing: -100, // Invalid
        proteinPerServing: 10,
        fatPerServing: 5,
        carbsPerServing: 10,
      };

      const result = recipeCreateSchema.safeParse(invalidRecipe);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['kcalPerServing']);
      }
    });
  });

  describe('recipeUpdateSchema', () => {
    it('should validate partial update', () => {
      const partialUpdate = {
        title: 'Updated Title',
        cookTimeMin: 45,
      };

      const result = recipeUpdateSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should allow empty partial update', () => {
      const emptyUpdate = {};

      const result = recipeUpdateSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });
  });
});


