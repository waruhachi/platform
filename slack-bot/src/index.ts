import { App, LogLevel } from "@slack/bolt";

import { config } from "dotenv";

// Load environment variables from .env file
config();

const app = new App({
  token: process.env.TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  appToken: process.env.APP_TOKEN,
  logLevel: LogLevel.DEBUG,
  socketMode: true,
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

  // Post update on thread
  await app.client.chat.postMessage({
    channel: body.channel_id,
    thread_ts: msg.ts,
    text: `Prompt: ${prompt}
Bot Token: ${botToken}
    `,
  });

  const response = await fetch("http://localhost:4444/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      botToken,
    }),
  });

  logger.info("generate endpoint returned", response);

  if (response.ok) {
    const generateResult = await response.json();
    console.log("generateResult", generateResult);

    await app.client.chat.postMessage({
      channel: body.channel_id,
      thread_ts: msg.ts,
      text: "✅ The bot has been successfully deployed, go and talk to it!",
    });
  } else {
    await app.client.chat.postMessage({
      channel: body.channel_id,
      thread_ts: msg.ts,
      text: "There was an error while deploying the bot",
    });
  }
});

app.start().catch((error) => {
  console.error(error);
  process.exit(1);
});
