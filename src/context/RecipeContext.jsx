import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';

const RecipeContext = createContext();
export const useRecipe = () => useContext(RecipeContext);

const translateText = async (text, targetLang = 'uz') => {
  if (!text) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0][0][0];
  } catch (error) {
    return text;
  }
};

const translateRecipe = async (recipe) => {
  const translatedName = await translateText(recipe.name);
  const translatedCategory = await translateText(recipe.category);
  const translatedInstructions = await translateText(recipe.instructions);
  const translatedIngredients = await Promise.all(recipe.ingredients.map(ing => translateText(ing)));
  return { ...recipe, name: translatedName, category: translatedCategory, instructions: translatedInstructions, ingredients: translatedIngredients };
};

const extractIngredients = (meal) => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push(`${measure ? measure.trim() : ''} ${ing.trim()}`.trim());
  }
  return ingredients;
};

// 150+ retsept olish uchun 8 ta kategoriya (har biridan 20 tadan = 160 ta)
const CATEGORIES = ['Beef', 'Chicken', 'Dessert', 'Pasta', 'Seafood', 'Vegetarian', 'Breakfast', 'Miscellaneous'];

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [translatedCache, setTranslatedCache] = useState({});

  // LocalStorage dan yuklash
  useEffect(() => {
    const savedRecipes = localStorage.getItem('cachedRecipes');
    const savedTranslations = localStorage.getItem('translatedCache');
    const savedFavorites = localStorage.getItem('favorites');
    if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
    if (savedTranslations) setTranslatedCache(JSON.parse(savedTranslations));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    if (recipes.length) localStorage.setItem('cachedRecipes', JSON.stringify(recipes));
    if (Object.keys(translatedCache).length) localStorage.setItem('translatedCache', JSON.stringify(translatedCache));
  }, [favorites, recipes, translatedCache]);

  // Retseptlarni yuklash (faqat bir marta)
  useEffect(() => {
    if (recipes.length > 0) {
      setLoading(false);
      return;
    }
    const fetchAllRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Kategoriyalarni parallel yuklash
        const categoryPromises = CATEGORIES.map(async (cat) => {
          const res = await fetch(`/api/filter.php?c=${cat}`);
          const data = await res.json();
          return data.meals ? data.meals.slice(0, 20).map(meal => ({ ...meal, category: cat })) : [];
        });
        const allCategoryMeals = (await Promise.all(categoryPromises)).flat();
        
        // 2. Har bir retseptning to‘liq ma'lumotlarini olish (parallel, id bo‘yicha)
        const detailedMeals = await Promise.all(
          allCategoryMeals.map(async (meal) => {
            const res = await fetch(`/api/lookup.php?i=${meal.idMeal}`);
            const data = await res.json();
            return data.meals ? data.meals[0] : meal;
          })
        );
        
        // 3. Formatlash va nom/rasm mosligini tekshirish
        const formatted = detailedMeals
          .filter(meal => meal && meal.strMeal && meal.strMealThumb) // to‘liq bo‘lmaganlarni tashlash
          .map(meal => ({
            id: meal.idMeal,
            name: meal.strMeal,
            category: meal.strCategory || 'Other',
            ingredients: extractIngredients(meal),
            instructions: meal.strInstructions || 'Tayyorlanish maʼlumoti mavjud emas',
            image: meal.strMealThumb,
            prepTime: '30-60 min',
            area: meal.strArea,
            youtube: meal.strYoutube,
          }));
        
        setRecipes(formatted);
      } catch (err) {
        console.error(err);
        setError('Retseptlarni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };
    fetchAllRecipes();
  }, [recipes.length]);

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