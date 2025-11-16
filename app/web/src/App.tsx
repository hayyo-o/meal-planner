import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RecipeList from './pages/RecipeList';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import MealPlanList from './pages/MealPlanList';
import MealPlanForm from './pages/MealPlanForm';
import MealPlanView from './pages/MealPlanView';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RecipeList />} />
        <Route path="/recipes/new" element={<RecipeForm />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/recipes/:id/edit" element={<RecipeForm />} />
        <Route path="/meal-plans" element={<MealPlanList />} />
        <Route path="/meal-plans/new" element={<MealPlanForm />} />
        <Route path="/meal-plans/:id" element={<MealPlanView />} />
      </Routes>
    </Layout>
  );
}

export default App;


