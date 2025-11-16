import { X } from 'lucide-react';

interface RecipeFiltersProps {
  filters: any;
  availableTags: string[];
  availableCategories: string[];
  onFilterChange: (key: string, value: any) => void;
}

const RecipeFilters = ({ filters, availableTags, availableCategories, onFilterChange }: RecipeFiltersProps) => {
  const selectedTags: string[] = filters.tags
    ? filters.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
    : [];
  const selectedCategories: string[] = filters.categories
    ? filters.categories.split(',').map((cat: string) => cat.trim()).filter(Boolean)
    : [];

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onFilterChange('tags', newTags.join(','));
  };

  const clearFilters = () => {
    onFilterChange('query', '');
    onFilterChange('minKcal', '');
    onFilterChange('maxKcal', '');
    onFilterChange('minProtein', '');
    onFilterChange('maxProtein', '');
    onFilterChange('minFat', '');
    onFilterChange('maxFat', '');
    onFilterChange('minCarbs', '');
    onFilterChange('maxCarbs', '');
    onFilterChange('tags', '');
    onFilterChange('categories', '');
  };

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onFilterChange('categories', newCategories.join(','));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onFilterChange('query', e.target.value)}
            placeholder="Search recipes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Calories (per serving)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.minKcal}
              onChange={(e) => onFilterChange('minKcal', e.target.value)}
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="number"
              value={filters.maxKcal}
              onChange={(e) => onFilterChange('maxKcal', e.target.value)}
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Protein (g)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.minProtein}
              onChange={(e) => onFilterChange('minProtein', e.target.value)}
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="number"
              value={filters.maxProtein}
              onChange={(e) => onFilterChange('maxProtein', e.target.value)}
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {selectedCategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selected Categories</label>
            <div className="flex flex-wrap gap-1">
              {selectedCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded hover:bg-primary-200"
                >
                  {category}
                  <X className="w-3 h-3 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {availableCategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {availableCategories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {selectedTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selected Tags</label>
            <div className="flex flex-wrap gap-1">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded hover:bg-primary-200"
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {availableTags.map((tag) => (
              <label key={tag} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{tag}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeFilters;


