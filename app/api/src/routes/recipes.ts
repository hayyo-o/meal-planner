import { Router } from 'express';
import { validate, validateQuery } from '../middleware/validate';
import { recipeCreateSchema, recipeUpdateSchema, recipeQuerySchema } from '../validations/recipeValidation';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipesController';
import { uploadSingle, uploadRecipeImage } from '../controllers/imageController';

export const recipeRoutes = Router();

recipeRoutes.get('/', validateQuery(recipeQuerySchema), getRecipes);
recipeRoutes.get('/:id', getRecipeById);
recipeRoutes.post('/', validate(recipeCreateSchema), createRecipe);
recipeRoutes.put('/:id', validate(recipeUpdateSchema), updateRecipe);
recipeRoutes.post('/:id/image', uploadSingle, uploadRecipeImage);
recipeRoutes.delete('/:id', deleteRecipe);

