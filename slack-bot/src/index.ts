import { App, LogLevel } from "@slack/bolt";
import { drizzle } from "drizzle-orm/neon-serverless";
import { threads } from "./db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { CronJob } from "cron";
import { config } from "dotenv";
import fetch from "node-fetch";
import https from "https";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";

// Load environment variables from .env file
config();

const db = drizzle(process.env.DATABASE_URL!);

let BACKEND_API_HOST: string;
if (process.env.NODE_ENV === "production") {
  BACKEND_API_HOST = "https://platform-muddy-meadow-938.fly.dev";
} else {
  // BACKEND_API_HOST = "https://platform-muddy-meadow-938.fly.dev";
  BACKEND_API_HOST = "http://localhost:4444";
}

const app = new App({
  token: process.env.TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  appToken: process.env.APP_TOKEN,
  logLevel: LogLevel.DEBUG,
  socketMode: true,
});

const job = CronJob.from({
  cronTime: "*/30 * * * * *", // every 30 seconds
  onTick: async function () {
    const undeployedApps = await db
      .select()
      .from(threads)
      .where(and(eq(threads.deployed, false), isNotNull(threads.appId)));

    for (const thread of undeployedApps) {
      const appStatus = await fetch(
        `${BACKEND_API_HOST}/apps/${thread.appId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BACKEND_API_SECRET}`,
          },
        },
      );
      const appStatusJson = await appStatus.json();

      // Check for initial deployment
      if (appStatusJson.flyAppId && !thread.deployed) {
        await app.client.chat.postMessage({
          channel: thread.channelId || "",
          thread_ts: thread.threadTs,
          text: `✅ The app has been successfully deployed, go and talk to it!
Download the code here: ${appStatusJson.readUrl}`,
        });

        await db
          .update(threads)
          .set({
            deployed: true,
            s3Checksum: appStatusJson.s3Checksum,
            appId: appStatusJson.appId,
          })
          .where(eq(threads.threadTs, thread.threadTs));
      }
    }

    // Also check deployed apps for code changes
    const deployedApps = await db
      .select()
      .from(threads)
      .where(and(eq(threads.deployed, true), isNotNull(threads.appId)));

    for (const thread of deployedApps) {
      const appStatus = await fetch(
        `${BACKEND_API_HOST}/apps/${thread.appId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BACKEND_API_SECRET}`,
          },
        },
      );
      const appStatusJson = await appStatus.json();

      if (
        appStatusJson.s3Checksum &&
        appStatusJson.s3Checksum !== thread.s3Checksum
      ) {
        await app.client.chat.postMessage({
          channel: thread.channelId || "",
          thread_ts: thread.threadTs,
          text: `🔄 Your app's code has been updated and is being redeployed!`,
        });

        await db
          .update(threads)
          .set({
            s3Checksum: appStatusJson.s3Checksum,
          })
          .where(eq(threads.threadTs, thread.threadTs));
      }
    }
  },
  start: true,
});

job.start();

