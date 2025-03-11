import { 
  integer, 
  pgTable, 
  text, 
  timestamp, 
  boolean, 
  real, 
  primaryKey,
  interval,
  pgEnum,
  uuid,
  serial,
  varchar,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Users table
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Migraine events table
export const migraineEventsTable = pgTable("migraine_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time"),
  intensity: integer("intensity").notNull(), // 1-10 scale
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Trigger data table with 1:1 relationship to migraine_events
export const triggerDataTable = pgTable("trigger_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  migraine_id: uuid("migraine_id").references(() => migraineEventsTable.id, { onDelete: 'cascade' }),
  user_id: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  timestamp: timestamp("timestamp").notNull(),
  weather_change: boolean("weather_change"),
  barometric_pressure: real("barometric_pressure"),
  sleep_quality: integer("sleep_quality"), // 1-10 scale
  sleep_duration_minutes: integer("sleep_duration_minutes"),
  stress_level: integer("stress_level"), // 1-10 scale
  hydration_level: integer("hydration_level"), // 1-10 scale
  hormonal_factors: boolean("hormonal_factors"),
  physical_activity: varchar("physical_activity", { length: 255 }),
  screen_time_minutes: integer("screen_time_minutes"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Symptoms table (many-to-many with migraine_events)
export const symptomsTable = pgTable("symptoms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull().unique()
});

export const migraineSymptoms = pgTable("migraine_symptoms", {
  migraine_id: uuid("migraine_id").notNull().references(() => migraineEventsTable.id, { onDelete: 'cascade' }),
  symptom_id: uuid("symptom_id").notNull().references(() => symptomsTable.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.migraine_id, table.symptom_id] })
  };
});

// Medications table (many-to-many with migraine_events)
export const medicationsTable = pgTable("medications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull().unique()
});

export const migraineMedications = pgTable("migraine_medications", {
  migraine_id: uuid("migraine_id").notNull().references(() => migraineEventsTable.id, { onDelete: 'cascade' }),
  medication_id: uuid("medication_id").notNull().references(() => medicationsTable.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.migraine_id, table.medication_id] })
  };
});

// Foods table (many-to-many with trigger_data)
export const foodsTable = pgTable("foods", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull().unique()
});

export const triggerFoods = pgTable("trigger_foods", {
  trigger_id: uuid("trigger_id").notNull().references(() => triggerDataTable.id, { onDelete: 'cascade' }),
  food_id: uuid("food_id").notNull().references(() => foodsTable.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.trigger_id, table.food_id] })
  };
});

// Prediction requests logging
export const predictionRequestsTable = pgTable("prediction_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  timeframe_minutes: integer("timeframe_minutes").notNull(),
  result: text("result"),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Analysis requests logging
export const analysisRequestsTable = pgTable("analysis_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  trigger_type: varchar("trigger_type", { length: 255 }),
  result: text("result"),
  created_at: timestamp("created_at").defaultNow().notNull()
});