import "./helpers.js";

extern dec llm_func(target: unknown, description: string);

extern dec scenario(target: unknown, gherkin: string);
model Ingredient {
  name: string;
  quantity?: string;
  unit?: string;
}

enum DietaryRestriction {
  Vegetarian,
  Vegan,
  GlutenFree,
  DairyFree,
  Keto,
  Paleo,
  LowCarb,
  None
}

model RecipeRequest {
  ingredients: Ingredient[];
  dietaryRestrictions?: DietaryRestriction[];
  cuisineType?: string;
  maxPrepTime?: duration;
  mealType?: string;
}

model Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  prepTime: duration;
  cookTime: duration;
  servings: integer;
  dietaryTags: DietaryRestriction[];
  cuisineType: string;
  mealType: string;
  difficultyLevel: string;
}

model RecipeDetailsRequest {
  recipeId: string;
}

model RecipeDetails {
  recipe: Recipe;
  instructions: string[];
  nutritionalInfo?: string;
}

model SaveRecipeRequest {
  recipe: Recipe;
}

model RecipeSearchRequest {
  cuisineType?: string;
  dietaryRestrictions?: DietaryRestriction[];
  mealType?: string;
  keyword?: string;
  maxPrepTime?: duration;
}

interface RecipeBot {
  @scenario(
  """
  Scenario: Generate recipes from basic ingredients
  When user says "I have chicken, rice, and broccoli"
  Then system extracts ingredients: chicken, rice, broccoli
  And returns recipe suggestions using those ingredients
  
  Examples:
    | Input                                          | Expected Output |
    | "What can I make with pasta and tomatoes?"     | Multiple pasta recipe suggestions |
    | "I have eggs, bacon, and cheese in my fridge"  | Breakfast and other recipe suggestions |
  """)
  @scenario(
  """
  Scenario: Generate recipes with dietary restrictions
  When user says "I have tofu and vegetables, need vegan recipes"
  Then system extracts ingredients: tofu, vegetables
  And applies dietary restriction: Vegan
  And returns vegan recipe suggestions
  
  Examples:
    | Input                                             | Expected Output |
    | "Gluten free recipes using chicken and quinoa"    | Gluten-free chicken and quinoa recipes |
    | "Keto friendly meals with avocado and eggs"       | Keto recipes with avocado and eggs |
  """)
  @llm_func("Generate recipe ideas based on available ingredients and preferences")
  generateRecipes(options: RecipeRequest): Recipe[];

  @scenario(
  """
  Scenario: Get detailed instructions for a recipe
  When user requests details for a specific recipe
  Then system returns detailed cooking instructions and ingredients
  
  Examples:
    | Input                                           | Expected Output |
    | "Show me how to make the chicken stir fry"      | Detailed instructions for chicken stir fry |
    | "I want to see the pasta recipe instructions"   | Detailed instructions for pasta recipe |
  """)
  @llm_func("Retrieve detailed instructions for a specific recipe")
  getRecipeDetails(options: RecipeDetailsRequest): RecipeDetails;

  @scenario(
  """
  Scenario: Save a recipe to favorites
  When user wants to save a recipe they like
  Then system adds the recipe to their saved recipes
  
  Examples:
    | Input                                    | Expected Output |
    | "Save this lasagna recipe"               | Confirmation that lasagna recipe was saved |
    | "Add chicken curry to my favorites"      | Confirmation that chicken curry was saved |
  """)
  @llm_func("Save a recipe to the user's favorites")
  saveRecipe(options: SaveRecipeRequest): void;

  @scenario(
  """
  Scenario: Search through saved recipes
  When user searches for specific recipes in their saved collection
  Then system returns matching saved recipes
  
  Examples:
    | Input                                       | Expected Output |
    | "Show my saved Italian recipes"             | List of saved Italian recipes |
    | "What vegetarian recipes have I saved?"     | List of saved vegetarian recipes |
  """)
  @scenario(
  """
  Scenario: Search with multiple criteria
  When user searches with multiple criteria
  Then system returns recipes matching all criteria
  
  Examples:
    | Input                                               | Expected Output |
    | "Find quick vegan breakfast recipes I've saved"     | Quick vegan breakfast recipes |
    | "Show me gluten-free desserts in my favorites"      | Gluten-free dessert recipes |
  """)
  @llm_func("Search for recipes in the user's saved collection")
  searchSavedRecipes(options: RecipeSearchRequest): Recipe[];
}model Ingredient {
  name: string;
  quantity?: string;
  unit?: string;
}

