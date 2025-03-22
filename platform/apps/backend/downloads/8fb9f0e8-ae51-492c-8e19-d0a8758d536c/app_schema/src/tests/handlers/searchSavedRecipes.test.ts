import { afterEach, beforeEach, describe } from 'bun:test';
import { resetDB, createDB } from '../../helpers';
import { expect, it } from 'bun:test';
import { db } from '../../db';
import { eq, and, ilike, lte, inArray } from 'drizzle-orm';
import {
  recipesTable,
  ingredientsTable,
  recipeDietaryRestrictionsTable,
  usersTable,
  savedRecipesTable,
} from '../../db/schema/application';
import type {
  RecipeSearchRequest,
  Recipe,
  DietaryRestriction,
} from '../../common/schema';

import { handle as searchSavedRecipes } from '../../handlers/searchSavedRecipes.ts';

describe('', () => {
  beforeEach(async () => {
    await createDB();
  });

  afterEach(async () => {
    await resetDB();
  });

  it('should return empty array when no saved recipes exist', async () => {
    const options: RecipeSearchRequest = {};
    const recipes = await searchSavedRecipes(options);

    expect(recipes).toBeInstanceOf(Array);
    expect(recipes).toHaveLength(0);
  });

  it('should return all saved recipes when no filters provided', async () => {
    // Setup: Create a user and a saved recipe
    const userId = 'test-user-1';
    await db.insert(usersTable).values({ id: userId }).execute();

    const recipeId = '123e4567-e89b-12d3-a456-426614174000';
    await db
      .insert(recipesTable)
      .values({
        id: recipeId,
        name: 'Test Recipe',
        prepTime: 1800, // 30 minutes in seconds
        cookTime: 2400, // 40 minutes in seconds
        servings: 4,
        cuisineType: 'Italian',
        mealType: 'Dinner',
        difficultyLevel: 'Medium',
      })
      .execute();

    // Add dietary restriction
    await db
      .insert(recipeDietaryRestrictionsTable)
      .values({
        recipeId,
        dietaryRestriction: 'Vegetarian',
      })
      .execute();

    // Save recipe for user
    await db
      .insert(savedRecipesTable)
      .values({
        userId,
        recipeId,
      })
      .execute();

    const options: RecipeSearchRequest = {};
    const recipes = await searchSavedRecipes(options);

    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toBe(recipeId);
    expect(recipes[0].name).toBe('Test Recipe');
  });

  it('should filter recipes by cuisine type', async () => {
    // Setup: Create a user and two saved recipes with different cuisine types
    const userId = 'test-user-2';
    await db.insert(usersTable).values({ id: userId }).execute();

    const italianRecipeId = '123e4567-e89b-12d3-a456-426614174001';
    await db
      .insert(recipesTable)
      .values({
        id: italianRecipeId,
        name: 'Italian Pasta',
        prepTime: 1200,
        cookTime: 1800,
        servings: 4,
        cuisineType: 'Italian',
        mealType: 'Dinner',
        difficultyLevel: 'Easy',
      })
      .execute();

    const mexicanRecipeId = '123e4567-e89b-12d3-a456-426614174002';
    await db
      .insert(recipesTable)
      .values({
        id: mexicanRecipeId,
        name: 'Mexican Tacos',
        prepTime: 1500,
        cookTime: 1200,
        servings: 6,
        cuisineType: 'Mexican',
        mealType: 'Dinner',
        difficultyLevel: 'Medium',
      })
      .execute();

    // Save both recipes for user
    await db
      .insert(savedRecipesTable)
      .values([
        { userId, recipeId: italianRecipeId },
        { userId, recipeId: mexicanRecipeId },
      ])
      .execute();

    const options: RecipeSearchRequest = { cuisineType: 'Italian' };
    const recipes = await searchSavedRecipes(options);

    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toBe(italianRecipeId);
    expect(recipes[0].cuisineType).toBe('Italian');
  });

  it('should filter recipes by dietary restrictions', async () => {
    // Setup: Create a user and two saved recipes with different dietary restrictions
    const userId = 'test-user-3';
    await db.insert(usersTable).values({ id: userId }).execute();

    const veganRecipeId = '123e4567-e89b-12d3-a456-426614174003';
    await db
      .insert(recipesTable)
      .values({
        id: veganRecipeId,
        name: 'Vegan Salad',
        prepTime: 900,
        cookTime: 0,
        servings: 2,
        cuisineType: 'Mediterranean',
        mealType: 'Lunch',
        difficultyLevel: 'Easy',
      })
      .execute();

    const nonVeganRecipeId = '123e4567-e89b-12d3-a456-426614174004';
    await db
      .insert(recipesTable)
      .values({
        id: nonVeganRecipeId,
        name: 'Beef Steak',
        prepTime: 600,
        cookTime: 900,
        servings: 2,
        cuisineType: 'American',
        mealType: 'Dinner',
        difficultyLevel: 'Medium',
      })
      .execute();

    // Add dietary restrictions
    await db
      .insert(recipeDietaryRestrictionsTable)
      .values([
        { recipeId: veganRecipeId, dietaryRestriction: 'Vegan' },
        { recipeId: nonVeganRecipeId, dietaryRestriction: 'None' },
      ])
      .execute();

    // Save both recipes for user
    await db
      .insert(savedRecipesTable)
      .values([
        { userId, recipeId: veganRecipeId },
        { userId, recipeId: nonVeganRecipeId },
      ])
      .execute();

    const dietaryRestrictions: DietaryRestriction[] = ['Vegan'];
    const options: RecipeSearchRequest = { dietaryRestrictions };
    const recipes = await searchSavedRecipes(options);

    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toBe(veganRecipeId);
    expect(recipes[0].dietaryTags).toContain('Vegan');
  });

  it('should filter recipes by meal type', async () => {
    // Setup: Create a user and two saved recipes with different meal types
    const userId = 'test-user-4';
    await db.insert(usersTable).values({ id: userId }).execute();

    const breakfastRecipeId = '123e4567-e89b-12d3-a456-426614174005';
    await db
      .insert(recipesTable)
      .values({
        id: breakfastRecipeId,
        name: 'Breakfast Omelette',
        prepTime: 600,
        cookTime: 300,
        servings: 1,
        cuisineType: 'French',
        mealType: 'Breakfast',
        difficultyLevel: 'Easy',
      })
      .execute();

    const dinnerRecipeId = '123e4567-e89b-12d3-a456-426614174006';
    await db
      .insert(recipesTable)
      .values({
        id: dinnerRecipeId,
        name: 'Roast Chicken',
        prepTime: 1800,
        cookTime: 3600,
        servings: 4,
        cuisineType: 'American',
        mealType: 'Dinner',
        difficultyLevel: 'Medium',
      })
      .execute();

    // Save both recipes for user
    await db
      .insert(savedRecipesTable)
      .values([
        { userId, recipeId: breakfastRecipeId },
        { userId, recipeId: dinnerRecipeId },
      ])
      .execute();

    const options: RecipeSearchRequest = { mealType: 'Breakfast' };
    const recipes = await searchSavedRecipes(options);

    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toBe(breakfastRecipeId);
    expect(recipes[0].mealType).toBe('Breakfast');
  });

  it('should filter recipes by keyword in name', async () => {
    // Setup: Create a user and two saved recipes with different names
    const userId = 'test-user-5';
    await db.insert(usersTable).values({ id: userId }).execute();

    const pizzaRecipeId = '123e4567-e89b-12d3-a456-426614174007';
    await db
      .insert(recipesTable)
      .values({
        id: pizzaRecipeId,
        name: 'Margherita Pizza',
        prepTime: 1800,
        cookTime: 900,
        servings: 4,
        cuisineType: 'Italian',
        mealType: 'Dinner',
        difficultyLevel: 'Medium',
      })
      .execute();

    const pastaRecipeId = '123e4567-e89b-12d3-a456-426614174008';
    await db
      .insert(recipesTable)
      .values({
        id: pastaRecipeId,
        name: 'Spaghetti Carbonara',
        prepTime: 900,
        cookTime: 600,
        servings: 2,
        cuisineType: 'Italian',
        mealType: 'Dinner',
        difficultyLevel: 'Medium',
      })
      .execute();

    // Save both recipes for user
    await db
      .insert(savedRecipesTable)
      .values([
        { userId, recipeId: pizzaRecipeId },
        { userId, recipeId: pastaRecipeId },
      ])
      .execute();

    const options: RecipeSearchRequest = { keyword: 'pizza' };
    const recipes = await searchSavedRecipes(options);

    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toBe(pizzaRecipeId);
    expect(recipes[0].name).toContain('Pizza');
  });

  it('should filter recipes by max prep time', async () => {
    // Setup: Create a user and two saved recipes with different prep times
    const userId = 'test-user-6';
    await db.insert(usersTable).values({ id: userId }).execute();

    const quickRecipeId = '123e4567-e89b-12d3-a456-426614174009';
    await db
      .insert(recipesTable)
      .values({
        id: quickRecipeId,
        name: 'Quick Salad',
        prepTime: 300, // 5 minutes
        cookTime: 0,
        servings: 1,
        cuisineType: 'Mediterranean',
        mealType: 'Lunch',
        difficultyLevel: 'Easy',
      })
      .execute();

    const longPrepRecipeId = '123e4567-e89b-12d3-a456-426614174010';
    await db
      .insert(recipesTable)
      .values({
        id: longPrepRecipeId,
        name: 'Complex Lasagna',
        prepTime: 2700, // 45 minutes
        cookTime: 3600,
        servings: 8,
        cuisineType: 'Italian',
        mealType: 'Dinner',
        difficultyLevel: 'Hard',
      })
      .execute();

    // Save both recipes for user
    await db
      .insert(savedRecipesTable)
      .values([
        { userId, recipeId: quickRecipeId },
        { userId, recipeId: longPrepRecipeId },
      ])
      .execute();

    // Create a Date object for maxPrepTime (15 minutes)
    const maxPrepTime = new Date(15 * 60 * 1000);
    const options: RecipeSearchRequest = {
      maxPrepTime,
    };

    const recipes = await searchSavedRecipes(options);

    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toBe(quickRecipeId);
    expect(recipes[0].name).toBe('Quick Salad');
  });

  it('should combine multiple filters correctly', async () => {
    // Setup: Create a user and multiple saved recipes with different properties
    const userId = 'test-user-7';
    await db.insert(usersTable).values({ id: userId }).execute();

    // Recipe that matches all filters
    const matchingRecipeId = '123e4567-e89b-12d3-a456-426614174011';
    await db
      .insert(recipesTable)
      .values({
        id: matchingRecipeId,
        name: 'Quick Italian Pasta',
        prepTime: 900, // 15 minutes
        cookTime: 600,
        servings: 2,
        cuisineType: 'Italian',
        mealType: 'Dinner',
        difficultyLevel: 'Easy',
      })
      .execute();

    // Add dietary restriction
    await db
      .insert(recipeDietaryRestrictionsTable)
      .values({
        recipeId: matchingRecipeId,
        dietaryRestriction: 'Vegetarian',
      })
      .execute();

    // Recipe that doesn't match cuisine
    const wrongCuisineRecipeId = '123e4567-e89b-12d3-a456-426614174012';
    await db
      .insert(recipesTable)
      .values({
        id: wrongCuisineRecipeId,
        name: 'Quick Vegetarian Curry',
        prepTime: 900,
        cookTime: 1200,
        servings: 4,
        cuisineType: 'Indian',
        mealType: 'Dinner',
        difficultyLevel: 'Medium',
      })
      .execute();

    await db
      .insert(recipeDietaryRestrictionsTable)
      .values({
        recipeId: wrongCuisineRecipeId,
        dietaryRestriction: 'Vegetarian',
      })
      .execute();

    // Recipe that doesn't match prep time
    const longPrepRecipeId = '123e4567-e89b-12d3-a456-426614174013';
    await db
      .insert(recipesTable)
      .values({
        id: longPrepRecipeId,
        name: 'Complex Italian Vegetarian Lasagna',
        prepTime: 2700, // 45 minutes
        cookTime: 3600,
        servings: 6,
        cuisineType: 'Italian',
        mealType: 'Dinner',
        difficultyLevel: 'Hard',
      })
      .execute();

    await db
      .insert(recipeDietaryRestrictionsTable)
      .values({
        recipeId: longPrepRecipeId,
        dietaryRestriction: 'Vegetarian',
      })
      .execute();

    // Save all recipes for user
    await db
      .insert(savedRecipesTable)
      .values([
        { userId, recipeId: matchingRecipeId },
        { userId, recipeId: wrongCuisineRecipeId },
        { userId, recipeId: longPrepRecipeId },
      ])
      .execute();

    // Create a Date object for maxPrepTime (20 minutes)
    const maxPrepTime = new Date(20 * 60 * 1000);
    const dietaryRestrictions: DietaryRestriction[] = ['Vegetarian'];
    const options: RecipeSearchRequest = {
      cuisineType: 'Italian',
      dietaryRestrictions,
      maxPrepTime,
      keyword: 'pasta',
    };

    const recipes = await searchSavedRecipes(options);

    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toBe(matchingRecipeId);
    expect(recipes[0].name).toContain('Pasta');
    expect(recipes[0].cuisineType).toBe('Italian');
    expect(recipes[0].dietaryTags).toContain('Vegetarian');
  });
});
