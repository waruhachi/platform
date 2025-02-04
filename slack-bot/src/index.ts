import { App, LogLevel, subtype } from "@slack/bolt";
import { drizzle } from "drizzle-orm/neon-serverless";
import { threads } from "./db/schema";
import { eq } from "drizzle-orm";

import { config } from "dotenv";

// Load environment variables from .env file
config();

const db = drizzle(process.env.DATABASE_URL!);

let AGENT_API_HOST: string;
if (process.env.NODE_ENV === 'production') {
  AGENT_API_HOST = "http://platform-muddy-meadow-938.fly.dev";
} else {
  AGENT_API_HOST = "http://0.0.0.0:4444";
}

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
  const response = await fetch(`${AGENT_API_HOST}/generate`, {
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
    const generateResult: {
      readUrl: string;
      writeUrl: string;
      newBot: {
        id: string;
        name: string;
        // more stuff here
      },
      compileResult: {
        status: string;
        message: string;
        metadata: {
          functions: Array<{
            name: string;
            description: string;
            examples: Array<string>;
          }>
        }
      }
    } = await response.json();
    console.log("generateResult", generateResult);

    await app.client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      text: `✅ The bot has been successfully deployed, go and talk to it!
Download the code here: ${generateResult.readUrl}
Status: ${generateResult.compileResult.status}
Message: ${generateResult.compileResult.message}
      
Functions and their examples: ${JSON.stringify(generateResult.compileResult.metadata.functions)}`,
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

  if (body.user_id !== "U0775H2TR9U" && body.user_id !== "U087XSZ2XHR" && body.user_id !== "U087XSWNS3C" && body.user_id !== "U07HP8X7LN5" && body.user_id !== "U07K72G2J76") {
    await app.client.chat.postMessage({
      channel: body.channel_id,
      text: "I only talk to Mr. Gomes., Evgenii, Igor, Pedro and Holt",
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
