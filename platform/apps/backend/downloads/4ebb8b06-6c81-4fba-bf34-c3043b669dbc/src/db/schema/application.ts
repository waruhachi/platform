import { integer, pgTable, text, timestamp, boolean, serial, pgEnum, index } from "drizzle-orm/pg-core";

// Web Search Options table
export const webSearchOptionsTable = pgTable("web_search_options", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  resultCount: integer("result_count"),
  language: text("language"),
  safeSearch: boolean("safe_search"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Search Results table
export const searchResultsTable = pgTable("search_results", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").references(() => webSearchOptionsTable.id).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  snippet: text("snippet").notNull(),
  datePublished: timestamp("date_published"),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => {
  return {
    urlIdx: index("search_results_url_idx").on(table.url),
    searchIdIdx: index("search_results_search_id_idx").on(table.searchId)
  };
});

// Web Page Options table
export const webPageOptionsTable = pgTable("web_page_options", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  translateToLanguage: text("translate_to_language"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Web Pages table
export const webPagesTable = pgTable("web_pages", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => webPageOptionsTable.id),
  url: text("url").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  dateAccessed: timestamp("date_accessed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => {
  return {
    urlIdx: index("web_pages_url_idx").on(table.url)
  };
});

// Summarize Options table
export const summarizeOptionsTable = pgTable("summarize_options", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  maxLength: integer("max_length"),
  sourceCount: integer("source_count"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Search Summary table
export const searchSummaryTable = pgTable("search_summaries", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => summarizeOptionsTable.id),
  topic: text("topic").notNull(),
  summary: text("summary").notNull(),
  sources: text("sources").array(),
  generatedAt: timestamp("generated_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});