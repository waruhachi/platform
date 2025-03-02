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
      const botStatus = await fetch(`${BACKEND_API_HOST}/chatbots/${bot.chatbotId}`);
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
  runMode,
}: {
  telegramBotToken: string;
  prompt: string;
  channelId: string;
  threadTs: string;
  userId: string;
  useStaging: boolean;
  runMode: string;
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
        telegramBotToken: runMode === "telegram" ? telegramBotToken : undefined,
        userId,
        useStaging,
        runMode,
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
  runMode,
}: {
  channelId: string;
  userId: string;
  prompt: string;
  botToken: string;
  client: any;
  threadTs: string;
  useStaging: boolean;
  runMode: string;
}) {
  const stagingText = useStaging ? "to staging" : "to production";
  const runModeText = runMode === "http-server" ? "HTTP" : "Telegram";
  const msg = await client.chat.postMessage({
    channel: channelId,
    thread_ts: threadTs,
    text: `I'm going to start generating a ${runModeText} bot for you ${stagingText}. This will take a few minutes.`,
  });

  if (!msg.ts) {
    throw new Error("Message not found");
  }

  await db.insert(threads).values({
    threadTs: msg.ts,
    chatbotToken: botToken,
    authorId: userId,
    channelId,
    useStaging: useStaging,
    runMode: runMode,
  });

  chatbotIteration({
    telegramBotToken: botToken,
    prompt,
    channelId,
    threadTs: msg.ts,
    userId,
    useStaging,
    runMode,
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
    runMode: thread.runMode ?? "telegram", // Use the stored runMode value with a default
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

  // Type assertion for body to access actions property
  const actionBody = body as any;
  const { prompt, channelId, userId, threadTs } = JSON.parse(
    actionBody.actions[0].value
  );

  // Default run mode is telegram
  const initialRunMode = "telegram";

  // Create blocks array based on the initial run mode
  const blocks: any[] = [
    {
      type: "section",
      block_id: "run_mode_block",
      text: {
        type: "mrkdwn",
        text: "*Run Mode*",
      },
      accessory: {
        type: "radio_buttons",
        action_id: "run_mode_radio",
        initial_option: {
          text: {
            type: "plain_text",
            text: "Telegram",
          },
          value: "telegram",
        },
        options: [
          {
            text: {
              type: "plain_text",
              text: "Telegram",
            },
            value: "telegram",
          },
          {
            text: {
              type: "plain_text",
              text: "HTTP",
            },
            value: "http-server",
          },
        ],
      },
    }
  ];

  // Only add the token input block if Telegram mode is selected
  if (initialRunMode === "telegram") {
    blocks.push({
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
        text: "Telegram Bot Token",
      },
    });
  }

  // Add the staging block
  blocks.push({
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
  });

  await client.views.open({
    trigger_id: actionBody.trigger_id,
    view: {
      type: "modal",
      callback_id: "bot_token_modal",
      title: {
        type: "plain_text",
        text: "Configure Bot",
      },
      blocks: blocks,
      private_metadata: JSON.stringify({
        prompt,
        channelId,
        userId,
        threadTs,
        messageTs: (actionBody.container as any).message_ts,
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
  
  // Extract the selected run mode
  const runMode = view.state.values.run_mode_block.run_mode_radio.selected_option?.value || "telegram";
  
  // Get the token value if the token block exists
  let botToken = "";
  if (runMode === "telegram") {
    // Check if token_block exists in the view state
    const tokenBlock = view.state.values.token_block;
    if (tokenBlock && tokenBlock.token_input) {
      botToken = tokenBlock.token_input.value || "";
    }
    
    // Validate token is provided for Telegram bots
    if (!botToken) {
      await ack({
        response_action: "errors",
        errors: {
          token_block: "Please enter a valid Telegram bot token",
        },
      });
      return;
    }
  }

  const selectedOptions = view.state.values.staging_block.staging_checkbox.selected_options;
  const useStaging = selectedOptions && selectedOptions.length > 0 ? true : false;

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
    runMode,
  });
});

// Add this handler for the run mode selection
app.action("run_mode_radio", async ({ ack, body, client }) => {
  await ack();

  const actionBody = body as any;
  const selectedRunMode = actionBody.actions[0].selected_option.value;
  const viewId = actionBody.view.id;
  const privateMetadata = actionBody.view.private_metadata;

  // Get the current blocks from the view
  const currentBlocks = actionBody.view.blocks;
  
  // Create new blocks array
  const newBlocks = [];
  
  // Add the run mode block (always present)
  const runModeBlock = currentBlocks.find((block: any) => block.block_id === "run_mode_block");
  if (runModeBlock) {
    newBlocks.push(runModeBlock);
  }
  
  // Add the token block only if Telegram mode is selected
  if (selectedRunMode === "telegram") {
    // Check if token block already exists
    const existingTokenBlock = currentBlocks.find((block: any) => block.block_id === "token_block");
    
    if (existingTokenBlock) {
      // Use existing token block if it exists
      newBlocks.push(existingTokenBlock);
    } else {
      // Create a new token block if it doesn't exist
      newBlocks.push({
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
          text: "Telegram Bot Token",
        },
      } as any); // Type assertion to avoid linter errors
    }
  }
  
  // Add the staging block (always present)
  const stagingBlock = currentBlocks.find((block: any) => block.block_id === "staging_block");
  if (stagingBlock) {
    newBlocks.push(stagingBlock);
  }

  // Update the view with the new blocks
  await client.views.update({
    view_id: viewId,
    view: {
      type: "modal",
      callback_id: "bot_token_modal",
      title: {
        type: "plain_text",
        text: "Configure Bot",
      },
      blocks: newBlocks,
      private_metadata: privateMetadata,
      submit: {
        type: "plain_text",
        text: "Submit",
      },
    },
  });
});

app.start().catch((error) => {
  console.error(error);
  process.exit(1);
});
