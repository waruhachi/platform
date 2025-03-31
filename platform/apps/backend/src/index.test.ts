import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { start as startBackend, app as backendApp } from "./index";
import {
  start as startMockedAgent,
  fastify as mockedAgentApp,
} from "../../../../mocked-agent/index";
import { config } from "dotenv";

config();

const BACKEND_API_HOST = "http://localhost:4444";

beforeAll(async () => {
  // Start backend server
  await startBackend();

  // Start mocked agent server
  await startMockedAgent();
});

afterAll(async () => {
  // Cleanup servers
  await backendApp.close();
  await mockedAgentApp.close();
});

describe("Telegram Bot Generation", () => {
  const telegramBotToken = "7380687946:AAHZpeSObIem-uGFA7rrgzzxgR1bh4Wl4hY";
  const userId = "123";

  test(
    "should create and build a hello world telegram bot",
    async () => {
      // Create bot
      const response1 = await fetch(`${BACKEND_API_HOST}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Create a hello world telegram bot",
          telegramBotToken,
          userId,
          useStaging: false,
          useMockedAgent: true,
          runMode: "telegram",
          clientSource: "slack",
        }),
      });

      expect(response1.ok).toBe(true);
      const data1 = await response1.json();
      expect(data1.error).toBeUndefined();
      expect(data1.newBot).toBeDefined();
      expect(data1.newBot.id).toBeDefined();

      // Build bot
      const response2 = await fetch(`${BACKEND_API_HOST}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "build it",
          telegramBotToken,
          userId,
          useStaging: false,
          useMockedAgent: true,
          botId: data1.newBot.id,
          runMode: "telegram",
          clientSource: "slack",
        }),
      });

      expect(response2.ok).toBe(true);
      const data2 = await response2.json();
      expect(data2.error).toBeUndefined();
    },
    { timeout: 60_000 },
  );
});
