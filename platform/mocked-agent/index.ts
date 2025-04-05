import Fastify from "fastify";
import type { FastifyRequest, FastifyReply } from "fastify";

export const fastify = Fastify({
  logger: true,
});

// Mock response for /prepare endpoint
const mockPrepareResponse = {
  status: "success",
  message:
    "Your bot's type specification has been prepared. Use cases implemented: sendMessage, registerCommand, processUpdate, configureBotSettings",
  trace_id: "36c9e4bc5ed045a99bde1fd6c8a7f6d4",
  metadata: {
    reasoning: `Based on the user's request, they want to create a "Hello World" Telegram bot. This is a simple bot that would likely support basic functionalities like:

1. Sending greetings to users
2. Replying to basic commands
3. Possibly managing conversations

The TypeSpec model should reflect these basic functionalities. A Telegram bot typically works with messages, commands, and user information. I'll create appropriate models and an interface that supports these operations.

Key models:
- Message: To represent messages sent/received
- User: To represent Telegram users 
- Command: To represent bot commands
- ReplyOptions: For configuring bot replies

The main interface will include functions for:
- Sending messages
- Processing commands
- Handling user interactions
- Managing bot settings`,
    typespec: `model Message {
  text: string;
  chatId: string;
}

model SendMessageOptions {
  text: string;
  chatId: string;
  parseMode?: string;
  replyToMessageId?: string;
}

model CommandOptions {
  name: string;
  description: string;
}

model UserOptions {
  userId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

model ProcessUpdateOptions {
  updateId: string;
  message?: Message;
  callbackQuery?: string;
}

model BotSettingsOptions {
  botName: string;
  description?: string;
  commands?: CommandOptions[];
}

interface TelegramBot {
  @scenario(
  """
  Scenario: Send greeting message
  When user starts bot with "/start" command
  Then bot should send welcome message
  Examples:
    | Command  | Expected Response             |
    | "/start" | "Hello! I'm a Telegram bot."  |
    | "/help"  | "I can respond to basic commands." |
  """)
  @llm_func("Send a message to a specific chat")
  sendMessage(options: SendMessageOptions): void;

  @scenario(
  """
  Scenario: Register a command
  When developer adds a new command
  Then bot should recognize and respond to it
  Examples:
    | Command Name | Command Description   | Result                |
    | "hello"      | "Say hello"           | Command registered    |
    | "time"       | "Show current time"   | Command registered    |
  """)
  @llm_func("Register a new command for the bot")
  registerCommand(options: CommandOptions): void;

  @scenario(
  """
  Scenario: Process incoming update
  When Telegram sends an update to the bot
  Then bot should parse and handle the update appropriately
  Examples:
    | Update Type | Content           | Result                     |
    | "message"   | "Hello bot"       | Bot processes text message |
    | "callback"  | "button_clicked"  | Bot handles callback       |
  """)
  @llm_func("Process incoming updates from Telegram")
  processUpdate(options: ProcessUpdateOptions): void;

  @scenario(
  """
  Scenario: Configure bot settings
  When developer configures the bot
  Then bot profile should be updated with new settings
  Examples:
    | Bot Name      | Description         | Result                 |
    | "HelloBot"    | "A greeting bot"    | Settings updated       |
    | "AssistBot"   | "Helper bot"        | Settings updated       |
  """)
  @llm_func("Configure basic bot settings")
  configureBotSettings(options: BotSettingsOptions): void;
}`,
    error_output: null,
    scenarios: {
      sendMessage: `Scenario: Send greeting message
  When user starts bot with "/start" command
  Then bot should send welcome message
  Examples:
    | Command  | Expected Response             |
    | "/start" | "Hello! I'm a Telegram bot."  |
    | "/help"  | "I can respond to basic commands." |`,
      registerCommand: `Scenario: Register a command
  When developer adds a new command
  Then bot should recognize and respond to it
  Examples:
    | Command Name | Command Description   | Result                |
    | "hello"      | "Say hello"           | Command registered    |
    | "time"       | "Show current time"   | Command registered    |`,
      processUpdate: `Scenario: Process incoming update
  When Telegram sends an update to the bot
  Then bot should parse and handle the update appropriately
  Examples:
    | Update Type | Content           | Result                     |
    | "message"   | "Hello bot"       | Bot processes text message |
    | "callback"  | "button_clicked"  | Bot handles callback       |`,
      configureBotSettings: `Scenario: Configure bot settings
  When developer configures the bot
  Then bot profile should be updated with new settings
  Examples:
    | Bot Name      | Description         | Result                 |
    | "HelloBot"    | "A greeting bot"    | Settings updated       |
    | "AssistBot"   | "Helper bot"        | Settings updated       |`,
    },
  },
};

// Define routes
fastify.post(
  "/prepare",
  async (request: FastifyRequest, reply: FastifyReply) => {
    // Add a 5-second delay before responding
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return reply.status(200).send(mockPrepareResponse);
  },
);

fastify.post(
  "/recompile",
  async (
    request: FastifyRequest<{
      Body: {
        writeUrl: string;
      };
    }>,
    reply: FastifyReply,
  ) => {
    // Add a 2-second delay before responding
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // schedule a task to run in 5 seconds
    setTimeout(async () => {
      // take the `writeUrl` from the request body and write the `./source_code.zip` file to it
      const writeUrl = request.body.writeUrl;
      fetch(writeUrl, {
        method: "PUT",
        body: Bun.file("./source_code.zip"),
      });
    }, 5000);

    return reply.status(200).send({});
  },
);

// Start the server
export const start = async () => {
  try {
    return await fastify.listen({ port: 5575, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  start();
}
