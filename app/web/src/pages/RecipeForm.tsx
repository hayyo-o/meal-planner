import { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRecipe, useCreateRecipe, useUpdateRecipe, useCategories, useTags, uploadRecipeImage } from '../api/recipes';
import { Plus, X } from 'lucide-react';

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  cookTimeMin: z.coerce.number().int().positive('Cook time must be positive'),
  servings: z.coerce.number().int().positive('Servings must be positive'),
  kcalPerServing: z.coerce.number().nonnegative('Calories must be non-negative'),
  proteinPerServing: z.coerce.number().nonnegative('Protein must be non-negative'),
  fatPerServing: z.coerce.number().nonnegative('Fat must be non-negative'),
  carbsPerServing: z.coerce.number().nonnegative('Carbs must be non-negative'),
  ingredients: z.array(z.object({
    name: z.string().min(1, 'Ingredient name is required'),
    quantity: z.coerce.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    note: z.string().optional(),
  })).min(1, 'At least one ingredient required'),
  steps: z.array(z.string().min(1, 'Step description is required')).min(1, 'At least one step required'),
  tags: z.array(z.string()),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

const RecipeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: recipe } = useRecipe(id || '');
  const { data: categories } = useCategories();
  const { data: availableTags } = useTags();
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ingredients: [{ name: '', quantity: 1, unit: '', note: '' }],
      steps: [''],
      tags: [],
    },
  });

const ingredientArray = useFieldArray<RecipeFormData, 'ingredients'>({
  control,
  name: 'ingredients',
});

const stepArray = useFieldArray({
  control,
  name: 'steps' as any,
});

const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = ingredientArray;
const { fields: stepFields, append: appendStep, remove: removeStep } = stepArray;

  useEffect(() => {
    if (recipe) {
      Object.entries(recipe).forEach(([key, value]) => {
        if (['id', 'ownerId', 'createdAt', 'updatedAt', 'imageUrl'].includes(key)) {
          return;
        }
        setValue(key as any, value);
      });
    }
  }, [recipe, setValue]);

  useEffect(() => {
    if (recipe?.imageUrl && !imageFile) {
      setImagePreview(`http://localhost:3001${recipe.imageUrl}`);
    }
  }, [recipe, imageFile]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const onSubmit = async (data: RecipeFormData) => {
    try {
      let recipeId = id;
      if (id) {
        const updated = await updateMutation.mutateAsync({ id, data });
        recipeId = updated.id;
      } else {
        const created = await createMutation.mutateAsync(data);
        recipeId = created.id;
      }

      if (imageFile && recipeId) {
        await uploadRecipeImage(recipeId, imageFile);
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
        queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] });
      }

      navigate('/');
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const selectedTags = watch('tags') || [];

  const toggleTag = (tag: string) => {
    const currentTags = selectedTags as string[];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setValue('tags', newTags, { shouldValidate: true, shouldDirty: true });
  };

  const inputClasses = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:ring-primary-500'
    }`;

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview((prev) => {
        if (prev && prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(file);
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {id ? 'Edit Recipe' : 'Create Recipe'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            {...register('title')}
            className={inputClasses(!!errors.title)}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Image</label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Recipe preview"
              className="w-full max-h-64 object-cover rounded-md mb-3 border"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-600"
          />
          <p className="text-xs text-gray-500 mt-1">JPEG/PNG/WebP, up to 5 MB. The image is saved after the recipe is created.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className={inputClasses(!!errors.description)}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              {...register('category')}
              className={inputClasses(!!errors.category)}
            >
              <option value="">Select category</option>
              {categories?.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Servings</label>
            <input
              type="number"
              {...register('servings')}
              className={inputClasses(!!errors.servings)}
            />
            {errors.servings && <p className="text-red-500 text-sm mt-1">{errors.servings.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cook Time (min)</label>
            <input
              type="number"
              {...register('cookTimeMin')}
              className={inputClasses(!!errors.cookTimeMin)}
            />
            {errors.cookTimeMin && <p className="text-red-500 text-sm mt-1">{errors.cookTimeMin.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags?.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded text-sm ${
                  (selectedTags as string[]).includes(tag)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nutrition (per serving)</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Calories</label>
              <input
                type="number"
                {...register('kcalPerServing')}
                className={inputClasses(!!errors.kcalPerServing)}
              />
              {errors.kcalPerServing && <p className="text-red-500 text-xs mt-1">{errors.kcalPerServing.message}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-600">Protein (g)</label>
              <input
                type="number"
                step="0.01"
                {...register('proteinPerServing')}
                className={inputClasses(!!errors.proteinPerServing)}
              />
              {errors.proteinPerServing && <p className="text-red-500 text-xs mt-1">{errors.proteinPerServing.message}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-600">Fat (g)</label>
              <input
                type="number"
                step="0.01"
                {...register('fatPerServing')}
                className={inputClasses(!!errors.fatPerServing)}
              />
              {errors.fatPerServing && <p className="text-red-500 text-xs mt-1">{errors.fatPerServing.message}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-600">Carbs (g)</label>
              <input
                type="number"
                step="0.01"
                {...register('carbsPerServing')}
                className={inputClasses(!!errors.carbsPerServing)}
              />
              {errors.carbsPerServing && <p className="text-red-500 text-xs mt-1">{errors.carbsPerServing.message}</p>}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Ingredients</label>
            <button
              type="button"
              onClick={() => appendIngredient({ name: '', quantity: 1, unit: '', note: '' })}
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>
          <div className="space-y-2">
            {ingredientFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`ingredients.${idx}.name`)}
                  placeholder="Name"
                  className={inputClasses(!!errors.ingredients?.[idx]?.name)}
                />
                <input
                  type="number"
                  step="0.01"
                  {...register(`ingredients.${idx}.quantity`)}
                  placeholder="Qty"
                  className={inputClasses(!!errors.ingredients?.[idx]?.quantity)}
                />
                <input
                  {...register(`ingredients.${idx}.unit`)}
                  placeholder="Unit"
                  className={inputClasses(!!errors.ingredients?.[idx]?.unit)}
                />
                <input
                  {...register(`ingredients.${idx}.note`)}
                  placeholder="Note (optional)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            {typeof errors.ingredients?.message === 'string' && (
              <p className="text-red-500 text-sm">{errors.ingredients?.message}</p>
            )}
            {Array.isArray(errors.ingredients) &&
              errors.ingredients.map((error, idx) => (
                error ? (
                  <div key={`ingredient-error-${idx}`} className="text-red-500 text-xs">
                    {error.name?.message || error.quantity?.message || error.unit?.message}
                  </div>
                ) : null
              ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Steps</label>
            <button
              type="button"
              onClick={() => appendStep('')}
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>
          <div className="space-y-2">
            {stepFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2">
                <span className="flex-shrink-0 w-8 pt-2 text-gray-600">{idx + 1}.</span>
                <textarea
                  {...register(`steps.${idx}`)}
                  rows={2}
                  className={inputClasses(!!errors.steps?.[idx])}
                />
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            {errors.steps && typeof errors.steps?.message === 'string' && (
              <p className="text-red-500 text-sm">{errors.steps.message}</p>
            )}
            {Array.isArray(errors.steps) &&
              errors.steps.map((error, idx) => (
                error ? (
                  <div key={`steps-error-${idx}`} className="text-red-500 text-xs">
                    {error.message}
                  </div>
                ) : null
              ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            {id ? 'Update Recipe' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;

