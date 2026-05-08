import React from 'react';
import { RecipeProvider, useRecipe } from './context/RecipeContext';
import FilterBar from './components/FilterBar';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import './App.css';

const RecipeList = () => {
  const { filteredRecipes, favorites, loading, error } = useRecipe();
  const favoriteRecipes = filteredRecipes.filter(r => favorites.includes(r.id));
  const otherRecipes = filteredRecipes.filter(r => !favorites.includes(r.id));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Retseptlar yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (filteredRecipes.length === 0) {
    return (
      <div className="no-results">
        <p>😔 Hech qanday retsept topilmadi</p>
        <p>Boshqa so'zlar bilan qidirib ko'ring</p>
      </div>
    );
  }

  return (
    <>
      <FilterBar />
      <div className="recipes-container">
        {favoriteRecipes.length > 0 && (
          <section>
            <h2>⭐ Sevimli retseptlar</h2>
            <div className="recipes-grid">
              {favoriteRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        )}
        
        {otherRecipes.length > 0 && (
          <section>
            <h2>🍽 Barcha retseptlar</h2>
            <div className="recipes-grid">
              {otherRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

function App() {
  return (
    <RecipeProvider>
      <div className="app">
        <header>
          <h1>🍽 Retseptlar dunyosi</h1>
          <p>TheMealDB API dan haqiqiy retseptlarni kashf eting</p>
        </header>
        <main>
          <RecipeList />
        </main>
        <footer>
          <p>© 2025 Retsept ilovasi | Ma'lumotlar TheMealDB dan olingan</p>
        </footer>
        <RecipeModal />
      </div>
    </RecipeProvider>
  );
}

export default App;