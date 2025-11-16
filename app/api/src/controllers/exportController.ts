import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import { prisma } from '../utils/db';
import { AppError } from '../middleware/errorHandler';

export const exportMealPlanPDF = async (req: Request, res: Response, next: NextFunction) => {
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

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=meal-plan-${id}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Meal Plan', { align: 'center' });
    doc.fontSize(14).text(`Week of ${new Date(mealPlan.weekStart).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Goals
    doc.fontSize(12).text('Weekly Goals:', { underline: true });
    doc.text(`Calories: ${mealPlan.goalsKcal} kcal`);
    doc.text(`Protein: ${Number(mealPlan.goalsProtein)} g`);
    doc.text(`Fat: ${Number(mealPlan.goalsFat)} g`);
    doc.text(`Carbs: ${Number(mealPlan.goalsCarbs)} g`);
    doc.moveDown();

    // Entries by day
    const entriesByDay = new Map<string, typeof mealPlan.entries>();
    mealPlan.entries.forEach(entry => {
      const dateKey = new Date(entry.date).toISOString().split('T')[0];
      if (!entriesByDay.has(dateKey)) {
        entriesByDay.set(dateKey, []);
      }
      entriesByDay.get(dateKey)!.push(entry);
    });

    entriesByDay.forEach((entries, date) => {
      const dayDate = new Date(date);
      doc.fontSize(14).text(dayDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), { underline: true });
      doc.moveDown(0.5);

      entries.forEach(entry => {
        doc.fontSize(12).text(`${entry.slot}: ${entry.recipe.title} (${entry.servingsCount} servings)`);
      });

      // Daily totals
      const dailyTotals = entries.reduce((acc, e) => ({
        kcal: acc.kcal + e.recipe.kcalPerServing * Number(e.servingsCount),
        protein: acc.protein + Number(e.recipe.proteinPerServing) * Number(e.servingsCount),
        fat: acc.fat + Number(e.recipe.fatPerServing) * Number(e.servingsCount),
        carbs: acc.carbs + Number(e.recipe.carbsPerServing) * Number(e.servingsCount),
      }), { kcal: 0, protein: 0, fat: 0, carbs: 0 });

      doc.fontSize(10).fillColor('#666666');
      doc.text(`Daily totals: ${Math.round(dailyTotals.kcal)} kcal, P: ${dailyTotals.protein.toFixed(1)}g, F: ${dailyTotals.fat.toFixed(1)}g, C: ${dailyTotals.carbs.toFixed(1)}g`);
      doc.fillColor('black');
      doc.moveDown();
    });

    // Weekly totals
    const weeklyTotals = mealPlan.entries.reduce((acc, e) => ({
      kcal: acc.kcal + e.recipe.kcalPerServing * Number(e.servingsCount),
      protein: acc.protein + Number(e.recipe.proteinPerServing) * Number(e.servingsCount),
      fat: acc.fat + Number(e.recipe.fatPerServing) * Number(e.servingsCount),
      carbs: acc.carbs + Number(e.recipe.carbsPerServing) * Number(e.servingsCount),
    }), { kcal: 0, protein: 0, fat: 0, carbs: 0 });

    doc.fontSize(14).text('Weekly Totals:', { underline: true });
    doc.fontSize(12);
    doc.text(`Calories: ${Math.round(weeklyTotals.kcal)} / ${mealPlan.goalsKcal} kcal (${((weeklyTotals.kcal / mealPlan.goalsKcal) * 100).toFixed(1)}%)`);
    doc.text(`Protein: ${weeklyTotals.protein.toFixed(1)} / ${Number(mealPlan.goalsProtein)} g`);
    doc.text(`Fat: ${weeklyTotals.fat.toFixed(1)} / ${Number(mealPlan.goalsFat)} g`);
    doc.text(`Carbs: ${weeklyTotals.carbs.toFixed(1)} / ${Number(mealPlan.goalsCarbs)} g`);

    doc.end();
  } catch (error) {
    next(error);
  }
};

export const exportMealPlanCSV = async (req: Request, res: Response, next: NextFunction) => {
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

    const csvRows = [
      'Date,Slot,Recipe,Servings,Kcal,Protein (g),Fat (g),Carbs (g)',
    ];

    mealPlan.entries.forEach(entry => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      const kcal = entry.recipe.kcalPerServing * Number(entry.servingsCount);
      const protein = Number(entry.recipe.proteinPerServing) * Number(entry.servingsCount);
      const fat = Number(entry.recipe.fatPerServing) * Number(entry.servingsCount);
      const carbs = Number(entry.recipe.carbsPerServing) * Number(entry.servingsCount);

      csvRows.push(
        `${date},${entry.slot},"${entry.recipe.title}",${entry.servingsCount},${Math.round(kcal)},${protein.toFixed(2)},${fat.toFixed(2)},${carbs.toFixed(2)}`
      );
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=meal-plan-${id}.csv`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};


