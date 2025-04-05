import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const threads = pgTable("threads", {
  channelId: text("channelId"),
  threadTs: text("threadTs").primaryKey().notNull(),
  authorId: text(), // slack user id
  chatbotId: uuid("chatbotId"),
  deployed: boolean("deployed").notNull().default(false),
  s3Checksum: text(),
  useStaging: boolean("useStaging").notNull().default(false),
});
