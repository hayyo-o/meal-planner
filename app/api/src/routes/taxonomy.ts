import { Router } from 'express';
import { prisma } from '../utils/db';

export const taxonomyRoutes = Router();

taxonomyRoutes.get('/tags', async (req, res) => {
  const recipes = await prisma.recipe.findMany({
    select: { tags: true },
  });

  const allTags = new Set<string>();
  recipes.forEach(recipe => {
    recipe.tags.forEach(tag => allTags.add(tag));
  });

  res.json({ tags: Array.from(allTags).sort() });
});

taxonomyRoutes.get('/categories', async (req, res) => {
  const categories = await prisma.recipe.findMany({
    select: { category: true },
    distinct: ['category'],
  });

  res.json({ categories: categories.map(c => c.category).sort() });
});


