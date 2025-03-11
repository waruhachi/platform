import { serial, text, integer, boolean, date, timestamp, pgTable, pgEnum, uuid, primaryKey } from "drizzle-orm/pg-core";

// Users table to track who is making requests
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Search queries table
export const searchQueriesTable = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").references(() => usersTable.id),
  query: text("query").notNull(),
  max_results: integer("max_results").default(10),
  include_images: boolean("include_images").default(false),
  safe_search: boolean("safe_search").default(true),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Web page requests table
export const webPageRequestsTable = pgTable("web_page_requests", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").references(() => usersTable.id),
  url: text("url").notNull(),
  extract_text: boolean("extract_text").default(false),
  include_summary: boolean("include_summary").default(false),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Search results table
export const searchResultsTable = pgTable("search_results", {
  id: serial("id").primaryKey(),
  search_query_id: integer("search_query_id").references(() => searchQueriesTable.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  snippet: text("snippet").notNull(),
  last_updated: timestamp("last_updated"),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Search refinements table
export const searchRefinementsTable = pgTable("search_refinements", {
  id: serial("id").primaryKey(),
  original_query_id: integer("original_query_id").references(() => searchQueriesTable.id),
  user_id: uuid("user_id").references(() => usersTable.id),
  additional_terms: text("additional_terms").array(),
  exclude_terms: text("exclude_terms").array(),
  start_date: date("start_date"),
  end_date: date("end_date"),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Many-to-many relationship between refinements and results
export const refinementResultsTable = pgTable("refinement_results", {
  refinement_id: integer("refinement_id").references(() => searchRefinementsTable.id),
  result_id: integer("result_id").references(() => searchResultsTable.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.refinement_id, table.result_id] }),
  };
});