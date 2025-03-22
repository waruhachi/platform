import { afterEach, beforeEach, describe } from 'bun:test';
import { resetDB, createDB } from '../../helpers';
import { expect, it } from 'bun:test';
import { db } from '../../db';
import {
  recipesTable,
  ingredientsTable,
  recipeDietaryRestrictionsTable,
  recipeNutritionalInfoTable,
  recipeInstructionsTable,
} from '../../db/schema/application';
import { type SaveRecipeRequest, type Recipe } from '../../common/schema';
import { eq } from 'drizzle-orm';

import { handle as saveRecipe } from '../../handlers/saveRecipe.ts';

describe('', () => {
  beforeEach(async () => {
    await createDB();
  });

  afterEach(async () => {
    await resetDB();
  });

  it('should save a recipe to the database', async () => {
    // Arrange
    const recipe: Recipe = {
      id: 'test-recipe-id',
      name: 'Test Recipe',
      ingredients: [
        { name: 'Test Ingredient', quantity: '200', unit: 'g' },
        { name: 'Another Ingredient', quantity: '1', unit: 'cup' },
      ],
      prepTime: new Date('1970-01-01T00:10:00.000Z'), // 10 minutes
      cookTime: new Date('1970-01-01T00:20:00.000Z'), // 20 minutes
      servings: 4,
      dietaryTags: ['Vegetarian', 'GlutenFree'],
      cuisineType: 'Italian',
      mealType: 'Dinner',
      difficultyLevel: 'Medium',
    };

    const request: SaveRecipeRequest = { recipe };

    // Act
    await saveRecipe(request);

    // Assert
    const savedRecipes = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.id, recipe.id));
    expect(savedRecipes).toHaveLength(1);
    expect(savedRecipes[0].name).toBe('Test Recipe');
    expect(savedRecipes[0].cuisineType).toBe('Italian');
    expect(savedRecipes[0].mealType).toBe('Dinner');
    expect(savedRecipes[0].difficultyLevel).toBe('Medium');
    expect(savedRecipes[0].servings).toBe(4);
  });

  it('should save recipe ingredients to the database', async () => {
    // Arrange
    const recipe: Recipe = {
      id: 'test-recipe-id',
      name: 'Test Recipe',
      ingredients: [
        { name: 'Test Ingredient', quantity: '200', unit: 'g' },
        { name: 'Another Ingredient', quantity: '1', unit: 'cup' },
      ],
      prepTime: new Date('1970-01-01T00:10:00.000Z'),
      cookTime: new Date('1970-01-01T00:20:00.000Z'),
      servings: 4,
      dietaryTags: ['Vegetarian'],
      cuisineType: 'Italian',
      mealType: 'Dinner',
      difficultyLevel: 'Medium',
    };

    const request: SaveRecipeRequest = { recipe };

    // Act
    await saveRecipe(request);

    // Assert
    const savedIngredients = await db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.recipeId, recipe.id));
    expect(savedIngredients).toHaveLength(2);
    expect(savedIngredients[0].name).toBe('Test Ingredient');
    expect(savedIngredients[0].quantity).toBe('200');
    expect(savedIngredients[0].unit).toBe('g');
    expect(savedIngredients[1].name).toBe('Another Ingredient');
    expect(savedIngredients[1].quantity).toBe('1');
    expect(savedIngredients[1].unit).toBe('cup');
  });

  it('should save dietary restrictions to the database', async () => {
    // Arrange
    const recipe: Recipe = {
      id: 'test-recipe-id',
      name: 'Test Recipe',
      ingredients: [{ name: 'Test Ingredient' }],
      prepTime: new Date('1970-01-01T00:10:00.000Z'),
      cookTime: new Date('1970-01-01T00:20:00.000Z'),
      servings: 4,
      dietaryTags: ['Vegetarian', 'GlutenFree', 'DairyFree'],
      cuisineType: 'Italian',
      mealType: 'Dinner',
      difficultyLevel: 'Medium',
    };

    const request: SaveRecipeRequest = { recipe };

    // Act
    await saveRecipe(request);

    // Assert
    const savedRestrictions = await db
      .select()
      .from(recipeDietaryRestrictionsTable)
      .where(eq(recipeDietaryRestrictionsTable.recipeId, recipe.id));
    expect(savedRestrictions).toHaveLength(3);

    const restrictionTypes = savedRestrictions.map((r) => r.dietaryRestriction);
    expect(restrictionTypes).toContain('Vegetarian');
    expect(restrictionTypes).toContain('GlutenFree');
    expect(restrictionTypes).toContain('DairyFree');
  });

  it('should convert date times to seconds when saving', async () => {
    // Arrange
    const recipe: Recipe = {
      id: 'test-recipe-id',
      name: 'Test Recipe',
      ingredients: [{ name: 'Test Ingredient' }],
      prepTime: new Date('1970-01-01T00:15:00.000Z'), // 15 minutes
      cookTime: new Date('1970-01-01T00:30:00.000Z'), // 30 minutes
      servings: 4,
      dietaryTags: ['Vegetarian'],
      cuisineType: 'Italian',
      mealType: 'Dinner',
      difficultyLevel: 'Medium',
    };

    const request: SaveRecipeRequest = { recipe };

    // Act
    await saveRecipe(request);

    // Assert
    const savedRecipes = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.id, recipe.id));
    expect(savedRecipes).toHaveLength(1);
    expect(savedRecipes[0].prepTime).toBe(900); // 15 minutes in seconds
    expect(savedRecipes[0].cookTime).toBe(1800); // 30 minutes in seconds
  });

  it('should handle empty dietary tags', async () => {
    // Arrange
    const recipe: Recipe = {
      id: 'test-recipe-id',
      name: 'Test Recipe',
      ingredients: [{ name: 'Test Ingredient' }],
      prepTime: new Date('1970-01-01T00:10:00.000Z'),
      cookTime: new Date('1970-01-01T00:20:00.000Z'),
      servings: 4,
      dietaryTags: [],
      cuisineType: 'Italian',
      mealType: 'Dinner',
      difficultyLevel: 'Easy',
    };

    const request: SaveRecipeRequest = { recipe };

    // Act
    await saveRecipe(request);

    // Assert
    const savedRecipes = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.id, recipe.id));
    expect(savedRecipes).toHaveLength(1);

    const savedRestrictions = await db
      .select()
      .from(recipeDietaryRestrictionsTable)
      .where(eq(recipeDietaryRestrictionsTable.recipeId, recipe.id));
    expect(savedRestrictions).toHaveLength(0);
  });

  it('should update an existing recipe if the ID already exists', async () => {
    // Arrange
    const recipe: Recipe = {
      id: 'test-recipe-id',
      name: 'Original Recipe',
      ingredients: [{ name: 'Original Ingredient' }],
      prepTime: new Date('1970-01-01T00:10:00.000Z'),
      cookTime: new Date('1970-01-01T00:20:00.000Z'),
      servings: 2,
      dietaryTags: ['Vegetarian'],
      cuisineType: 'Italian',
      mealType: 'Lunch',
      difficultyLevel: 'Easy',
    };

    const updatedRecipe: Recipe = {
      id: 'test-recipe-id',
      name: 'Updated Recipe',
      ingredients: [{ name: 'Updated Ingredient' }],
      prepTime: new Date('1970-01-01T00:15:00.000Z'),
      cookTime: new Date('1970-01-01T00:25:00.000Z'),
      servings: 4,
      dietaryTags: ['Vegan'],
      cuisineType: 'French',
      mealType: 'Dinner',
      difficultyLevel: 'Medium',
    };

    // Act
    await saveRecipe({ recipe });
    await saveRecipe({ recipe: updatedRecipe });

    // Assert
    const savedRecipes = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.id, recipe.id));
    expect(savedRecipes).toHaveLength(1);
    expect(savedRecipes[0].name).toBe('Updated Recipe');
    expect(savedRecipes[0].cuisineType).toBe('French');

    const savedIngredients = await db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.recipeId, recipe.id));
    expect(savedIngredients).toHaveLength(1);
    expect(savedIngredients[0].name).toBe('Updated Ingredient');

    const savedRestrictions = await db
      .select()
      .from(recipeDietaryRestrictionsTable)
      .where(eq(recipeDietaryRestrictionsTable.recipeId, recipe.id));
    expect(savedRestrictions).toHaveLength(1);
    expect(savedRestrictions[0].dietaryRestriction).toBe('Vegan');
  });
});
