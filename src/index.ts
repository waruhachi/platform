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

app.event("message", async ({ event, context, client, logger }) => {
  logger.info(event);
  
  await client.chat.postMessage({
    channel: event.channel,
    text: "Hello world!",
  });
});

app.message("", async ({ message, say }) => {
  console.log(message);
});

app.message("generate", async ({ message, say }) => {
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey there!`,
        },
      },
    ],
    text: `Hey there!`,
  });
});

app.start().catch((error) => {
  console.error(error);
  process.exit(1);
});
