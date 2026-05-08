import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import recipesData from '../data/recipes.json'; // mahalliy JSON

const RecipeContext = createContext();
export const useRecipe = () => useContext(RecipeContext);

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [translatedCache, setTranslatedCache] = useState({});

  // Load from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    const savedTranslations = localStorage.getItem('translatedCache');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedTranslations) setTranslatedCache(JSON.parse(savedTranslations));
    setRecipes(recipesData);
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    if (Object.keys(translatedCache).length) localStorage.setItem('translatedCache', JSON.stringify(translatedCache));
  }, [favorites, translatedCache]);

  // translate function (faqat kerak bo‘lganda)
  const translateText = async (text) => {
    if (!text) return '';
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=uz&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data[0][0][0];
    } catch { return text; }
  };

  const translateRecipe = async (recipe) => {
    const [name, category, instructions, ingredients] = await Promise.all([
      translateText(recipe.name),
      translateText(recipe.category),
      translateText(recipe.instructions),
      Promise.all(recipe.ingredients.map(ing => translateText(ing)))
    ]);
    return { ...recipe, name, category, instructions, ingredients };
  };

  const openRecipeModal = useCallback(async (recipe) => {
    if (translatedCache[recipe.id]) {
      setSelectedRecipe(translatedCache[recipe.id]);
      return;
    }
    const translated = await translateRecipe(recipe);
    setTranslatedCache(prev => ({ ...prev, [recipe.id]: translated }));
    setSelectedRecipe(translated);
  }, [translatedCache]);

  const closeModal = useCallback(() => setSelectedRecipe(null), []);
  const handleSearch = useCallback((term) => setSearchTerm(term), []);
  const handleCategoryChange = useCallback((cat) => setSelectedCategory(cat), []);
  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const filteredRecipes = useMemo(() => {
    let result = recipes;
    if (selectedCategory !== 'All') result = result.filter(r => r.category === selectedCategory);
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(lower) || r.ingredients.some(i => i.toLowerCase().includes(lower)));
    }
    return result;
  }, [recipes, searchTerm, selectedCategory]);

  const categoryList = useMemo(() => ['All', ...new Set(recipes.map(r => r.category))], [recipes]);

  const value = {
    loading,
    error,
    filteredRecipes,
    searchTerm,
    selectedCategory,
    favorites,
    selectedRecipe,
    categories: categoryList,
    handleSearch,
    handleCategoryChange,
    toggleFavorite,
    openRecipeModal,
    closeModal,
  };

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
};
