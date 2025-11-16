import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

describe('MealPlanGenerator', () => {
  let mealPlanId: string;

  beforeAll(async () => {
    // Create a test meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: DEFAULT_USER_ID,
        weekStart: new Date('2024-01-01'),
        goalsKcal: 14000,
        goalsProtein: 700,
        goalsFat: 350,
        goalsCarbs: 1750,
        mealsPerDay: 3,
      },
    });
    mealPlanId = mealPlan.id;

    // Ensure we have some recipes
    const count = await prisma.recipe.count();
    if (count === 0) {
      throw new Error('No recipes found in database. Run seed first.');
    }
  });

  afterAll(async () => {
    // Clean up
    await prisma.mealPlan.delete({ where: { id: mealPlanId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('should generate meal plan with entries', async () => {
    const { generateMealPlan } = await import('./mealPlanGenerator');
    const entries = await generateMealPlan(mealPlanId);

    expect(entries).toBeDefined();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]).toHaveProperty('recipeId');
    expect(entries[0]).toHaveProperty('servingsCount');
  });

  it('should respect mealsPerDay constraint', async () => {
    const { generateMealPlan } = await import('./mealPlanGenerator');
    
    // Create a new meal plan for this test
    const testMealPlan = await prisma.mealPlan.create({
      data: {
        userId: DEFAULT_USER_ID,
        weekStart: new Date('2024-02-01'),
        goalsKcal: 14000,
        goalsProtein: 700,
        goalsFat: 350,
        goalsCarbs: 1750,
        mealsPerDay: 4,
      },
    });

    try {
      const entries = await generateMealPlan(testMealPlan.id);
      
      // Should generate 4 meals per day * 7 days = 28 entries
      expect(entries.length).toBe(28);
      
      // Each day should have exactly 4 entries
      const entriesByDay = new Map<string, number>();
      entries.forEach(e => {
        const day = e.date.toISOString().split('T')[0];
        entriesByDay.set(day, (entriesByDay.get(day) || 0) + 1);
      });
      
      entriesByDay.forEach(count => {
        expect(count).toBe(4);
      });
    } finally {
      await prisma.mealPlan.delete({ where: { id: testMealPlan.id } }).catch(() => {});
    }
  });

  it('should not overwrite locked entries', async () => {
    const { generateMealPlan } = await import('./mealPlanGenerator');
    
    // Create a new meal plan with a locked entry
    const testMealPlan = await prisma.mealPlan.create({
      data: {
        userId: DEFAULT_USER_ID,
        weekStart: new Date('2024-03-01'),
        goalsKcal: 14000,
        goalsProtein: 700,
        goalsFat: 350,
        goalsCarbs: 1750,
        mealsPerDay: 3,
      },
    });

    try {
      // Get a random recipe
      const recipe = await prisma.recipe.findFirst();
      if (!recipe) throw new Error('No recipes found');

      // Create a locked entry
      await prisma.mealEntry.create({
        data: {
          mealPlanId: testMealPlan.id,
          date: new Date('2024-03-01'),
          slot: 'breakfast',
          recipeId: recipe.id,
          servingsCount: 1.0,
        },
      });

      const entries = await generateMealPlan(testMealPlan.id);
      
      // Should have one locked entry plus generated ones
      const lockedEntry = entries.find(e => 
        e.date.toISOString().split('T')[0] === '2024-03-01' && 
        e.slot === 'breakfast'
      );
      
      expect(lockedEntry).toBeDefined();
      expect(lockedEntry?.recipeId).toBe(recipe.id);
      expect(lockedEntry?.servingsCount).toBe(1.0);
    } finally {
      await prisma.mealPlan.delete({ where: { id: testMealPlan.id } }).catch(() => {});
    }
  });
});


