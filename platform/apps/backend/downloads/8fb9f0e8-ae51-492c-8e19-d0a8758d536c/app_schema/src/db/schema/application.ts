import {
  pgTable,
  pgEnum,
  text,
  integer,
  timestamp,
  uuid,
  real,
  primaryKey,
} from 'drizzle-orm/pg-core';

// Enums
export const dietaryRestrictionEnum = pgEnum('dietary_restriction', [
  'Vegetarian',
  'Vegan',
  'GlutenFree',
  'DairyFree',
  'Keto',
  'Paleo',
  'LowCarb',
  'None',
]);

export const difficultyLevelEnum = pgEnum('difficulty_level', [
  'Easy',
  'Medium',
  'Hard',
  'Expert',
]);

// Users table
export const usersTable = pgTable('users', {
  id: text().primaryKey(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});

// Recipes table
export const recipesTable = pgTable('recipes', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  prepTime: integer().notNull(), // stored in seconds
  cookTime: integer().notNull(), // stored in seconds
  servings: integer().notNull(),
  cuisineType: text().notNull(),
  mealType: text().notNull(),
  difficultyLevel: difficultyLevelEnum().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});

// Recipe instructions table
export const recipeInstructionsTable = pgTable('recipe_instructions', {
  id: uuid().defaultRandom().primaryKey(),
  recipeId: uuid()
    .references(() => recipesTable.id, { onDelete: 'cascade' })
    .notNull(),
  stepNumber: integer().notNull(),
  instruction: text().notNull(),
});

// Recipe nutritional info
export const recipeNutritionalInfoTable = pgTable('recipe_nutritional_info', {
  id: uuid().defaultRandom().primaryKey(),
  recipeId: uuid()
    .references(() => recipesTable.id, { onDelete: 'cascade' })
    .notNull(),
  nutritionalInfo: text().notNull(),
});

// Ingredients table
export const ingredientsTable = pgTable('ingredients', {
  id: uuid().defaultRandom().primaryKey(),
  recipeId: uuid()
    .references(() => recipesTable.id, { onDelete: 'cascade' })
    .notNull(),
  name: text().notNull(),
  quantity: text(),
  unit: text(),
});

// Recipe dietary restrictions junction table
export const recipeDietaryRestrictionsTable = pgTable(
  'recipe_dietary_restrictions',
  {
    recipeId: uuid()
      .references(() => recipesTable.id, { onDelete: 'cascade' })
      .notNull(),
    dietaryRestriction: dietaryRestrictionEnum().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.recipeId, table.dietaryRestriction] }),
    };
  }
);

// Saved recipes junction table
export const savedRecipesTable = pgTable(
  'saved_recipes',
  {
    userId: text()
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    recipeId: uuid()
      .references(() => recipesTable.id, { onDelete: 'cascade' })
      .notNull(),
    savedAt: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.recipeId] }),
    };
  }
);
