import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const threads = pgTable("threads", {
    threadTs: text("threadTs").primaryKey().notNull(),
    chatbotToken: text("chatbotToken").notNull(),
});