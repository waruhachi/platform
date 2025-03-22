import { eq, and, ilike, lte } from 'drizzle-orm';
import { db } from '../db';
import {
  recipesTable,
  recipeDietaryRestrictionsTable,
  savedRecipesTable,
  ingredientsTable,
} from '../db/schema/application';
import {
  searchSavedRecipes,
  type RecipeSearchRequest,
  type Recipe,
} from '../common/schema';

export const handle: typeof searchSavedRecipes = async (
  options: RecipeSearchRequest
): Promise<Recipe[]> => {
  // Start with the base query to get saved recipes
  const baseQuery = db
    .select({
      id: recipesTable.id,
      name: recipesTable.name,
      prepTime: recipesTable.prepTime,
      cookTime: recipesTable.cookTime,
      servings: recipesTable.servings,
      cuisineType: recipesTable.cuisineType,
      mealType: recipesTable.mealType,
      difficultyLevel: recipesTable.difficultyLevel,
    })
    .from(recipesTable)
    .innerJoin(
      savedRecipesTable,
      eq(recipesTable.id, savedRecipesTable.recipeId)
    );

  // Apply filters based on provided options
  const conditions = [];

  // Filter by cuisine type if provided
  if (options.cuisineType) {
    conditions.push(eq(recipesTable.cuisineType, options.cuisineType));
  }

  // Filter by meal type if provided
  if (options.mealType) {
    conditions.push(eq(recipesTable.mealType, options.mealType));
  }

  // Filter by keyword (search in recipe name)
  if (options.keyword) {
    conditions.push(ilike(recipesTable.name, `%${options.keyword}%`));
  }

  // Filter by maximum prep time if provided
  if (options.maxPrepTime) {
    // Convert the Date object to seconds for comparison with the database field
    const maxPrepTimeInSeconds = Math.floor(
      options.maxPrepTime.getTime() / 1000
    );
    conditions.push(lte(recipesTable.prepTime, maxPrepTimeInSeconds));
  }

  // Apply all conditions to the query
  const finalQuery =
    conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  // Execute the query to get the basic recipe data
  const recipes = await finalQuery;

  // Handle dietary restrictions filtering if needed
  if (options.dietaryRestrictions && options.dietaryRestrictions.length > 0) {
    // Get recipes that have all the requested dietary restrictions
    const recipesWithDietaryTags = await Promise.all(
      recipes.map(async (recipe) => {
        const dietaryTags = await db
          .select({
            dietaryRestriction:
              recipeDietaryRestrictionsTable.dietaryRestriction,
          })
          .from(recipeDietaryRestrictionsTable)
          .where(eq(recipeDietaryRestrictionsTable.recipeId, recipe.id));

        return {
          ...recipe,
          dietaryTags: dietaryTags.map((tag) => tag.dietaryRestriction),
        };
      })
    );

    // Filter recipes by dietary restrictions
    const filteredRecipes = recipesWithDietaryTags.filter((recipe) => {
      // If the recipe has all the requested dietary restrictions, include it
      return options.dietaryRestrictions!.every((restriction) =>
        recipe.dietaryTags.includes(restriction)
      );
    });

    // For each recipe, fetch its ingredients
    const recipesWithIngredients = await Promise.all(
      filteredRecipes.map(async (recipe) => {
        const ingredients = await db
          .select({
            name: ingredientsTable.name,
            quantity: ingredientsTable.quantity,
            unit: ingredientsTable.unit,
          })
          .from(ingredientsTable)
          .where(eq(ingredientsTable.recipeId, recipe.id));

        return {
          ...recipe,
          ingredients,
        };
      })
    );

    // Convert database representation to API schema
    return recipesWithIngredients.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      ingredients: recipe.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity || undefined,
        unit: ingredient.unit || undefined,
      })),
      prepTime: new Date(recipe.prepTime * 1000),
      cookTime: new Date(recipe.cookTime * 1000),
      servings: recipe.servings,
      dietaryTags: recipe.dietaryTags,
      cuisineType: recipe.cuisineType,
      mealType: recipe.mealType,
      difficultyLevel: recipe.difficultyLevel,
    }));
  } else {
    // If no dietary restrictions filter, just get ingredients for all recipes
    const recipesWithIngredients = await Promise.all(
      recipes.map(async (recipe) => {
        const ingredients = await db
          .select({
            name: ingredientsTable.name,
            quantity: ingredientsTable.quantity,
            unit: ingredientsTable.unit,
          })
          .from(ingredientsTable)
          .where(eq(ingredientsTable.recipeId, recipe.id));

        const dietaryTags = await db
          .select({
            dietaryRestriction:
              recipeDietaryRestrictionsTable.dietaryRestriction,
          })
          .from(recipeDietaryRestrictionsTable)
          .where(eq(recipeDietaryRestrictionsTable.recipeId, recipe.id));

        return {
          ...recipe,
          ingredients,
          dietaryTags: dietaryTags.map((tag) => tag.dietaryRestriction),
        };
      })
    );

    // Convert database representation to API schema
    return recipesWithIngredients.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      ingredients: recipe.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity || undefined,
        unit: ingredient.unit || undefined,
      })),
      prepTime: new Date(recipe.prepTime * 1000),
      cookTime: new Date(recipe.cookTime * 1000),
      servings: recipe.servings,
      dietaryTags: recipe.dietaryTags,
      cuisineType: recipe.cuisineType,
      mealType: recipe.mealType,
      difficultyLevel: recipe.difficultyLevel,
    }));
  }
};
