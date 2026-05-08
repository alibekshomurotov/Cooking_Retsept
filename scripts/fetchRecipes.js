// scripts/fetchRecipes.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = [
  'Beef', 'Chicken', 'Dessert', 'Pasta', 
  'Seafood', 'Vegetarian', 'Breakfast', 'Miscellaneous'
];

const fetchRecipes = async () => {
  console.log('🔄 Yuklanmoqda...');
  let allMeals = [];

  for (const cat of CATEGORIES) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`);
    const data = await res.json();
    if (data.meals) {
      const mealsWithCat = data.meals.slice(0, 20).map(meal => ({ ...meal, category: cat }));
      allMeals.push(...mealsWithCat);
    }
  }

  const detailedMeals = await Promise.all(
    allMeals.map(async (meal) => {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
      const data = await res.json();
      return data.meals ? data.meals[0] : meal;
    })
  );

  const extractIngredients = (meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) ingredients.push(`${measure ? measure.trim() : ''} ${ing.trim()}`.trim());
    }
    return ingredients;
  };

  const formatted = detailedMeals
    .filter(meal => meal && meal.strMeal && meal.strMealThumb)
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

  // Faylga yozish
  const outputPath = path.join(__dirname, '../src/data/recipes.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2));
  console.log(`✅ ${formatted.length} ta retsept saqlandi: ${outputPath}`);
};

fetchRecipes().catch(err => {
  console.error('Xatolik:', err);
  process.exit(1);
});
