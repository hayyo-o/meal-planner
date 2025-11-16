import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { serializeRecipe } from '../utils/serialize';

const uploadDir =
  process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve(__dirname, '../../uploads');

const ensureUploadDir = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // ignore if exists
  }
};

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await ensureUploadDir();
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed'));
    }
  },
});

export const uploadSingle = upload.single('image');

export const uploadRecipeImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No image file provided', 400, 'NO_FILE');
    }

    const { id } = req.params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      // Delete uploaded file
      await fs.unlink(req.file.path).catch(() => {});
      throw new AppError('Recipe not found', 404, 'RECIPE_NOT_FOUND');
    }

    const extension = path.extname(req.file.originalname || req.file.path);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    const finalPath = path.join(uploadDir, fileName);

    // Resize image to max 1600px on longest side and save to final path
    await sharp(req.file.path)
      .resize(1600, 1600, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(finalPath);

    // Remove temp file written by multer
    await fs.unlink(req.file.path).catch(() => {});

    // Delete old image if exists
    if (recipe.imageUrl) {
      const oldPath = path.join(uploadDir, path.basename(recipe.imageUrl));
      await fs.unlink(oldPath).catch(() => {
        logger.warn({ path: oldPath }, 'Failed to delete old image');
      });
    }

    // Update recipe with new image URL
    const imageUrl = `/uploads/${fileName}`;
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: { imageUrl },
    });

    res.json(serializeRecipe(updatedRecipe));
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    logger.error({ error, recipeId: req.params.id }, 'Failed to upload recipe image');
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Failed to process image upload', 500, 'IMAGE_UPLOAD_ERROR', (error as Error).message));
    }
  }
};


