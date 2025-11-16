# Database Schema Documentation

## Overview

The application uses PostgreSQL with Prisma ORM. All timestamps use ISO-8601 format with timezone (`2024-01-01T00:00:00.000Z`).

## Entity Relationship Diagram

```
User (1) ---< (N) Recipe
User (1) ---< (N) MealPlan
MealPlan (1) ---< (N) MealEntry
MealPlan (1) ---< (N) ShoppingItem
Recipe (1) ---< (N) MealEntry
```

## Tables

### users

**Purpose:** Store user information (currently single-user system).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid() | Unique identifier |
| email | VARCHAR | UNIQUE, NOT NULL | User email |
| name | VARCHAR | NOT NULL | User full name |
| locale | VARCHAR(10) | NOT NULL, DEFAULT 'en' | Locale preference |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |

**Relationships:**
- Has many `Recipe` (cascade delete)
- Has many `MealPlan` (cascade delete)

---

### recipes

**Purpose:** Store recipe information including ingredients, steps, and nutrition values.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid() | Unique identifier |
| ownerId | UUID | FOREIGN KEY → users.id, NOT NULL, ON DELETE CASCADE | Recipe owner |
| title | VARCHAR(200) | NOT NULL | Recipe title |
| description | TEXT | NOT NULL | Recipe description |
| ingredients | JSONB | NOT NULL | Array of ingredient objects |
| steps | JSONB | NOT NULL | Array of step strings |
| imageUrl | VARCHAR | NULL | Path to uploaded image |
| tags | VARCHAR[] | NOT NULL | Array of tag strings |
| category | VARCHAR | NOT NULL | Recipe category |
| servings | INTEGER | NOT NULL | Number of servings |
| cookTimeMin | INTEGER | NOT NULL | Cooking time in minutes |
| isPublic | BOOLEAN | NOT NULL, DEFAULT true | Public visibility |
| kcalPerServing | INTEGER | NOT NULL | Calories per serving |
| proteinPerServing | DECIMAL(5,2) | NOT NULL | Protein per serving (grams) |
| fatPerServing | DECIMAL(5,2) | NOT NULL | Fat per serving (grams) |
| carbsPerServing | DECIMAL(5,2) | NOT NULL | Carbs per serving (grams) |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `ownerId` (FK lookup)
- `title` (search)
- `category` (filtering)
- `isPublic` (filtering)
- `kcalPerServing` (filtering)
- `proteinPerServing` (filtering)
- `cookTimeMin` (filtering)
- `tags` (GIN index for array search)

**Relationships:**
- Belongs to `User`
- Has many `MealEntry` (cascade delete)

**JSON Schema:**

`ingredients` (JSON array):
```json
[
  {
    "name": "string",
    "quantity": number,
    "unit": "string",
    "note": "string (optional)"
  }
]
```

`steps` (JSON array):
```json
["string", "string", ...]
```

---

### meal_plans

**Purpose:** Store weekly meal plan goals and configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid() | Unique identifier |
| userId | UUID | FOREIGN KEY → users.id, NOT NULL, ON DELETE CASCADE | Plan owner |
| weekStart | DATE | NOT NULL | First day of week (Monday) |
| goalsKcal | INTEGER | NOT NULL | Target calories for week |
| goalsProtein | DECIMAL(8,2) | NOT NULL | Target protein for week (grams) |
| goalsFat | DECIMAL(8,2) | NOT NULL | Target fat for week (grams) |
| goalsCarbs | DECIMAL(8,2) | NOT NULL | Target carbs for week (grams) |
| mealsPerDay | INTEGER | NOT NULL | Number of meals per day (3-6) |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp |

**Indexes:**
- `userId` (FK lookup)
- UNIQUE(`userId`, `weekStart`) (prevent duplicate plans)

**Relationships:**
- Belongs to `User`
- Has many `MealEntry` (cascade delete)
- Has many `ShoppingItem` (cascade delete)

---

### meal_entries

**Purpose:** Link recipes to specific meal slots in a meal plan.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid() | Unique identifier |
| mealPlanId | UUID | FOREIGN KEY → meal_plans.id, NOT NULL, ON DELETE CASCADE | Parent meal plan |
| date | DATE | NOT NULL | Date of the meal |
| slot | VARCHAR | NOT NULL | Meal slot type |
| recipeId | UUID | FOREIGN KEY → recipes.id, NOT NULL, ON DELETE CASCADE | Recipe for this slot |
| servingsCount | DECIMAL(3,1) | NOT NULL | Number of servings (0.5, 1.0, 1.5, 2.0, ...) |

