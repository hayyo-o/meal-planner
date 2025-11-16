import { Router } from 'express';
import { validate } from '../middleware/validate';
import { mealPlanCreateSchema, mealPlanUpdateSchema, mealEntryCreateSchema } from '../validations/mealPlanValidation';
import {
  getMealPlans,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  upsertMealEntry,
  deleteMealEntry,
} from '../controllers/mealPlansController';
import { generateMealPlan } from '../controllers/mealPlanGenerator';
import { getShoppingList } from '../controllers/shoppingListController';
import { exportMealPlanPDF, exportMealPlanCSV } from '../controllers/exportController';

export const mealPlanRoutes = Router();

mealPlanRoutes.get('/', getMealPlans);
mealPlanRoutes.get('/:id', getMealPlanById);
mealPlanRoutes.post('/', validate(mealPlanCreateSchema), createMealPlan);
mealPlanRoutes.put('/:id', validate(mealPlanUpdateSchema), updateMealPlan);
mealPlanRoutes.delete('/:id', deleteMealPlan);

mealPlanRoutes.post('/:id/generate', generateMealPlan);
mealPlanRoutes.post('/:id/entries', validate(mealEntryCreateSchema), upsertMealEntry);
mealPlanRoutes.delete('/:id/entries/:entryId', deleteMealEntry);

mealPlanRoutes.get('/:id/shopping-list', getShoppingList);
mealPlanRoutes.get('/:id/export/pdf', exportMealPlanPDF);
mealPlanRoutes.get('/:id/export/csv', exportMealPlanCSV);


