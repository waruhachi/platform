import { integer, pgTable, text, timestamp, boolean, jsonb, uuid, serial, pgEnum } from "drizzle-orm/pg-core";

// Users table to track who is performing searches
export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
  last_active: timestamp("last_active").defaultNow(),
});

// Search engine options enum
export const searchEnginesEnum = pgEnum("search_engines", ["google", "bing", "duckduckgo", "custom"]);

// Search queries table (based on SearchQuery model)
export const searchQueriesTable = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").references(() => usersTable.id).notNull(),
  query: text("query").notNull(),
  result_count: integer("result_count"),
  search_engine: searchEnginesEnum("search_engine").default("google"),
  created_at: timestamp("created_at").defaultNow(),
});

// Filter options table (based on FilterOptions model)
export const filterOptionsTable = pgTable("filter_options", {
  id: serial("id").primaryKey(),
  search_query_id: integer("search_query_id").references(() => searchQueriesTable.id).notNull(),
  date_range_from: timestamp("date_range_from"),
  date_range_to: timestamp("date_range_to"),
  file_types: jsonb("file_types").$type<string[]>(),
  domains: jsonb("domains").$type<string[]>(),
  languages: jsonb("languages").$type<string[]>(),
  relevance_score: integer("relevance_score"),
});

// Search results table to store results returned from searches
export const searchResultsTable = pgTable("search_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  search_query_id: integer("search_query_id").references(() => searchQueriesTable.id).notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  snippet: text("snippet"),
  position: integer("position"),
  metadata: jsonb("metadata"),
  content: text("content"),
  created_at: timestamp("created_at").defaultNow(),
});

// Saved results table (based on SaveResultRequest model)
export const savedResultsTable = pgTable("saved_results", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").references(() => usersTable.id).notNull(),
  result_id: uuid("result_id").references(() => searchResultsTable.id).notNull(),
  category: text("category"),
  notes: text("notes"),
  saved_at: timestamp("saved_at").defaultNow(),
});

// Result details cache table (for ResultDetailsRequest model responses)
export const resultDetailsTable = pgTable("result_details", {
  id: serial("id").primaryKey(),
  result_id: uuid("result_id").references(() => searchResultsTable.id).notNull(),
  full_content: text("full_content"),
  metadata: jsonb("metadata"),
  extracted_content: text("extracted_content"),
  last_updated: timestamp("last_updated").defaultNow(),
});

// User search sessions table to track search session context
export const searchSessionsTable = pgTable("search_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => usersTable.id).notNull(),
  current_search_id: integer("current_search_id").references(() => searchQueriesTable.id),
  start_time: timestamp("start_time").defaultNow(),
  end_time: timestamp("end_time"),
  is_active: boolean("is_active").default(true),
});