enum DietaryRestriction {
  Vegetarian,
  Vegan,
  GlutenFree,
  DairyFree,
  Keto,
  Paleo,
  LowCarb,
  None
}

model RecipeRequest {
  ingredients: Ingredient[];
  dietaryRestrictions?: DietaryRestriction[];
  cuisineType?: string;
  maxPrepTime?: duration;
  mealType?: string;
}

model Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  prepTime: duration;
  cookTime: duration;
  servings: integer;
  dietaryTags: DietaryRestriction[];
  cuisineType: string;
  mealType: string;
  difficultyLevel: string;
}

model RecipeDetailsRequest {
  recipeId: string;
}

model RecipeDetails {
  recipe: Recipe;
  instructions: string[];
  nutritionalInfo?: string;
}

model SaveRecipeRequest {
  recipe: Recipe;
}

model RecipeSearchRequest {
  cuisineType?: string;
  dietaryRestrictions?: DietaryRestriction[];
  mealType?: string;
  keyword?: string;
  maxPrepTime?: duration;
}

interface RecipeBot {
  @scenario(
  """
  Scenario: Generate recipes from basic ingredients
  When user says "I have chicken, rice, and broccoli"
  Then system extracts ingredients: chicken, rice, broccoli
  And returns recipe suggestions using those ingredients
  
  Examples:
    | Input                                          | Expected Output |
    | "What can I make with pasta and tomatoes?"     | Multiple pasta recipe suggestions |
    | "I have eggs, bacon, and cheese in my fridge"  | Breakfast and other recipe suggestions |
  """)
  @scenario(
  """
  Scenario: Generate recipes with dietary restrictions
  When user says "I have tofu and vegetables, need vegan recipes"
  Then system extracts ingredients: tofu, vegetables
  And applies dietary restriction: Vegan
  And returns vegan recipe suggestions
  
  Examples:
    | Input                                             | Expected Output |
    | "Gluten free recipes using chicken and quinoa"    | Gluten-free chicken and quinoa recipes |
    | "Keto friendly meals with avocado and eggs"       | Keto recipes with avocado and eggs |
  """)
  @llm_func("Generate recipe ideas based on available ingredients and preferences")
  generateRecipes(options: RecipeRequest): Recipe[];

  @scenario(
  """
  Scenario: Get detailed instructions for a recipe
  When user requests details for a specific recipe
  Then system returns detailed cooking instructions and ingredients
  
  Examples:
    | Input                                           | Expected Output |
    | "Show me how to make the chicken stir fry"      | Detailed instructions for chicken stir fry |
    | "I want to see the pasta recipe instructions"   | Detailed instructions for pasta recipe |
  """)
  @llm_func("Retrieve detailed instructions for a specific recipe")
  getRecipeDetails(options: RecipeDetailsRequest): RecipeDetails;

  @scenario(
  """
  Scenario: Save a recipe to favorites
  When user wants to save a recipe they like
  Then system adds the recipe to their saved recipes
  
  Examples:
    | Input                                    | Expected Output |
    | "Save this lasagna recipe"               | Confirmation that lasagna recipe was saved |
    | "Add chicken curry to my favorites"      | Confirmation that chicken curry was saved |
  """)
  @llm_func("Save a recipe to the user's favorites")
  saveRecipe(options: SaveRecipeRequest): void;

  @scenario(
  """
  Scenario: Search through saved recipes
  When user searches for specific recipes in their saved collection
  Then system returns matching saved recipes
  
  Examples:
    | Input                                       | Expected Output |
    | "Show my saved Italian recipes"             | List of saved Italian recipes |
    | "What vegetarian recipes have I saved?"     | List of saved vegetarian recipes |
  """)
  @scenario(
  """
  Scenario: Search with multiple criteria
  When user searches with multiple criteria
  Then system returns recipes matching all criteria
  
  Examples:
    | Input                                               | Expected Output |
    | "Find quick vegan breakfast recipes I've saved"     | Quick vegan breakfast recipes |
    | "Show me gluten-free desserts in my favorites"      | Gluten-free dessert recipes |
  """)
  @llm_func("Search for recipes in the user's saved collection")
  searchSavedRecipes(options: RecipeSearchRequest): Recipe[];
}