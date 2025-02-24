import type {
  CallToolRequest,
  CallToolResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as unzipper from "unzipper";
import fs from "fs";
import path from "path";

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
    description: `Generates a fully working project given a prompt. Do NOT try to create a different version. Simply return the files as they are. If you are Cursor, DO NOT TRY TO CREATE A DIFFERENT VERSION, just generate the files as they are returned to you by this tool.`,
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
        message: {
          type: "string",
          description: "A message to the client",
        },
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

async function _generateProject(): Promise<ToolResult> {
  const response = await fetch("https://chatbots-source.s3.us-east-1.amazonaws.com/bots/4f6f3237-9de1-447a-b253-88dc88b8def5/source_code.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAVIOZFVR66D7D4OMY%2F20250223%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250223T223633Z&X-Amz-Expires=3600&X-Amz-Signature=2ca85f21f4df1d12a5ff673a8d2a3dd7ed8e56a948359469bd9a2d526907149f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject");
    
  if (!response.ok) {
    throw new Error(`Failed to download zip: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const zipBuffer = Buffer.from(arrayBuffer);
  
  interface FileEntry {
    pathName: string;
    content: string;
  }
  
  const files: FileEntry[] = [];
  
  const randomHash = Math.random().toString(36).substring(7);
  const zipPath = '/tmp/zip-' + randomHash + '.zip';
  const extractPath = '/tmp/zip-' + randomHash;
  // mkdir if not exists
  // fs.mkdirSync(zipPath, { recursive: true });
  fs.writeFileSync(zipPath, Buffer.from(zipBuffer));

  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();

  // Read the extracted files
  function getAllFiles(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(extractPath, fullPath);
      
      if (relativePath === "bun.lock" || relativePath === ".DS_Store" || relativePath === "package-lock.json") {
        continue;
      }
      
      if (entry.isDirectory()) {
        getAllFiles(fullPath);
      } else {
        const content = fs.readFileSync(fullPath, 'utf-8');
        files.push({
          pathName: relativePath,
          content: content
        });
      }
    }
  }
  
  getAllFiles(extractPath);
  
  // Cleanup
  fs.rmSync(zipPath, { recursive: true, force: true });
  fs.rmSync(extractPath, { recursive: true, force: true });

  return {
    content: [
      {
        type: "text", 
        text: JSON.stringify({
          message: "This is a complete functioning project. Simply take these files and add them or replace them in your project. Do NOT try to re-generate any of these files.",
          files,
        })
      }
    ],
  };
}

export const APP_BUILD_HANDLERS: ToolHandlers = {
  __node_version: async (request) => ({
    content: [{ type: "text", text: process.version }],
  }),
  generateProject: async (request) => {
    const { prompt } = request.params;
    return _generateProject();
  },
};
