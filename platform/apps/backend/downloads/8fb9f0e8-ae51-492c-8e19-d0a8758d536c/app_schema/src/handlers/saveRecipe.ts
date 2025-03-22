import { db } from '../db';
import { type SaveRecipeRequest } from '../common/schema';
import { saveRecipe } from '../common/schema';
import {
  recipesTable,
  ingredientsTable,
  recipeDietaryRestrictionsTable,
  recipeNutritionalInfoTable,
} from '../db/schema/application';

export const handle: typeof saveRecipe = async (
  options: SaveRecipeRequest
): Promise<void> => {
  const { recipe } = options;

  // Start a transaction to ensure all operations succeed or fail together
  await db.transaction(async (tx) => {
    // Insert the main recipe
    const [savedRecipe] = await tx
      .insert(recipesTable)
      .values({
        id: recipe.id,
        name: recipe.name,
        prepTime: recipe.prepTime.getTime() / 1000, // Convert to seconds for storage
        cookTime: recipe.cookTime.getTime() / 1000, // Convert to seconds for storage
        servings: recipe.servings,
        cuisineType: recipe.cuisineType,
        mealType: recipe.mealType,
        difficultyLevel: recipe.difficultyLevel,
      })
      .returning();

    // Insert all ingredients
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      await tx.insert(ingredientsTable).values(
        recipe.ingredients.map((ingredient) => ({
          recipeId: savedRecipe.id,
          name: ingredient.name,
          quantity: ingredient.quantity || null,
          unit: ingredient.unit || null,
        }))
      );
    }

    // Insert dietary restrictions
    if (recipe.dietaryTags && recipe.dietaryTags.length > 0) {
      await tx.insert(recipeDietaryRestrictionsTable).values(
        recipe.dietaryTags.map((restriction) => ({
          recipeId: savedRecipe.id,
          dietaryRestriction: restriction,
        }))
      );
    }
  });
};
