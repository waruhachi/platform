import { afterEach, beforeEach, describe } from 'bun:test';
import { resetDB, createDB } from '../../helpers';
import { expect, it, mock } from 'bun:test';

import {
  type Ingredient,
  type RecipeRequest,
  type Recipe,
  type DietaryRestriction,
} from '../../common/schema';

import { handle as generateRecipes } from '../../handlers/generateRecipes.ts';

describe('', () => {
  beforeEach(async () => {
    await createDB();
  });

  afterEach(async () => {
    await resetDB();
  });

  it('should generate recipes from provided ingredients', async () => {
    const request: RecipeRequest = {
      ingredients: [
        { name: 'chicken breast', quantity: '2', unit: 'pieces' },
        { name: 'rice', quantity: '1', unit: 'cup' },
        { name: 'broccoli', quantity: '2', unit: 'cups' },
      ],
    };

    const recipes = await generateRecipes(request);

    expect(Array.isArray(recipes)).toBe(true);
    expect(recipes.length).toBeGreaterThan(0);

    // Verify recipe structure
    const firstRecipe = recipes[0];
    expect(firstRecipe.id).toBeDefined();
    expect(firstRecipe.name).toBeDefined();
    expect(Array.isArray(firstRecipe.ingredients)).toBe(true);
    expect(firstRecipe.prepTime).toBeInstanceOf(Date);
    expect(firstRecipe.cookTime).toBeInstanceOf(Date);
    expect(typeof firstRecipe.servings).toBe('number');
    expect(Array.isArray(firstRecipe.dietaryTags)).toBe(true);
    expect(typeof firstRecipe.cuisineType).toBe('string');
    expect(typeof firstRecipe.mealType).toBe('string');
    expect(typeof firstRecipe.difficultyLevel).toBe('string');
  });

  it('should respect dietary restrictions when generating recipes', async () => {
    const request: RecipeRequest = {
      ingredients: [
        { name: 'tofu', quantity: '1', unit: 'block' },
        { name: 'spinach', quantity: '2', unit: 'cups' },
        { name: 'quinoa', quantity: '1', unit: 'cup' },
      ],
      dietaryRestrictions: ['Vegetarian', 'GlutenFree'],
    };

    const recipes = await generateRecipes(request);

    expect(recipes.length).toBeGreaterThan(0);

    // Check that all recipes respect the dietary restrictions
    for (const recipe of recipes) {
      expect(recipe.dietaryTags).toContain('Vegetarian');
      expect(recipe.dietaryTags).toContain('GlutenFree');
    }
  });

  it('should generate recipes according to specified cuisine type', async () => {
    const cuisineType = 'Italian';
    const request: RecipeRequest = {
      ingredients: [
        { name: 'pasta', quantity: '200', unit: 'g' },
        { name: 'tomatoes', quantity: '4', unit: 'pieces' },
        { name: 'basil', quantity: 'handful', unit: '' },
      ],
      cuisineType,
    };

    const recipes = await generateRecipes(request);

    expect(recipes.length).toBeGreaterThan(0);

    // Check that recipes match the requested cuisine type
    for (const recipe of recipes) {
      expect(recipe.cuisineType).toBe(cuisineType);
    }
  });

  it('should respect max prep time constraint', async () => {
    // Set max prep time to 30 minutes
    const maxPrepTime = new Date(1970, 0, 1, 0, 30, 0);

    const request: RecipeRequest = {
      ingredients: [
        { name: 'eggs', quantity: '4', unit: '' },
        { name: 'bacon', quantity: '200', unit: 'g' },
        { name: 'cheese', quantity: '100', unit: 'g' },
      ],
      maxPrepTime: maxPrepTime.toISOString(),
    };

    const recipes = await generateRecipes(request);

    expect(recipes.length).toBeGreaterThan(0);

    // Check that all recipes respect the max prep time
    for (const recipe of recipes) {
      // Calculate total minutes for comparison
      const recipePrepMinutes =
        recipe.prepTime.getHours() * 60 + recipe.prepTime.getMinutes();
      const maxPrepMinutes =
        maxPrepTime.getHours() * 60 + maxPrepTime.getMinutes();

      expect(recipePrepMinutes).toBeLessThanOrEqual(maxPrepMinutes);
    }
  });

  it('should generate recipes for specified meal type', async () => {
    const mealType = 'Breakfast';
    const request: RecipeRequest = {
      ingredients: [
        { name: 'oats', quantity: '1', unit: 'cup' },
        { name: 'milk', quantity: '2', unit: 'cups' },
        { name: 'banana', quantity: '1', unit: '' },
      ],
      mealType,
    };

    const recipes = await generateRecipes(request);

    expect(recipes.length).toBeGreaterThan(0);

    // Check that recipes match the requested meal type
    for (const recipe of recipes) {
      expect(recipe.mealType).toBe(mealType);
    }
  });

  it('should handle empty ingredient list', async () => {
    const request: RecipeRequest = {
      ingredients: [],
    };

    // We expect either an empty array of recipes or an error
    try {
      const recipes = await generateRecipes(request);
      expect(Array.isArray(recipes)).toBe(true);
      expect(recipes.length).toBe(0);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should handle multiple complex constraints', async () => {
    const request: RecipeRequest = {
      ingredients: [
        { name: 'chicken', quantity: '300', unit: 'g' },
        { name: 'bell pepper', quantity: '2', unit: '' },
        { name: 'onion', quantity: '1', unit: '' },
        { name: 'garlic', quantity: '3', unit: 'cloves' },
      ],
      dietaryRestrictions: ['DairyFree', 'GlutenFree'],
      cuisineType: 'Mexican',
      maxPrepTime: new Date(1970, 0, 1, 0, 45, 0).toISOString(),
      mealType: 'Dinner',
    };

    const recipes = await generateRecipes(request);

    expect(recipes.length).toBeGreaterThan(0);

    // Check that all recipes meet all constraints
    for (const recipe of recipes) {
      // Check dietary restrictions
      expect(recipe.dietaryTags).toContain('DairyFree');
      expect(recipe.dietaryTags).toContain('GlutenFree');

      // Check cuisine type
      expect(recipe.cuisineType).toBe('Mexican');

      // Check meal type
      expect(recipe.mealType).toBe('Dinner');

      // Check prep time (45 minutes max)
      const recipePrepMinutes =
        recipe.prepTime.getHours() * 60 + recipe.prepTime.getMinutes();
      expect(recipePrepMinutes).toBeLessThanOrEqual(45);
    }
  });

  it('should return recipes with all required fields', async () => {
    const request: RecipeRequest = {
      ingredients: [
        { name: 'salmon', quantity: '2', unit: 'fillets' },
        { name: 'lemon', quantity: '1', unit: '' },
        { name: 'dill', quantity: '2', unit: 'tablespoons' },
      ],
    };

    const recipes = await generateRecipes(request);

    expect(recipes.length).toBeGreaterThan(0);

    for (const recipe of recipes) {
      // Verify all required fields are present and have correct types
      expect(recipe.id).toBeTypeOf('string');
      expect(recipe.name).toBeTypeOf('string');
      expect(Array.isArray(recipe.ingredients)).toBe(true);
      recipe.ingredients.forEach((ingredient) => {
        expect(ingredient.name).toBeTypeOf('string');
      });
      expect(recipe.prepTime).toBeInstanceOf(Date);
      expect(recipe.cookTime).toBeInstanceOf(Date);
      expect(typeof recipe.servings).toBe('number');
      expect(Number.isInteger(recipe.servings)).toBe(true);
      expect(Array.isArray(recipe.dietaryTags)).toBe(true);
      expect(recipe.cuisineType).toBeTypeOf('string');
      expect(recipe.mealType).toBeTypeOf('string');
      expect(recipe.difficultyLevel).toBeTypeOf('string');
    }
  });
});
