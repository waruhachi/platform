import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const threads = pgTable("threads", {
    channelId: text("channelId"),
    threadTs: text("threadTs").primaryKey().notNull(),
    chatbotToken: text("chatbotToken").notNull(),
    authorId: text(), // slack user id
    chatbotId: uuid("chatbotId"),
    deployed: boolean("deployed").notNull().default(false),
    useStaging: boolean("useStaging").notNull().default(false),
    runMode: text("runMode").notNull().default("telegram"),
});