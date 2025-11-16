import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { serializeMealPlan, serializeRecipe, serializeDecimal } from '../utils/serialize';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export const getMealPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mealPlans = await prisma.mealPlan.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { weekStart: 'desc' },
    });

    res.json({ mealPlans: mealPlans.map(serializeMealPlan) });
  } catch (error) {
    next(error);
  }
};

export const getMealPlanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id },
      include: {
        entries: {
          include: {
            recipe: true,
          },
          orderBy: [
            { date: 'asc' },
            { slot: 'asc' },
          ],
        },
      },
    });

    if (!mealPlan) {
      throw new AppError('Meal plan not found', 404, 'MEAL_PLAN_NOT_FOUND');
    }

    res.json(serializeMealPlan(mealPlan));
  } catch (error) {
    next(error);
  }
};

export const createMealPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mealPlanData = req.body;

    const mealPlan = await prisma.mealPlan.create({
      data: {
        ...mealPlanData,
        userId: DEFAULT_USER_ID,
      },
    });

    res.status(201).json(serializeMealPlan(mealPlan));
  } catch (error) {
    next(error);
  }
};

export const updateMealPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mealPlanData = req.body;

    const existingMealPlan = await prisma.mealPlan.findUnique({
      where: { id },
    });

    if (!existingMealPlan) {
      throw new AppError('Meal plan not found', 404, 'MEAL_PLAN_NOT_FOUND');
    }

    const mealPlan = await prisma.mealPlan.update({
      where: { id },
      data: mealPlanData,
    });

    res.json(serializeMealPlan(mealPlan));
  } catch (error) {
    next(error);
  }
};

export const deleteMealPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existingMealPlan = await prisma.mealPlan.findUnique({
      where: { id },
    });

    if (!existingMealPlan) {
      throw new AppError('Meal plan not found', 404, 'MEAL_PLAN_NOT_FOUND');
    }

    await prisma.mealPlan.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const upsertMealEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const entryData = req.body;

    // Verify meal plan exists
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id },
    });

    if (!mealPlan) {
      throw new AppError('Meal plan not found', 404, 'MEAL_PLAN_NOT_FOUND');
    }

    // Upsert entry
    const entry = await prisma.mealEntry.upsert({
      where: {
        mealPlanId_date_slot: {
          mealPlanId: id,
          date: entryData.date,
          slot: entryData.slot,
        },
      },
      update: {
        recipeId: entryData.recipeId,
        servingsCount: entryData.servingsCount,
      },
      create: {
        mealPlanId: id,
        ...entryData,
      },
      include: {
        recipe: true,
      },
    });

    res.json({
      ...entry,
      servingsCount: serializeDecimal(entry.servingsCount),
      recipe: entry.recipe ? serializeRecipe(entry.recipe) : undefined,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMealEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, entryId } = req.params;

    const existingEntry = await prisma.mealEntry.findUnique({
      where: { id: entryId },
    });

    if (!existingEntry || existingEntry.mealPlanId !== id) {
      throw new AppError('Meal entry not found', 404, 'MEAL_ENTRY_NOT_FOUND');
    }

    await prisma.mealEntry.delete({
      where: { id: entryId },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};


