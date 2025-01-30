import { App, LogLevel, subtype } from "@slack/bolt";
import { drizzle } from "drizzle-orm/neon-serverless";
import { threads } from "./db/schema";
import { eq } from "drizzle-orm";

import { config } from "dotenv";

// Load environment variables from .env file
config();

const db = drizzle(process.env.DATABASE_URL!);

const app = new App({
  token: process.env.TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  appToken: process.env.APP_TOKEN,
  logLevel: LogLevel.DEBUG,
  socketMode: true,
});

async function chatbotIteration({
  telegramBotToken,
  prompt,
  channelId,
  threadTs,
}: {
  telegramBotToken: string;
  prompt: string;
  channelId: string;
  threadTs: string;
}) {
  const response = await fetch("http://localhost:4444/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      telegramBotToken,
    }),
  });

  console.log("generate endpoint returned", response);

  if (response.ok) {
    const generateResult = await response.json();
    console.log("generateResult", generateResult);

    await app.client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      text: "✅ The bot has been successfully deployed, go and talk to it!",
    });
  } else {
    await app.client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      text: "There was an error while deploying the bot",
    });
  }
}

app.message("", async ({ event, logger }) => {
  logger.info("CONA");
  
  let threadTs: string;
  if ("thread_ts" in event) {
    threadTs = event.thread_ts as string;
    if (!threadTs) {
      return;
    }
  } else {
    return;
  }
  
  let prompt;
  if ("text" in event) {
    prompt = event.text;
    
    if (!prompt) {
      return;
    }
  } else {
    return;
  }
  
  const threadResult = await db.select().from(threads).where(eq(threads.threadTs, threadTs));
  
  console.log("threadResult", threadResult);
  
  if (threadResult.length !== 1) {
    return;
  }
  
  const thread = threadResult[0];
  
  chatbotIteration({
    telegramBotToken: thread.chatbotToken,
    prompt,
    channelId: event.channel,
    threadTs: thread.threadTs,
  });
});

app.command("/generate-telegram-bot", async ({ ack, body, logger }) => {
  await ack();

  if (body.user_id !== "U0775H2TR9U") {
    await app.client.chat.postMessage({
      channel: body.channel_id,
      text: "I only talk to Mr. Gomes.",
    });

    return;
  }

  // Get the text after the command and split it into arguments
  const args = body.text.split(" ");
  const botToken = args[0];
  const prompt = args.slice(1).join(" ");

  // Send message with both arguments
  const msg = await app.client.chat.postMessage({
    channel: body.channel_id,
    text: `Let's generate a Telegram chatbot! 🤖
    
Please iterate with me on this thread 🧵`,
  });
  
  if (!msg.ts) {
    throw new Error("Message not found");
  }
  
  await db.insert(threads).values({
    threadTs: msg.ts,
    chatbotToken: botToken,
  });

  // Post update on thread
  await app.client.chat.postMessage({
    channel: body.channel_id,
    thread_ts: msg.ts,
    text: `Prompt: ${prompt}`,
  });

  chatbotIteration({
    telegramBotToken: botToken,
    prompt,
    channelId: body.channel_id,
    threadTs: msg.ts,
  });
});

app.start().catch((error) => {
  console.error(error);
  process.exit(1);
});