// Function to download a file from Slack
async function downloadFileFromSlack(
  fileId: string,
): Promise<{ filePath: string; fileName: string }> {
  try {
    console.log(`Downloading file with ID: ${fileId}`);

    // Get file info
    const fileInfoResponse = await fetch(
      `https://slack.com/api/files.info?file=${fileId}`
    );

    if (!fileInfoResponse.ok) {
      throw new Error(
        `Failed to get file info: ${fileInfoResponse.statusText}`,
      );
    }

    const fileInfo = await fileInfoResponse.json();

    if (!fileInfo.ok || !fileInfo.file) {
      throw new Error(`Failed to get file info: ${JSON.stringify(fileInfo)}`);
    }

    const file = fileInfo.file;
    const fileUrl = file.url_private;
    const fileName = file.name;

    console.log(`File URL: ${fileUrl}, File Name: ${fileName}`);

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Download the file
    const filePath = path.join(tempDir, fileName);
    const fileStream = fs.createWriteStream(filePath);

    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    await pipeline(response.body, fileStream);

    console.log(`File downloaded to: ${filePath}`);

    return { filePath, fileName };
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

async function appIteration({
  prompt,
  channelId,
  threadTs,
  userId,
  useStaging,
  sourceCodeFileId,
  appId,
}: {
  prompt: string;
  channelId: string;
  threadTs: string;
  userId: string;
  useStaging: boolean;
  sourceCodeFileId?: string;
  appId?: string;
}) {
  try {
    console.log("calling generate endpoint");

    let requestBody: any = {
      prompt,
      userId,
      useStaging,
      appId,
      clientSource: "slack",
    };

    // If a source code file ID is provided, download the file and prepare to send it
    if (sourceCodeFileId) {
      try {
        // Download the file
        const { filePath, fileName } = await downloadFileFromSlack(
          sourceCodeFileId,
        );

        // Read the file as a base64 string
        const fileContent = fs.readFileSync(filePath);
        const base64Content = fileContent.toString("base64");

        // Add the file content to the request body
        requestBody.sourceCodeFile = {
          name: fileName,
          content: base64Content,
        };

        // Clean up the temporary file
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Error processing source code file:", error);
        // Send an error message to the user
        await app.client.chat.postMessage({
          channel: channelId,
          thread_ts: threadTs,
          text: `There was an error processing your source code file: ${error instanceof Error ? error.message : String(error)}`,
        });
        return; // Exit the function instead of continuing
      }
    }

    try {
      const response = await fetch(`${BACKEND_API_HOST}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("generate endpoint returned", response);

      if (response.ok) {
        const generateResult: {
          newApp: {
            id: string;
          };
          message: string;
        } = await response.json();

        console.log("generateResult", generateResult);

        const appId = generateResult.newApp.id;

        // Update the initial message to include the app ID
        await app.client.chat.postMessage({
          channel: channelId,
          thread_ts: threadTs,
          text: `[App ID: ${appId}] ${generateResult.message}`,
        });

        await db
          .update(threads)
          .set({
            appId: appId,
          })
          .where(eq(threads.threadTs, threadTs));
      } else {
        const errorMessage = await response.text();

        await app.client.chat.postMessage({
          channel: channelId,
          thread_ts: threadTs,
          text: `There was an error while deploying the app: ${errorMessage}`,
        });
      }
    } catch (fetchError) {
      console.error("Error calling generate endpoint:", fetchError);
      await app.client.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: `There was an error connecting to the backend service: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
      });
    }
  } catch (error) {
    console.error("Unexpected error in appIteration:", error);

    if (error instanceof DOMException && error.name === "TimeoutError") {
      await app.client.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: "More than 10 minutes have passed and we have timed out.",
      });
      return;
    }
    
    // Send a generic error message instead of re-throwing
    try {
      await app.client.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      });
    } catch (messageError) {
      console.error("Failed to send error message:", messageError);
    }
  }
}

