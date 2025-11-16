# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Response Format

All responses are in JSON format.

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": { ... }
}
```

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Recipes

#### GET /recipes
Get list of recipes with optional filtering and pagination.

**Query Parameters:**
- `query` (string, optional) - Search term for title/description
- `tags` (string, optional) - Comma-separated tags to filter
- `category` (string, optional) - Filter by category
- `minKcal` (number, optional) - Minimum calories per serving
- `maxKcal` (number, optional) - Maximum calories per serving
- `minProtein` (number, optional) - Minimum protein per serving
- `maxProtein` (number, optional) - Maximum protein per serving
- `minFat` (number, optional) - Minimum fat per serving
- `maxFat` (number, optional) - Maximum fat per serving
- `minCarbs` (number, optional) - Minimum carbs per serving
- `maxCarbs` (number, optional) - Maximum carbs per serving
- `page` (number, optional, default: 1) - Page number
- `limit` (number, optional, default: 20) - Items per page

**Example Request:**
```
GET /recipes?minKcal=200&maxKcal=400&tags=lunch,dinner&page=1&limit=10
```

**Response:**
```json
{
  "recipes": [
    {
      "id": "uuid",
      "title": "Recipe Title",
      "description": "Description",
      "ingredients": [...],
      "steps": [...],
      "imageUrl": "/uploads/image.jpg",
      "tags": ["lunch", "healthy"],
      "category": "Main Course",
      "servings": 2,
      "cookTimeMin": 30,
      "isPublic": true,
      "kcalPerServing": 350,
      "proteinPerServing": 25.0,
      "fatPerServing": 10.0,
      "carbsPerServing": 35.0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

#### GET /recipes/:id
Get a single recipe by ID.

**Response:**
```json
{
  "id": "uuid",
  "title": "Recipe Title",
  "description": "Description",
  "ingredients": [
    {
      "name": "Tomato",
      "quantity": 2,
      "unit": "pieces",
      "note": "diced"
    }
  ],
  "steps": ["Step 1", "Step 2"],
  "imageUrl": "/uploads/image.jpg",
  "tags": ["lunch", "healthy"],
  "category": "Main Course",
  "servings": 2,
  "cookTimeMin": 30,
  "isPublic": true,
  "kcalPerServing": 350,
  "proteinPerServing": 25.0,
  "fatPerServing": 10.0,
  "carbsPerServing": 35.0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### POST /recipes
Create a new recipe.

**Request Body:**
```json
{
  "title": "New Recipe",
  "description": "Description",
  "ingredients": [
    {
      "name": "Ingredient",
      "quantity": 1,
      "unit": "cup",
      "note": "optional note"
    }
  ],
  "steps": ["Step 1", "Step 2"],
  "imageUrl": "optional",
  "tags": ["tag1", "tag2"],
  "category": "Main Course",
  "servings": 2,
  "cookTimeMin": 30,
  "isPublic": true,
  "kcalPerServing": 350,
  "proteinPerServing": 25.0,
  "fatPerServing": 10.0,
  "carbsPerServing": 35.0
}
```

**Response:** Same as GET /recipes/:id

---

#### PUT /recipes/:id
Update an existing recipe.

**Request Body:** Same as POST /recipes (all fields optional)

**Response:** Same as GET /recipes/:id

---

#### DELETE /recipes/:id
Delete a recipe.

**Response:** 204 No Content

---

#### POST /recipes/:id/image
Upload an image for a recipe.

**Content-Type:** multipart/form-data

**Form Field:**
- `image` (file) - JPEG, PNG, or WebP image (max 5MB)

**Response:** Same as GET /recipes/:id

---

### Meal Plans

#### GET /meal-plans
Get list of all meal plans.

**Response:**
```json
{
  "mealPlans": [
    {
      "id": "uuid",
      "userId": "uuid",
      "weekStart": "2024-01-01T00:00:00.000Z",
      "goalsKcal": 14000,
      "goalsProtein": 700.0,
      "goalsFat": 350.0,
      "goalsCarbs": 1750.0,
      "mealsPerDay": 3,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### GET /meal-plans/:id
Get a meal plan with all entries.

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "weekStart": "2024-01-01T00:00:00.000Z",
  "goalsKcal": 14000,
  "goalsProtein": 700.0,
  "goalsFat": 350.0,
  "goalsCarbs": 1750.0,
  "mealsPerDay": 3,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "entries": [
    {
      "id": "uuid",
      "mealPlanId": "uuid",
      "date": "2024-01-01T00:00:00.000Z",
      "slot": "breakfast",
      "recipeId": "uuid",
      "servingsCount": 1.5,
      "recipe": { ... }
    }
  ]
}
```

---

#### POST /meal-plans
Create a new meal plan.

**Request Body:**
```json
{
  "weekStart": "2024-01-01T00:00:00.000Z",
  "goalsKcal": 14000,
  "goalsProtein": 700,
  "goalsFat": 350,
  "goalsCarbs": 1750,
  "mealsPerDay": 3
}
```

**Response:** Same as GET /meal-plans/:id (without entries)

---

#### PUT /meal-plans/:id
Update meal plan goals.

**Request Body:** Same as POST /meal-plans (all fields optional)

**Response:** Same as GET /meal-plans/:id (without entries)

---

#### DELETE /meal-plans/:id
Delete a meal plan (cascades to entries).

**Response:** 204 No Content

---

#### POST /meal-plans/:id/generate
Generate meal plan entries using the algorithm.

**Response:**
```json
{
  "entries": [
    {
      "id": "uuid",
      "mealPlanId": "uuid",
      "date": "2024-01-01T00:00:00.000Z",
      "slot": "breakfast",
      "recipeId": "uuid",
      "servingsCount": 1.5,
      "recipe": { ... }
    }
  ]
}
```

---

#### POST /meal-plans/:id/entries
Add or update a meal entry.

**Request Body:**
```json
{
  "date": "2024-01-01T00:00:00.000Z",
  "slot": "breakfast",
  "recipeId": "uuid",
  "servingsCount": 1.5
}
```

**Response:** Same as entry object above

---

#### DELETE /meal-plans/:id/entries/:entryId
Delete a meal entry.

**Response:** 204 No Content

---

#### GET /meal-plans/:id/shopping-list
Get aggregated shopping list for the meal plan.

**Response:**
```json
{
  "shoppingList": [
    {
      "name": "Tomato",
      "unit": "pieces",
      "totalQuantity": 6.0
    }
  ]
}
```

---

#### GET /meal-plans/:id/export/pdf
Export meal plan as PDF.

**Response:** PDF file download

---

#### GET /meal-plans/:id/export/csv
Export meal plan as CSV.

**Response:** CSV file download

**CSV Format:**
```csv
Date,Slot,Recipe,Servings,Kcal,Protein (g),Fat (g),Carbs (g)
2024-01-01,breakfast,Recipe Name,1.5,525,37.5,15.0,52.5
```

---

### Taxonomy

#### GET /tags
Get all available tags.

**Response:**
```json
{
  "tags": ["breakfast", "lunch", "dinner", "vegetarian", ...]
}
```

---

#### GET /categories
Get all categories.

**Response:**
```json
{
  "categories": ["Main Course", "Salad", "Soup", "Dessert", ...]
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `RECIPE_NOT_FOUND` | 404 | Recipe does not exist |
| `MEAL_PLAN_NOT_FOUND` | 404 | Meal plan does not exist |
| `MEAL_ENTRY_NOT_FOUND` | 404 | Meal entry does not exist |
| `NO_FILE` | 400 | No file uploaded |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Request Headers

Standard requests don't require special headers, but for file uploads:

```
Content-Type: multipart/form-data
```

---

## Pagination

For endpoints that support pagination, use `page` and `limit` query parameters:
- `page`: Page number (starts at 1)
- `limit`: Items per page (max 100)

Example: `GET /recipes?page=2&limit=25`


