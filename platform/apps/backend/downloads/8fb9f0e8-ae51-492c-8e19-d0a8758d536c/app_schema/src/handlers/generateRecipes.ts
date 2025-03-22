import { db } from '../db';
import {
  generateRecipes,
  type RecipeRequest,
  type Recipe,
} from '../common/schema';
import { v4 as uuidv4 } from 'uuid';

export const handle: typeof generateRecipes = async (
  options: RecipeRequest
): Promise<Recipe[]> => {
  // Extract the ingredients and restrictions from the request
  const {
    ingredients,
    dietaryRestrictions,
    cuisineType,
    maxPrepTime,
    mealType,
  } = options;

  // In a real implementation, this would call an external API or use LLM to generate recipes
  // For demonstration purposes, we'll create some mock recipes based on the ingredients

  // Generate a sample difficulty level
  const difficultyLevels = ['Easy', 'Medium', 'Hard', 'Expert'];
  const getRandomDifficulty = (): string => {
    return difficultyLevels[
      Math.floor(Math.random() * difficultyLevels.length)
    ];
  };

  // Generate a default cuisine type if not provided
  const defaultCuisine = cuisineType || 'International';

  // Generate a default meal type if not provided
  const defaultMealType = mealType || 'Main Course';

  // Generate default dietary restrictions if not provided
  const defaultDietaryTags = dietaryRestrictions || ['None'];

  // Generate recipe names based on ingredients
  const generateRecipeName = (ingredientsList: typeof ingredients): string => {
    const mainIngredients = ingredientsList.slice(0, 2).map((i) => i.name);
    const dishTypes = ['Stir Fry', 'Bake', 'Soup', 'Stew', 'Salad'];
    return `${mainIngredients.join(' and ')} ${dishTypes[Math.floor(Math.random() * dishTypes.length)]}`;
  };

  // Function to convert minutes to ISOString format
  const minutesToISOString = (minutes: number): string => {
    return new Date(minutes * 60 * 1000).toISOString();
  };

  // Generate 3 mock recipes with explicit type casting to ensure compatibility
  const mockRecipes = Array(3)
    .fill(null)
    .map((_, index) => {
      const prepTimeMinutes = Math.floor(Math.random() * 30) + 15;
      const cookTimeMinutes = Math.floor(Math.random() * 45) + 20;

      // Create recipe with Date objects created from strings
      const recipe: Recipe = {
        id: uuidv4(),
        name: generateRecipeName(ingredients),
        ingredients: ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity || `${Math.floor(Math.random() * 5) + 1}`,
          unit: ing.unit || 'pieces',
        })),
        // Convert minutes to ISO strings and then to Date objects
        prepTime: new Date(minutesToISOString(prepTimeMinutes)),
        cookTime: new Date(minutesToISOString(cookTimeMinutes)),
        servings: Math.floor(Math.random() * 4) + 2,
        dietaryTags: defaultDietaryTags,
        cuisineType: defaultCuisine,
        mealType: defaultMealType,
        difficultyLevel: getRandomDifficulty(),
      };

      return recipe;
    });

  // Filter recipes based on max prep time if specified
  const filteredRecipes = maxPrepTime
    ? mockRecipes.filter((recipe) => recipe.prepTime <= new Date(maxPrepTime))
    : mockRecipes;

  return filteredRecipes;
};