async function handleAppGeneration({
  channelId,
  userId,
  prompt,
  client,
  threadTs,
  useStaging,
  sourceCodeFileId,
}: {
  channelId: string;
  userId: string;
  prompt: string;
  client: any;
  threadTs: string;
  useStaging: boolean;
  sourceCodeFileId?: string;
}) {
  const stagingText = useStaging ? "staging" : "production";

  let messageText;
  if (sourceCodeFileId) {
    messageText = `Since you uploaded the source code, I'm going to just deploy it. This will take 1-2 minutes.`;
  } else {
    messageText = `I'm going to start generating an app for you with the ${stagingText} agent server. This will take a few minutes.`;
  }

  const msg = await client.chat.postMessage({
    channel: channelId,
    thread_ts: threadTs,
    text: messageText,
  });

  if (!msg.ts) {
    throw new Error("Message not found");
  }

  await db.insert(threads).values({
    threadTs,
    authorId: userId,
    channelId,
    useStaging: useStaging,
  });

  appIteration({
    prompt,
    channelId,
    threadTs,
    userId,
    useStaging,
    sourceCodeFileId,
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
      and(eq(threads.threadTs, threadTs), eq(threads.authorId, event.user)),
    );

  if (threadResult.length !== 1) {
    return;
  }

  if (event.user !== threadResult[0].authorId) {
    return;
  }

  const thread = threadResult[0];

  appIteration({
    prompt,
    channelId: event.channel,
    threadTs: thread.threadTs,
    userId: event.user,
    appId: thread.appId || undefined, // Use the stored appId value
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
    text: "Let's create an app with your prompt!",
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
              text: "Create App",
              emoji: true,
            },
            action_id: "open_app_modal",
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
app.action("open_app_modal", async ({ ack, body, client }) => {
  await ack();

  // Type assertion for body to access actions property
  const actionBody = body as any;
  const { prompt, channelId, userId, threadTs } = JSON.parse(
    actionBody.actions[0].value,
  );

  console.log("open_app_modal action triggered");
  console.log(
    "Action body structure:",
    JSON.stringify(Object.keys(actionBody)),
  );

  // Extract the message timestamp from the appropriate location
  let messageTs;
  if (actionBody.message && actionBody.message.ts) {
    messageTs = actionBody.message.ts;
  } else if (actionBody.container && actionBody.container.message_ts) {
    messageTs = actionBody.container.message_ts;
  } else {
    messageTs = threadTs; // Fallback to threadTs if neither is available
  }

  console.log("messageTs:", messageTs);

  // Default run mode is telegram
  const isStaging = false; // Staging not selected initially
  const codeMode = "generate"; // Default to generate code

  // Use the buildModalBlocks function for consistency
  const blocks = buildModalBlocks(
    isStaging,
    codeMode,
  );

  await client.views.open({
    trigger_id: actionBody.trigger_id,
    view: {
      type: "modal",
      callback_id: "app_modal",
      title: {
        type: "plain_text",
        text: "Configure App",
      },
      blocks,
      private_metadata: JSON.stringify({
        prompt,
        channelId,
        userId,
        threadTs,
        messageTs,
      }),
      submit: {
        type: "plain_text",
        text: "Submit",
      },
    },
  });
});

// Add this handler to process the modal submission
app.view("app_modal", async ({ ack, body, view, client }) => {
  await ack();

  const { prompt, channelId, userId, threadTs, messageTs } = JSON.parse(
    view.private_metadata,
  );

  console.log("View state:", JSON.stringify(Object.keys(view.state.values)));

  // Extract the selected run mode

  // Extract the selected code mode
  const codeMode =
    view.state.values.code_mode_block.code_mode_radio.selected_option?.value ||
    "generate";
  console.log("Selected code mode:", codeMode);

  // Check if a source code file was uploaded (only if upload code mode)
  let sourceCodeFileId: string | undefined;
  let hasUploadedFile = false;

  if (
    codeMode === "upload" &&
    view.state.values.source_code_block &&
    view.state.values.source_code_block.source_code_input
  ) {
    const fileInput = view.state.values.source_code_block.source_code_input;
    console.log("File input state:", JSON.stringify(fileInput));

    if (fileInput.files && fileInput.files.length > 0) {
      sourceCodeFileId = fileInput.files[0].id;
      hasUploadedFile = true;
      console.log("Source code file ID:", sourceCodeFileId);
    } else {
      // If upload mode is selected but no file is uploaded, show an error
      await ack({
        response_action: "errors",
        errors: {
          source_code_block: "Please upload a ZIP file with your source code",
        },
      });
      return;
    }
  }

  console.log("Source code file uploaded:", hasUploadedFile);

  // Check if staging is selected (only if generate code mode)
  let useStaging = false;
  if (
    codeMode === "generate" &&
    view.state.values.staging_block &&
    view.state.values.staging_block.staging_checkbox
  ) {
    const stagingBlock = view.state.values.staging_block.staging_checkbox;
    console.log("Staging block state:", JSON.stringify(stagingBlock));

    if (
      stagingBlock.selected_options &&
      stagingBlock.selected_options.length > 0
    ) {
      useStaging = true;
    }
  }

  console.log("useStaging:", useStaging);
  console.log("View blocks:", JSON.stringify(Object.keys(view.state.values)));

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

  await handleAppGeneration({
    channelId,
    userId,
    prompt,
    client,
    threadTs: threadTs,
    useStaging,
    sourceCodeFileId,
  });
});

// Helper function to build modal blocks
function buildModalBlocks(
  isStaging: boolean,
  codeMode: string = "generate", // Default to generate code
) {
  console.log("Building modal blocks with params:", {
    isStaging,
    codeMode,
  });
  const blocks: any[] = [];

  // Add the code mode selection block (always first)
  blocks.push({
    type: "section",
    block_id: "code_mode_block",
    text: {
      type: "mrkdwn",
      text: "*Code Mode*",
    },
    accessory: {
      type: "radio_buttons",
      action_id: "code_mode_radio",
      initial_option: {
        text: {
          type: "plain_text",
          text: codeMode === "upload" ? "Upload Code" : "Generate Code",
        },
        value: codeMode,
      },
      options: [
        {
          text: {
            type: "plain_text",
            text: "Upload Code",
          },
          value: "upload",
        },
        {
          text: {
            type: "plain_text",
            text: "Generate Code",
          },
          value: "generate",
        },
      ],
    },
  });

  // Add the source code block only if upload code mode is selected
  if (codeMode === "upload") {
    blocks.push({
      type: "input",
      block_id: "source_code_block",
      element: {
        type: "file_input",
        action_id: "source_code_input",
        filetypes: ["zip"],
        max_files: 1,
      },
      label: {
        type: "plain_text",
        text: "Source Code (ZIP file)",
      },
    });
  }

  // Only add the staging block if generate code mode is selected
  if (codeMode === "generate") {
    const checkboxAccessory: any = {
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
    };

    // Only add initial_options if staging is selected
    if (isStaging) {
      checkboxAccessory.initial_options = [
        {
          text: {
            type: "plain_text",
            text: "Use staging",
          },
          value: "use_staging",
        },
      ];
    }

    blocks.push({
      type: "section",
      block_id: "staging_block",
      text: {
        type: "mrkdwn",
        text: "*Environment*",
      },
      accessory: checkboxAccessory,
    });
  }

  return blocks;
}

// Add this handler for the code mode selection
app.action("code_mode_radio", async ({ ack, body, client }) => {
  await ack();

  const actionBody = body as any;
  const selectedCodeMode = actionBody.actions[0].selected_option.value;
  const viewId = actionBody.view.id;
  const privateMetadata = actionBody.view.private_metadata;

  console.log("code_mode_radio action triggered");
  console.log("selectedCodeMode:", selectedCodeMode);
  console.log("Action body:", JSON.stringify(actionBody.actions[0]));

  // Get the current view state
  const viewState = actionBody.view.state;

  // Check if staging is selected
  let isStaging = false;
  if (
    viewState.values.staging_block &&
    viewState.values.staging_block.staging_checkbox &&
    viewState.values.staging_block.staging_checkbox.selected_options &&
    viewState.values.staging_block.staging_checkbox.selected_options.length > 0
  ) {
    isStaging = true;
  }
  
  // Update the modal with the new blocks based on the selected code mode
  const blocks = buildModalBlocks(isStaging, selectedCodeMode);
  
  // Update the view with the new blocks
  await client.views.update({
    view_id: viewId,
    view: {
      type: "modal",
      callback_id: "app_modal",
      title: {
        type: "plain_text",
        text: "Configure App",
      },
      blocks,
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
