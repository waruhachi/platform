ALTER TABLE "threads" ADD COLUMN "channelId" text;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "chatbotId" uuid;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "deployed" boolean DEFAULT false NOT NULL;