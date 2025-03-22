import { afterEach, beforeEach, describe } from 'bun:test';
import { resetDB, createDB } from '../../helpers';
import { expect, it } from 'bun:test';
import { db } from '../../db';
import { eq } from 'drizzle-orm';
import {
  recipesTable,
  recipeInstructionsTable,
  ingredientsTable,
  recipeDietaryRestrictionsTable,
  recipeNutritionalInfoTable,
} from '../../db/schema/application';
import type {
  RecipeDetailsRequest,
  Recipe,
  RecipeDetails,
} from '../../common/schema';

import { handle as getRecipeDetails } from '../../handlers/getRecipeDetails.ts';

describe('', () => {
  beforeEach(async () => {
    await createDB();
  });

  afterEach(async () => {
    await resetDB();
  });

  it('should return recipe details for a valid recipe ID', async () => {
    // Setup: Insert a recipe and related data
    const recipeId = 'test-recipe-123';

    // Insert recipe
    await db.insert(recipesTable).values({
      id: recipeId,
      name: 'Test Recipe',
      prepTime: 1800, // 30 minutes in seconds
      cookTime: 2400, // 40 minutes in seconds
      servings: 4,
      cuisineType: 'Italian',
      mealType: 'Dinner',
      difficultyLevel: 'Medium',
    });

    // Insert ingredients
    await db.insert(ingredientsTable).values([
      {
        recipeId,
        name: 'Pasta',
        quantity: '500',
        unit: 'g',
      },
      {
        recipeId,
        name: 'Tomato Sauce',
        quantity: '300',
        unit: 'ml',
      },
    ]);

    // Insert instructions
    await db.insert(recipeInstructionsTable).values([
      {
        recipeId,
        stepNumber: 1,
        instruction: 'Boil water in a large pot.',
      },
      {
        recipeId,
        stepNumber: 2,
        instruction: 'Add pasta and cook for 8-10 minutes.',
      },
    ]);

    // Insert dietary restrictions
    await db.insert(recipeDietaryRestrictionsTable).values([
      {
        recipeId,
        dietaryRestriction: 'Vegetarian',
      },
    ]);

    // Insert nutritional info
    await db.insert(recipeNutritionalInfoTable).values({
      recipeId,
      nutritionalInfo: 'Calories: 450kcal, Protein: 12g, Carbs: 70g, Fat: 10g',
    });

    // Execute the function being tested
    const request: RecipeDetailsRequest = { recipeId };
    const result = await getRecipeDetails(request);

    // Assert response structure and content
    expect(result).toBeDefined();
    expect(result.recipe).toBeDefined();
    expect(result.recipe.id).toBe(recipeId);
    expect(result.recipe.name).toBe('Test Recipe');
    expect(result.recipe.servings).toBe(4);
    expect(result.recipe.cuisineType).toBe('Italian');
    expect(result.recipe.mealType).toBe('Dinner');

    // Check ingredients
    expect(result.recipe.ingredients).toHaveLength(2);
    expect(result.recipe.ingredients[0].name).toBe('Pasta');
    expect(result.recipe.ingredients[0].quantity).toBe('500');
    expect(result.recipe.ingredients[0].unit).toBe('g');

    // Check instructions
    expect(result.instructions).toHaveLength(2);
    expect(result.instructions[0]).toBe('Boil water in a large pot.');
    expect(result.instructions[1]).toBe('Add pasta and cook for 8-10 minutes.');

    // Check dietary restrictions
    expect(result.recipe.dietaryTags).toHaveLength(1);
    expect(result.recipe.dietaryTags[0]).toBe('Vegetarian');

    // Check nutritional info
    expect(result.nutritionalInfo).toBe(
      'Calories: 450kcal, Protein: 12g, Carbs: 70g, Fat: 10g'
    );
  });

  it('should handle recipe with no nutritional information', async () => {
    // Setup: Insert a recipe without nutritional info
    const recipeId = 'test-recipe-no-nutrition';

    // Insert basic recipe
    await db.insert(recipesTable).values({
      id: recipeId,
      name: 'Simple Recipe',
      prepTime: 900, // 15 minutes
      cookTime: 1200, // 20 minutes
      servings: 2,
      cuisineType: 'American',
      mealType: 'Lunch',
      difficultyLevel: 'Easy',
    });

    // Insert ingredients
    await db.insert(ingredientsTable).values({
      recipeId,
      name: 'Bread',
      quantity: '2',
      unit: 'slices',
    });

    // Insert instructions
    await db.insert(recipeInstructionsTable).values({
      recipeId,
      stepNumber: 1,
      instruction: 'Toast the bread.',
    });

    // No nutritional info inserted

    // Execute the function being tested
    const request: RecipeDetailsRequest = { recipeId };
    const result = await getRecipeDetails(request);

    // Assert response
    expect(result).toBeDefined();
    expect(result.recipe.id).toBe(recipeId);
    expect(result.recipe.name).toBe('Simple Recipe');
    expect(result.nutritionalInfo).toBeUndefined();
  });

  it("should throw an error when recipe ID doesn't exist", async () => {
    const nonExistentRecipeId = 'non-existent-recipe';
    const request: RecipeDetailsRequest = { recipeId: nonExistentRecipeId };

    await expect(getRecipeDetails(request)).rejects.toThrow();
  });

  it('should correctly format date strings for prep and cook times', async () => {
    const recipeId = 'test-recipe-times';

    // Insert recipe with specific times
    await db.insert(recipesTable).values({
      id: recipeId,
      name: 'Timed Recipe',
      prepTime: 1800, // 30 minutes
      cookTime: 3600, // 60 minutes
      servings: 4,
      cuisineType: 'French',
      mealType: 'Dinner',
      difficultyLevel: 'Medium',
    });

    // Basic required data
    await db.insert(ingredientsTable).values({
      recipeId,
      name: 'Basic Ingredient',
      quantity: '1',
      unit: 'cup',
    });

    await db.insert(recipeInstructionsTable).values({
      recipeId,
      stepNumber: 1,
      instruction: 'Basic instruction.',
    });

    // Execute function
    const request: RecipeDetailsRequest = { recipeId };
    const result = await getRecipeDetails(request);

    // Check that prepTime and cookTime are properly formatted as date strings
    expect(result.recipe.prepTime).toBeDefined();
    expect(result.recipe.cookTime).toBeDefined();

    // Verify the date objects can be created (valid ISO strings)
    const prepTimeDate = new Date(result.recipe.prepTime);
    const cookTimeDate = new Date(result.recipe.cookTime);

    expect(prepTimeDate instanceof Date).toBe(true);
    expect(cookTimeDate instanceof Date).toBe(true);
    expect(isNaN(prepTimeDate.getTime())).toBe(false);
    expect(isNaN(cookTimeDate.getTime())).toBe(false);
  });

  it('should return all dietary restrictions associated with a recipe', async () => {
    const recipeId = 'multi-diet-recipe';

    // Insert recipe
    await db.insert(recipesTable).values({
      id: recipeId,
      name: 'Multi-Diet Recipe',
      prepTime: 600,
      cookTime: 900,
      servings: 2,
      cuisineType: 'Mediterranean',
      mealType: 'Lunch',
      difficultyLevel: 'Easy',
    });

    // Insert minimal required data
    await db.insert(ingredientsTable).values({
      recipeId,
      name: 'Vegetable',
      quantity: '1',
      unit: 'cup',
    });

    await db.insert(recipeInstructionsTable).values({
      recipeId,
      stepNumber: 1,
      instruction: 'Cook vegetables.',
    });

    // Insert multiple dietary restrictions
    await db.insert(recipeDietaryRestrictionsTable).values([
      {
        recipeId,
        dietaryRestriction: 'Vegan',
      },
      {
        recipeId,
        dietaryRestriction: 'GlutenFree',
      },
      {
        recipeId,
        dietaryRestriction: 'DairyFree',
      },
    ]);

    // Execute function
    const request: RecipeDetailsRequest = { recipeId };
    const result = await getRecipeDetails(request);

    // Check dietary restrictions
    expect(result.recipe.dietaryTags).toHaveLength(3);
    expect(result.recipe.dietaryTags).toContain('Vegan');
    expect(result.recipe.dietaryTags).toContain('GlutenFree');
    expect(result.recipe.dietaryTags).toContain('DairyFree');
  });
});
