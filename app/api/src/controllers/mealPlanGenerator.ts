import { Request, Response, NextFunction } from 'express';
import { generateMealPlan as generateMealPlanService } from '../services/mealPlanGenerator';
import { serializeRecipe, serializeDecimal } from '../utils/serialize';

export const generateMealPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const entries = await generateMealPlanService(id);
    res.json({
      entries: entries.map(entry => ({
        ...entry,
        servingsCount: serializeDecimal(entry.servingsCount),
        recipe: entry.recipe ? serializeRecipe(entry.recipe) : undefined,
      })),
    });
  } catch (error) {
    next(error);
  }
};

