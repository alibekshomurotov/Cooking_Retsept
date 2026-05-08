import React from 'react';
import { useRecipe } from '../context/RecipeContext';

const FilterBar = React.memo(() => {
  const { searchTerm, selectedCategory, categories, handleSearch, handleCategoryChange } = useRecipe();

  return (
    <div className="filter-bar">
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Retsept yoki masalliq bo'yicha qidir..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <div className="category-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
});

export default FilterBar;