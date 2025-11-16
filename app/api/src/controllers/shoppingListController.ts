import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { serializeDecimal } from '../utils/serialize';

interface AggregatedIngredient {
  name: string;
  unit: string;
  totalQuantity: number;
}

export const getShoppingList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id },
      include: {
        entries: {
          include: {
            recipe: true,
          },
        },
      },
    });

    if (!mealPlan) {
      throw new AppError('Meal plan not found', 404, 'MEAL_PLAN_NOT_FOUND');
    }

    // Aggregate ingredients
    const ingredientMap = new Map<string, AggregatedIngredient>();

    for (const entry of mealPlan.entries) {
      if (!entry.recipe) continue;
      const servings = serializeDecimal(entry.servingsCount);
      const ingredients = entry.recipe.ingredients as Array<{
        name: string;
        quantity: number;
        unit: string;
      }>;

      for (const ing of ingredients) {
        const key = `${ing.name.toLowerCase().trim()}_${ing.unit.toLowerCase().trim()}`;
        const quantity = typeof ing.quantity === 'number' ? ing.quantity : Number(ing.quantity) || 0;
        const totalQuantity = quantity * servings;

        if (ingredientMap.has(key)) {
          ingredientMap.get(key)!.totalQuantity += totalQuantity;
        } else {
          ingredientMap.set(key, {
            name: ing.name,
            unit: ing.unit,
            totalQuantity,
          });
        }
      }
    }

    const shoppingList = Array.from(ingredientMap.values()).map(item => ({
      ...item,
      totalQuantity: Math.round(item.totalQuantity),
    }));

    res.json({ shoppingList });
  } catch (error) {
    next(error);
  }
};


