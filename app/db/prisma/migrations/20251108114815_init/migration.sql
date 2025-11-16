-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ingredients" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "imageUrl" TEXT,
    "tags" TEXT[],
    "category" TEXT NOT NULL,
    "servings" INTEGER NOT NULL,
    "cookTimeMin" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "kcalPerServing" INTEGER NOT NULL,
    "proteinPerServing" DECIMAL(5,2) NOT NULL,
    "fatPerServing" DECIMAL(5,2) NOT NULL,
    "carbsPerServing" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "goalsKcal" INTEGER NOT NULL,
    "goalsProtein" DECIMAL(8,2) NOT NULL,
    "goalsFat" DECIMAL(8,2) NOT NULL,
    "goalsCarbs" DECIMAL(8,2) NOT NULL,
    "mealsPerDay" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_entries" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "slot" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "servingsCount" DECIMAL(3,1) NOT NULL,

    CONSTRAINT "meal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_items" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantityDecimal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "shopping_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "recipes_title_idx" ON "recipes"("title");

-- CreateIndex
CREATE INDEX "recipes_category_idx" ON "recipes"("category");

-- CreateIndex
CREATE INDEX "recipes_isPublic_idx" ON "recipes"("isPublic");

-- CreateIndex
CREATE INDEX "recipes_kcalPerServing_idx" ON "recipes"("kcalPerServing");

-- CreateIndex
CREATE INDEX "recipes_proteinPerServing_idx" ON "recipes"("proteinPerServing");

-- CreateIndex
CREATE INDEX "recipes_cookTimeMin_idx" ON "recipes"("cookTimeMin");

-- CreateIndex
CREATE INDEX "recipes_tags_idx" ON "recipes"("tags");

-- CreateIndex
CREATE INDEX "meal_plans_userId_idx" ON "meal_plans"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "meal_plans_userId_weekStart_key" ON "meal_plans"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "meal_entries_mealPlanId_idx" ON "meal_entries"("mealPlanId");

-- CreateIndex
CREATE INDEX "meal_entries_recipeId_idx" ON "meal_entries"("recipeId");

-- CreateIndex
CREATE INDEX "meal_entries_date_idx" ON "meal_entries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "meal_entries_mealPlanId_date_slot_key" ON "meal_entries"("mealPlanId", "date", "slot");

-- CreateIndex
CREATE INDEX "shopping_items_mealPlanId_idx" ON "shopping_items"("mealPlanId");

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
