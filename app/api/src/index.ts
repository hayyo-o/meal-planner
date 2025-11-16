import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { recipeRoutes } from './routes/recipes';
import { mealPlanRoutes } from './routes/mealPlans';
import { taxonomyRoutes } from './routes/taxonomy';
import path from 'path';
import fs from 'fs/promises';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve uploaded images
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../uploads');

fs.mkdir(uploadDir, { recursive: true }).catch((error) => {
  logger.error({ error }, 'Failed to create upload directory');
});

app.use('/uploads', express.static(uploadDir));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/recipes', recipeRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api', taxonomyRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});