**Indexes:**
- `mealPlanId` (FK lookup)
- `recipeId` (FK lookup)
- `date` (ordering/filtering)
- UNIQUE(`mealPlanId`, `date`, `slot`) (one recipe per slot)

**Relationships:**
- Belongs to `MealPlan`
- Belongs to `Recipe`

**Slot Values:**
- `breakfast`
- `lunch`
- `dinner`
- `snack1`
- `snack2`
- `snack3`

---

### shopping_items

**Purpose:** Store aggregated shopping list items for a meal plan.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid() | Unique identifier |
| mealPlanId | UUID | FOREIGN KEY → meal_plans.id, NOT NULL, ON DELETE CASCADE | Parent meal plan |
| name | VARCHAR | NOT NULL | Ingredient name |
| unit | VARCHAR | NOT NULL | Quantity unit |
| quantityDecimal | DECIMAL(10,2) | NOT NULL | Total quantity |

**Indexes:**
- `mealPlanId` (FK lookup)

**Relationships:**
- Belongs to `MealPlan`

**Note:** Shopping items are computed on-demand from meal entries and not stored permanently. This table can be used for caching if needed.

---

## Data Flow

### Recipe → Meal Entry

When a recipe is used in a meal plan:
1. Recipe is referenced by `mealEntry.recipeId`
2. `mealEntry.servingsCount` scales the nutrition values
3. Aggregation happens in application layer

### Meal Entry → Shopping List

When generating shopping list:
1. All `MealEntry` for a `MealPlan` are fetched
2. Ingredients from each recipe are multiplied by `servingsCount`
3. Ingredients are aggregated by `name + unit` (case-insensitive)
4. Normalized quantities are summed

---

## Constraints

1. **Cascading Deletes:** Deleting a user deletes all their recipes and meal plans. Deleting a recipe or meal plan deletes all related entries.
2. **Unique Slots:** A meal plan cannot have duplicate recipes in the same date + slot combination.
3. **Week Uniqueness:** A user can only have one meal plan per week (enforced by unique constraint).

---

## Sample Queries

### Get recipes with filtering
```sql
SELECT * FROM recipes
WHERE is_public = true
  AND kcal_per_serving BETWEEN 200 AND 400
  AND 'vegetarian' = ANY(tags)
ORDER BY created_at DESC
LIMIT 20;
```

### Get meal plan with totals
```sql
SELECT mp.*,
  SUM(me.servings_count * r.kcal_per_serving) as total_kcal
FROM meal_plans mp
LEFT JOIN meal_entries me ON mp.id = me.meal_plan_id
LEFT JOIN recipes r ON me.recipe_id = r.id
WHERE mp.id = $1
GROUP BY mp.id;
```

### Aggregate shopping list
```sql
SELECT 
  ing->>'name' as name,
  ing->>'unit' as unit,
  SUM((ing->>'quantity')::decimal * me.servings_count) as total_quantity
FROM meal_entries me
JOIN recipes r ON me.recipe_id = r.id
CROSS JOIN jsonb_array_elements(r.ingredients) as ing
WHERE me.meal_plan_id = $1
GROUP BY ing->>'name', ing->>'unit'
ORDER BY name;
```

---

## Migrations

Migrations are managed by Prisma. Run:
```bash
npx prisma migrate dev
```

To see current schema:
```bash
npx prisma migrate status
```

To generate Prisma Client:
```bash
npx prisma generate
```

---

## Performance Considerations

1. **Indexes:** Critical fields are indexed for fast filtering and joins.
2. **GIN Index:** `tags` array uses GIN index for efficient array membership queries.
3. **Pagination:** Always use `LIMIT` when fetching lists to avoid large result sets.
4. **JSON:** Ingredient and step arrays are stored as JSONB for efficient querying and storage.

---

## Future Enhancements

- Add `recipe_tags` junction table for many-to-many recipe-tag relationships
- Add indexes for common query patterns
- Add full-text search with PostgreSQL FTS on recipe titles/descriptions
- Normalize categories into separate `categories` table
- Add audit trail (created_by, updated_by fields)


