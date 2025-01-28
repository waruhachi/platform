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

app.event("message", async ({ event, client, logger }) => {
  if (event.subtype === undefined || event.subtype === "bot_message") {
    logger.info(event);

    if (event.user !== "U0775H2TR9U") {
      return;
    }
    
    if (event.text?.trim().startsWith("generate")) {
      const prompt = event.text.replace("generate", "").trim();

      await client.chat.postMessage({
        channel: event.channel,
        text: `Generating... ${prompt}`,
      });
      
      logger.info("calling the build endpoint");
      /*const response = await fetch("http://localhost:8000/build", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: prompt,
        }),
      });*/
      
      const response = await fetch("http://localhost:4444/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: prompt,
        }),
      });
      
      logger.info("build endpoint returned");

      const result = await response.json();
      
      await client.chat.postMessage({
        channel: event.channel,
        text: JSON.stringify(result),
      });
    }
  }
});

app.start().catch((error) => {
  console.error(error);
  process.exit(1);
});
