#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { APP_BUILD_HANDLERS, APP_BUILD_TOOLS } from "./tools.js";
import type { ToolResult } from "./tools.js";
import { isAppBuildToolName } from "./utils.js";
import { handleInit, parseArgs } from "./initConfig.js";
import { program } from "commander";

const commands = ["init", "start"] as const;
const { command, executablePath } = parseArgs();
if (!commands.includes(command as (typeof commands)[number])) {
  console.error(`Invalid command: ${command}`);
  process.exit(1);
}

if (command === "init") {
  await handleInit({
    executablePath,
  });
  process.exit(0);
}

const server = new Server(
  {
    name: "mcp-server-app-build",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: APP_BUILD_TOOLS };
});

// Handle tool calls
server.setRequestHandler(
  CallToolRequestSchema,
  async (request): Promise<ToolResult> => {
    const toolName = request.params.name;

    try {
      if (isAppBuildToolName(toolName)) {
        return await APP_BUILD_HANDLERS[toolName](request);
      }

      throw new Error(`Unknown tool: ${toolName}`);
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
);

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
