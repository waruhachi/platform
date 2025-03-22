import * as schema from './common/schema';
import type { ToolHandler } from './common/tool-handler';
import * as searchSavedRecipes from './handlers/searchSavedRecipes';
import * as getRecipeDetails from './handlers/getRecipeDetails';
import * as saveRecipe from './handlers/saveRecipe';
import * as generateRecipes from './handlers/generateRecipes';

export const handlers: ToolHandler<any>[] = [
  {
    name: 'searchSavedRecipes',
    description: `Search for recipes in the user's saved collection`,
    handler: searchSavedRecipes.handle,
    inputSchema: schema.recipeSearchRequestSchema,
  },
  {
    name: 'getRecipeDetails',
    description: `Retrieve detailed instructions for a specific recipe`,
    handler: getRecipeDetails.handle,
    inputSchema: schema.recipeDetailsRequestSchema,
  },
  {
    name: 'saveRecipe',
    description: `Save a recipe to the user's favorites`,
    handler: saveRecipe.handle,
    inputSchema: schema.saveRecipeRequestSchema,
  },
  {
    name: 'generateRecipes',
    description: `Generate recipe ideas based on available ingredients and preferences`,
    handler: generateRecipes.handle,
    inputSchema: schema.recipeRequestSchema,
  },
];
