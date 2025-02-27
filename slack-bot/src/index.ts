import { App, LogLevel, subtype } from "@slack/bolt";
import { drizzle } from "drizzle-orm/neon-serverless";
import { threads } from "./db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { CronJob } from 'cron';
import { config } from "dotenv";

// Load environment variables from .env file
config();

const db = drizzle(process.env.DATABASE_URL!);

let BACKEND_API_HOST: string;
if (process.env.NODE_ENV === "production") {
  BACKEND_API_HOST = "https://platform-muddy-meadow-938.fly.dev";
} else {
  BACKEND_API_HOST = "http://0.0.0.0:4444";
}

const app = new App({
  token: process.env.TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  appToken: process.env.APP_TOKEN,
  logLevel: LogLevel.DEBUG,
  socketMode: true,
});

const job = CronJob.from({
	cronTime: '*/30 * * * * *', // every 30 seconds
	onTick: async function () {
    const undeployedBots = await db.select().from(threads).where(and(eq(threads.deployed, false), isNotNull(threads.chatbotId)));

    for (const bot of undeployedBots) {
      const botStatus = await fetch(`${BACKEND_API_HOST}/${bot.chatbotId}`);
      const botStatusJson = await botStatus.json();

      if (botStatusJson.flyAppId && bot.channelId) {
        await app.client.chat.postMessage({
          channel: bot.channelId,
          thread_ts: bot.threadTs,
          text: `✅ The bot has been successfully deployed, go and talk to it!
  Download the code here: ${botStatusJson.readUrl}`
        });
        
        await db.update(threads).set({
          deployed: true,
        }).where(eq(threads.threadTs, bot.threadTs));
      }
    }
	},
	start: true,
});

job.start();

async function chatbotIteration({
  telegramBotToken,
  prompt,
  channelId,
  threadTs,
  userId,
  useStaging,
}: {
  telegramBotToken: string;
  prompt: string;
  channelId: string;
  threadTs: string;
  userId: string;
  useStaging: boolean;
}) {
  try {
    console.log("calling generate endpoint");
    const response = await fetch(`${BACKEND_API_HOST}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        telegramBotToken,
        userId,
        useStaging,
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
        };
        compileResult: {
          status: string;
          message: string;
          metadata: {
            functions: Array<{
              name: string;
              description: string;
              examples: Array<string>;
            }>;
          };
        };
      } = await response.json();
      
      console.log("generateResult", generateResult);
      
      const chatbotId = generateResult.newBot.id;
      
      // Update the initial message to include the chatbot ID
      await app.client.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: `Bot generation in progress! Chatbot ID: ${chatbotId}`,
      });
      
      await db.update(threads).set({
        chatbotId: chatbotId,
      }).where(eq(threads.threadTs, threadTs));
    } else {
      const errorMessage = await response.text();

      await app.client.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: `There was an error while deploying the bot: ${errorMessage}`,
      });
    }
  } catch (error) {
    console.error("generate endpoint error", error);

    if (error instanceof DOMException && error.name === "TimeoutError") {
      await app.client.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: "More than 10 minutes have passed and we have timed out.",
      });
      return;
    }
    // Re-throw other errors
    throw error;
  }
}

async function handleBotGeneration({
  channelId,
  userId,
  prompt,
  botToken,
  client,
  threadTs,
  useStaging,
}: {
  channelId: string;
  userId: string;
  prompt: string;
  botToken: string;
  client: any;
  threadTs: string;
  useStaging: boolean;
}) {
  const stagingText = useStaging ? "to staging" : "to production";
  const msg = await client.chat.postMessage({
    channel: channelId,
    thread_ts: threadTs,
    text: `I'm going to start generating a bot for you ${stagingText}. This will take a few minutes.`,
  });

  if (!msg.ts) {
    throw new Error("Message not found");
  }

  await db.insert(threads).values({
    threadTs: msg.ts,
    chatbotToken: botToken,
    authorId: userId,
    channelId,
    useStaging: useStaging, // Store the useStaging value
  });

  chatbotIteration({
    telegramBotToken: botToken,
    prompt,
    channelId,
    threadTs: msg.ts,
    userId,
    useStaging,
  });
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

  if (!event.user) {
    return;
  }

  const threadResult = await db
    .select()
    .from(threads)
    .where(
      and(eq(threads.threadTs, threadTs), eq(threads.authorId, event.user))
    );

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
    userId: event.user,
    useStaging: thread.useStaging ?? false, // Use the stored useStaging value with a default
  });
});

app.event("message", async ({ event, client, message }) => {
  if (event.channel !== "C089K878WAY") {
    return;
  }

  let eventText: string;
  if ("text" in event && event.text) {
    eventText = event.text;
    if (!eventText) {
      return;
    }
  } else {
    return;
  }

  if (!eventText.startsWith("<@U08FLNSNFDE>")) {
    return;
  }

  const prompt = eventText.replace(/<@[A-Z0-9]+>/, "").trim();

  await client.chat.postMessage({
    channel: event.channel,
    thread_ts: event.ts,
    text: "Let's create a Telegram bot with your prompt!",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Your prompt:*\n${prompt}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Create Bot",
              emoji: true,
            },
            action_id: "open_bot_modal",
            value: JSON.stringify({
              prompt,
              channelId: event.channel,
              userId: event.user,
              threadTs: event.ts,
            }),
          },
        ],
      },
    ],
  });
});

// Add this handler for the button click
app.action("open_bot_modal", async ({ ack, body, client }) => {
  await ack();

  const { prompt, channelId, userId, threadTs } = JSON.parse(
    body.actions[0].value
  );

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      callback_id: "bot_token_modal",
      title: {
        type: "plain_text",
        text: "Enter Bot Token",
      },
      blocks: [
        {
          type: "input",
          block_id: "token_block",
          element: {
            type: "plain_text_input",
            action_id: "token_input",
            placeholder: {
              type: "plain_text",
              text: "Enter your Telegram bot token",
            },
          },
          label: {
            type: "plain_text",
            text: "Bot Token",
          },
        },
        {
          type: "section",
          block_id: "staging_block",
          text: {
            type: "mrkdwn",
            text: "*Environment*",
          },
          accessory: {
            type: "checkboxes",
            action_id: "staging_checkbox",
            options: [
              {
                text: {
                  type: "plain_text",
                  text: "Use staging",
                },
                value: "use_staging",
              },
            ],
          },
        },
      ],
      private_metadata: JSON.stringify({
        prompt,
        channelId,
        userId,
        threadTs,
        messageTs: body.container.message_ts,
      }),
      submit: {
        type: "plain_text",
        text: "Submit",
      },
    },
  });
});

// Add this handler to process the modal submission
app.view("bot_token_modal", async ({ ack, body, view, client }) => {
  await ack();

  const { prompt, channelId, userId, threadTs, messageTs } = JSON.parse(
    view.private_metadata
  );
  const botToken = view.state.values.token_block.token_input.value;
  const useStaging =
    view.state.values.staging_block.staging_checkbox.selected_options.length >
    0;

  if (!botToken) {
    await client.chat.postMessage({
      channel: channelId,
      text: "Please enter a valid bot token.",
    });
    return;
  }

  // Update the message with a disabled button
  await client.chat.update({
    channel: channelId,
    ts: messageTs,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Your prompt:*\n${prompt}`,
        },
      },
    ],
  });

  await handleBotGeneration({
    channelId,
    userId,
    prompt,
    botToken,
    client,
    threadTs: threadTs,
    useStaging,
  });
});

app.start().catch((error) => {
  console.error(error);
  process.exit(1);
});
