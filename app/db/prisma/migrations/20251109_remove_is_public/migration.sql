-- Drop index on isPublic if it exists
DROP INDEX IF EXISTS "recipes_isPublic_idx";

-- Remove isPublic column from recipes table
ALTER TABLE "recipes" DROP COLUMN IF EXISTS "isPublic";


