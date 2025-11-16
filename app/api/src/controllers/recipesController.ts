import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { serializeRecipes, serializeRecipe } from '../utils/serialize';

const toInt = (value: any) => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return Math.trunc(num);
};

const toDecimal = (value: any, precision = 2) => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  const factor = 10 ** precision;
  return Math.round(num * factor) / factor;
};

const sanitizeRecipePayload = (payload: any) => {
  const data = { ...payload };
  data.servings = toInt(data.servings) ?? 1;
  data.cookTimeMin = toInt(data.cookTimeMin) ?? 1;
  data.kcalPerServing = toInt(data.kcalPerServing) ?? 0;
  data.proteinPerServing = toDecimal(data.proteinPerServing);
  data.fatPerServing = toDecimal(data.fatPerServing);
  data.carbsPerServing = toDecimal(data.carbsPerServing);

  if (Array.isArray(data.ingredients)) {
    data.ingredients = data.ingredients.map((ingredient: any) => ({
      ...ingredient,
      quantity: toDecimal(ingredient.quantity, 2) ?? 0,
    }));
  }

  if (Array.isArray(data.steps)) {
    data.steps = data.steps.map((step: any) => String(step));
  }

  data.tags = Array.isArray(data.tags) ? data.tags.map((tag: any) => String(tag)) : [];

  return data;
};

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// Tag filtering helper
const filterByTags = (tags: string, recipeTags: string[]): boolean => {
  const searchTags = tags.split(',').map(t => t.trim().toLowerCase());
  return searchTags.some(t => recipeTags.some(rt => rt.toLowerCase().includes(t)));
};

export const getRecipes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      query,
      tags,
      category,
      minKcal,
      maxKcal,
      minProtein,
      maxProtein,
      minFat,
      maxFat,
      minCarbs,
      maxCarbs,
      categories,
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (categories) {
      const categoryList = (categories as string)
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      if (categoryList.length > 0) {
        where.category = { in: categoryList };
      }
    } else if (category) {
      where.category = category;
    }

    if (minKcal || maxKcal) {
      where.kcalPerServing = {};
      if (minKcal) where.kcalPerServing.gte = Number(minKcal);
      if (maxKcal) where.kcalPerServing.lte = Number(maxKcal);
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.recipe.count({ where }),
    ]);

    let filteredRecipes = recipes;

    // Apply text search
    if (query) {
      const searchLower = (query as string).toLowerCase();
      filteredRecipes = filteredRecipes.filter(r => {
        const titleMatch = r.title.toLowerCase().includes(searchLower);
        const descriptionMatch = r.description.toLowerCase().includes(searchLower);
        const categoryMatch = r.category.toLowerCase().includes(searchLower);
        return titleMatch || descriptionMatch || categoryMatch;
      });
    }

    // Apply tag filtering
    if (tags) {
      filteredRecipes = filteredRecipes.filter(r => filterByTags(tags as string, r.tags));
    }

    // Apply decimal range filters (protein, fat, carbs)
    if (minProtein || maxProtein) {
      const min = minProtein ? Number(minProtein) : 0;
      const max = maxProtein ? Number(maxProtein) : Infinity;
      filteredRecipes = filteredRecipes.filter(r => {
        const value = Number(r.proteinPerServing);
        return value >= min && value <= max;
      });
    }

    if (minFat || maxFat) {
      const min = minFat ? Number(minFat) : 0;
      const max = maxFat ? Number(maxFat) : Infinity;
      filteredRecipes = filteredRecipes.filter(r => {
        const value = Number(r.fatPerServing);
        return value >= min && value <= max;
      });
    }

    if (minCarbs || maxCarbs) {
      const min = minCarbs ? Number(minCarbs) : 0;
      const max = maxCarbs ? Number(maxCarbs) : Infinity;
      filteredRecipes = filteredRecipes.filter(r => {
        const value = Number(r.carbsPerServing);
        return value >= min && value <= max;
      });
    }

    res.json({
      recipes: serializeRecipes(filteredRecipes),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecipeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new AppError('Recipe not found', 404, 'RECIPE_NOT_FOUND');
    }

    res.json(serializeRecipe(recipe));
  } catch (error) {
    next(error);
  }
};

export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipeData = sanitizeRecipePayload(req.body);

    const recipe = await prisma.recipe.create({
      data: {
        ...recipeData,
        ownerId: DEFAULT_USER_ID,
      },
    });

    res.status(201).json(serializeRecipe(recipe));
  } catch (error) {
    next(error);
  }
};

export const updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const recipeData = sanitizeRecipePayload(req.body);

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      throw new AppError('Recipe not found', 404, 'RECIPE_NOT_FOUND');
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: recipeData,
    });

    res.json(serializeRecipe(recipe));
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      throw new AppError('Recipe not found', 404, 'RECIPE_NOT_FOUND');
    }

    await prisma.recipe.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};


