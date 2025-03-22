import { z } from 'zod';

export const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
});

export type Ingredient = z.infer<typeof ingredientSchema>;

export const dietaryRestrictionSchema = z.enum([
  'Vegetarian',
  'Vegan',
  'GlutenFree',
  'DairyFree',
  'Keto',
  'Paleo',
  'LowCarb',
  'None',
]);

export type DietaryRestriction = z.infer<typeof dietaryRestrictionSchema>;

export const recipeRequestSchema = z.object({
  ingredients: z.array(ingredientSchema),
  dietaryRestrictions: z.array(dietaryRestrictionSchema).optional(),
  cuisineType: z.string().optional(),
  maxPrepTime: z.string().pipe(z.coerce.date()).optional(),
  mealType: z.string().optional(),
});

export type RecipeRequest = z.infer<typeof recipeRequestSchema>;

export const recipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  ingredients: z.array(ingredientSchema),
  prepTime: z.string().pipe(z.coerce.date()),
  cookTime: z.string().pipe(z.coerce.date()),
  servings: z.number().int(),
  dietaryTags: z.array(dietaryRestrictionSchema),
  cuisineType: z.string(),
  mealType: z.string(),
  difficultyLevel: z.string(),
});

export type Recipe = z.infer<typeof recipeSchema>;

export const recipeDetailsRequestSchema = z.object({
  recipeId: z.string(),
});

export type RecipeDetailsRequest = z.infer<typeof recipeDetailsRequestSchema>;

export const recipeDetailsSchema = z.object({
  recipe: recipeSchema,
  instructions: z.array(z.string()),
  nutritionalInfo: z.string().optional(),
});

export type RecipeDetails = z.infer<typeof recipeDetailsSchema>;

export const saveRecipeRequestSchema = z.object({
  recipe: recipeSchema,
});

export type SaveRecipeRequest = z.infer<typeof saveRecipeRequestSchema>;

export const recipeSearchRequestSchema = z.object({
  cuisineType: z.string().optional(),
  dietaryRestrictions: z.array(dietaryRestrictionSchema).optional(),
  mealType: z.string().optional(),
  keyword: z.string().optional(),
  maxPrepTime: z.string().pipe(z.coerce.date()).optional(),
});

export type RecipeSearchRequest = z.infer<typeof recipeSearchRequestSchema>;

export declare function generateRecipes(
  options: RecipeRequest
): Promise<Recipe[]>;

export declare function getRecipeDetails(
  options: RecipeDetailsRequest
): Promise<RecipeDetails>;

export declare function saveRecipe(options: SaveRecipeRequest): Promise<void>;

export declare function searchSavedRecipes(
  options: RecipeSearchRequest
): Promise<Recipe[]>;
