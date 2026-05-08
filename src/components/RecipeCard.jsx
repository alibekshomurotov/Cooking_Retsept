import React from 'react';
import { useRecipe } from '../context/RecipeContext';

const RecipeCard = React.memo(({ recipe }) => {
  const { toggleFavorite, favorites, openRecipeModal } = useRecipe();
  const isFavorite = favorites.includes(recipe.id);

  return (
    <div className="recipe-card">
      <img src={recipe.image} alt={recipe.name} className="recipe-image" />
      <div className="recipe-info">
        <h3>{recipe.name}</h3>
        <p className="category">{recipe.category}</p>
        <p className="prep-time">⏱️ {recipe.prepTime}</p>
        <div className="card-actions">
          <button onClick={() => openRecipeModal(recipe)} className="view-btn">
            👁️ Ko'rish
          </button>
          <button 
            onClick={() => toggleFavorite(recipe.id)} 
            className={`fav-btn ${isFavorite ? 'active' : ''}`}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default RecipeCard;