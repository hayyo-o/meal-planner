import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Plus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Recipe & Meal Planner</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/' || location.pathname.startsWith('/recipes')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Recipes
              </Link>
              <Link
                to="/meal-plans"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname.startsWith('/meal-plans')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Meal Plans</span>
                </div>
              </Link>
              {location.pathname === '/' && (
                <Link
                  to="/recipes/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Recipe
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;


