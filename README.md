# Recipe & Meal Planning Application

A full-stack web application for managing recipes and planning weekly meals based on macro-nutritional goals (calories, protein, fat, carbs).

## Features

### Recipe Management
- **CRUD operations** for recipes
- **Detailed recipe information**: ingredients, cooking steps, nutrition values per serving
- **Advanced filtering**: search by name, filter by tags, categories, and macro-nutrient ranges
- **Image upload**: JPEG/PNG images with automatic resizing
- **Tags and categories** for organization

### Meal Planning
- **Weekly meal planner**: plan meals for 7 days
- **Customizable goals**: set weekly targets for calories, protein, fat, and carbs
- **Intelligent menu generation**: greedy algorithm that selects recipes to minimize deviation from goals
- **Flexible meal slots**: breakfast, lunch, dinner, and up to 3 snacks per day
- **Progress tracking**: visual progress bars and percentage deviations

### Export & Shopping
- **PDF export**: formatted weekly meal plan with daily and weekly totals
- **CSV export**: spreadsheet-friendly format for meal tracking
- **Shopping list**: aggregated ingredients across all meals with quantities

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **TanStack Query** (React Query) for data fetching
- **React Hook Form** + **Zod** for forms and validation
- **TailwindCSS** for styling
- **Lucide React** for icons

### Backend
- **Node.js 18+** with TypeScript
- **Express.js** for API server
- **Prisma ORM** for database access
- **PostgreSQL 14+** for data storage
- **Zod** for request validation
- **Pino** for logging
- **Multer** + **Sharp** for image handling
- **PDFKit** for PDF generation

### Testing
- **Vitest** for unit tests

## Requirements

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn package manager

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/hayyo-o/meal-planner.git
cd BakPraceCode
```

### 2. Install dependencies

**Backend:**
```bash
cd app/api
npm install
```

**Frontend:**
```bash
cd ../web
npm install
```

**Database:**
```bash
cd ../db
npm install
```

### 3. Set up PostgreSQL database

Create a new database:
```bash
createdb recipe_meal_planner
```

Or using psql:
```bash
psql -U postgres
CREATE DATABASE recipe_meal_planner;
\q
```

### 4. Configure environment variables

**Backend** (`app/api/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/recipe_meal_planner?schema=public"
PORT=3001
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Database** (`app/db/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/recipe_meal_planner?schema=public"
```

Replace `user`, `password`, and `localhost:5432` with your PostgreSQL credentials.

### 5. Run database migrations

```bash
cd app/db
npx prisma migrate dev --name init
```

This creates the database schema.

### 6. Seed demo data

```bash
cd app/db
npm run db:seed
```

This populates the database with 17 sample recipes (more can be added as needed).

### 7. Generate Prisma client

**Important:** Prisma Client must be generated before starting the API server. Run this command from the `app/api` directory:

```bash
cd app/api
npm run prisma:generate
```

This will generate the Prisma Client in the API's `node_modules`, making it available for the API server to use.

**Note:** The Prisma Client is also automatically generated when you install dependencies in `app/api` (via postinstall script), but you may need to run this command manually if the client is not found.

### 8. Start the development servers

**Backend** (Terminal 1):
```bash
cd app/api
npm run dev
```

The API will be available at http://localhost:3001

**Frontend** (Terminal 2):
```bash
cd app/web
npm run dev
```

The web app will be available at http://localhost:5173

## Project Structure

```
BakPraceCode/
├── app/
│   ├── api/               # Backend API (Node.js + Express)
│   │   ├── src/
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── routes/        # API route definitions
│   │   │   ├── services/      # Business logic (meal plan generator)
│   │   │   ├── middleware/    # Error handling, logging, validation
│   │   │   ├── utils/         # Utilities (logger, db client)
│   │   │   └── validations/   # Zod validation schemas
│   │   ├── uploads/           # Uploaded images
│   │   └── package.json
│   ├── web/               # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── pages/         # Page components
│   │   │   ├── api/           # API client and React Query hooks
│   │   │   ├── types/         # TypeScript types
│   │   │   └── hooks/         # Custom React hooks
│   │   └── package.json
│   ├── db/                # Database (Prisma)
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   └── seed.ts        # Seed data
│   │   └── package.json
│   └── shared/            # Shared TypeScript types
│       └── types.ts
├── docs/                  # Documentation
└── README.md
```

## API Documentation

### Base URL
`http://localhost:3001/api`

### Recipes

- `GET /recipes` - List recipes with filtering and pagination
  - Query params: `query`, `tags`, `category`, `minKcal`, `maxKcal`, `minProtein`, `maxProtein`, `minFat`, `maxFat`, `minCarbs`, `maxCarbs`, `page`, `limit`
- `GET /recipes/:id` - Get recipe by ID
- `POST /recipes` - Create new recipe
- `PUT /recipes/:id` - Update recipe
- `DELETE /recipes/:id` - Delete recipe
- `POST /recipes/:id/image` - Upload recipe image

### Meal Plans

- `GET /meal-plans` - List all meal plans
- `GET /meal-plans/:id` - Get meal plan with entries
- `POST /meal-plans` - Create new meal plan
- `PUT /meal-plans/:id` - Update meal plan goals
- `DELETE /meal-plans/:id` - Delete meal plan
- `POST /meal-plans/:id/generate` - Generate meal plan entries
- `POST /meal-plans/:id/entries` - Add/update meal entry
- `DELETE /meal-plans/:id/entries/:entryId` - Delete meal entry
- `GET /meal-plans/:id/shopping-list` - Get aggregated shopping list
- `GET /meal-plans/:id/export/pdf` - Export meal plan as PDF
- `GET /meal-plans/:id/export/csv` - Export meal plan as CSV

### Taxonomy

- `GET /tags` - Get all available tags
- `GET /categories` - Get all categories

## Algorithm

The meal plan generator uses a **greedy algorithm with local optimization**:

1. Calculate macro-distance score for each recipe relative to weekly goals
2. Sort recipes by score (lower is better)
3. Assign recipes to free slots, starting with best matches
4. Try different serving sizes (0.5, 1.0, 1.5, 2.0) to minimize deviation
5. Apply local optimization by swapping adjacent recipes

The objective function minimizes weighted deviation:
```
wK * |Σkcal - goal| + wP * |Σprotein - goal| + wF * |Σfat - goal| + wC * |Σcarbs - goal|
```

## Testing

Run backend tests:
```bash
cd app/api
npm test
```

Run tests with coverage:
```bash
cd app/api
npm run test:coverage
```

## Known Limitations

1. **No authentication**: Application is designed for single-user local use. No user registration, login, or multi-user support.
2. **Simplified algorithm**: Uses greedy approach with basic optimization. For more complex requirements, consider constraint programming or linear optimization.
3. **Local image storage**: Images are stored on the filesystem. For production, consider cloud storage (AWS S3, Cloudinary, etc.).
4. **No auto-calculation of macros**: Users must manually enter nutritional values. Automatic calculation from ingredients is not supported.
5. **Limited data validation**: Some edge cases in meal plan generation may not be handled (e.g., insufficient recipes, extreme goals).

## Future Enhancements

- User authentication and multi-user support
- Recipe import from external APIs
- Automatic macro calculation from ingredients
- More sophisticated optimization algorithms
- Meal prep templates
- Nutritional analysis and recommendations
- Mobile app
- Social features (sharing recipes/plans)

## License

MIT

## Author

Pavel Liapin


