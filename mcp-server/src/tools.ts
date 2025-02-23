import type {
  CallToolRequest,
  CallToolResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export const APP_BUILD_TOOLS = [
  {
    name: "__node_version" as const,
    description: `Get the Node.js version used by the MCP server`,
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "generateProject" as const,
    description: `Generates a full project given a prompt`,
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "The prompt to generate the project from",
        },
      },
    },
    outputSchema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pathName: { type: "string" },
              content: { type: "string" },
            },
          },
        },
      },
    },
  },
];

export type AppBuildToolName = (typeof APP_BUILD_TOOLS)[number]["name"];
export type ToolResult = z.infer<typeof CallToolResultSchema>;

type ToolHandlers = {
  [K in AppBuildToolName]: (request: CallToolRequest) => Promise<ToolResult>;
};

export const APP_BUILD_HANDLERS: ToolHandlers = {
  __node_version: async (request) => ({
    content: [{ type: "text", text: process.version }],
  }),
  generateProject: async (request) => {
    throw new Error("Not implemented");
  },
};
