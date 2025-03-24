import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const chatbots = pgTable("chatbots", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ownerId: text("userId").notNull(),
  telegramBotToken: text(),
  flyAppId: text(),
  s3Checksum: text(),
  deployStatus: text().default("pending"), // pending, deploying, deployed, failed
  traceId: text(),
  runMode: text("runMode").notNull().default("telegram"),
  typespecSchema: text(),
  receivedSuccess: boolean("receivedSuccess").notNull().default(false),
  recompileInProgress: boolean("recompileInProgress").notNull().default(false),
});

export const chatbotPrompts = pgTable("chatbot_prompts", {
  id: uuid("id").primaryKey(),
  chatbotId: uuid("chatbotId").references(() => chatbots.id),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  kind: text(), // "user" or "agent"
});
