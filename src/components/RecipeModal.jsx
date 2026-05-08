import React from 'react';
import { useRecipe } from '../context/RecipeContext';

const RecipeModal = React.memo(() => {
  const { selectedRecipe, closeModal, toggleFavorite, favorites } = useRecipe();
  
  if (!selectedRecipe) return null;

  const isFavorite = favorites.includes(selectedRecipe.id);

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={closeModal}>×</button>
        <img src={selectedRecipe.image} alt={selectedRecipe.name} className="modal-image" />
        <h2>{selectedRecipe.name}</h2>
        <p className="category-badge">{selectedRecipe.category} {selectedRecipe.area ? `(${selectedRecipe.area})` : ''}</p>
        <p>🍳 Tayyorlash vaqti: {selectedRecipe.prepTime}</p>
        
        <h3>🥘 Masalliqlar:</h3>
        <ul className="ingredients-list">
          {selectedRecipe.ingredients.map((ing, idx) => (
            <li key={idx}>{ing}</li>
          ))}
        </ul>
        
        <h3>📖 Tayyorlanishi:</h3>
        <p className="instructions">{selectedRecipe.instructions}</p>
        
        {selectedRecipe.youtube && (
          <a href={selectedRecipe.youtube} target="_blank" rel="noopener noreferrer" className="youtube-link">
            🎬 YouTube'da ko'rish
          </a>
        )}
        
        <button 
          onClick={() => toggleFavorite(selectedRecipe.id)}
          className={`modal-fav-btn ${isFavorite ? 'active' : ''}`}
        >
          {isFavorite ? '❤️ Sevimlilardan olish' : '🤍 Sevimlilarga qo‘shish'}
        </button>
      </div>
    </div>
  );
});

export default RecipeModal;