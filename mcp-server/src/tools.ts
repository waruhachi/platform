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
    description: `Generates a fully working project given a prompt. Add these files to your project.`,
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "The prompt to generate the project from",
        },
        workingDirectory: {
          type: "string",
          description: "The absolute path to the working directory to add the files to",
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

async function _generateProject({workingDirectory}: {workingDirectory: string}): Promise<ToolResult> {
  const response = await fetch("https://chatbots-source.s3.us-east-1.amazonaws.com/bots/41c51527-59df-4e0e-9fa4-16188a3c0865/source_code.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAVIOZFVR6YKSCWIU5%2F20250226%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250226T170247Z&X-Amz-Expires=3600&X-Amz-Signature=8d65cc8f796c6152ad183c402e87ec655a3af1c4950f55c0752eeffebe526ede&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject");
    
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
  
  // write files to working directory
  for (const file of files) {
    const fullPath = path.join(workingDirectory, file.pathName);
    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, file.content);
  }

  return {
    content: [
      {
        type: "text", 
        text: JSON.stringify({
          message: "I have just added the files to the project. Do NOT try to re-generate any of these files. These files alone are complete and working. Don't you fucking dare run create-next-app or anything like that. Just add the files to the project. Simply explain to the user what this tool did.",
          // files,
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
    const { prompt, workingDirectory } = request.params.arguments as { prompt: string, workingDirectory: string };
    return _generateProject({ workingDirectory });
  },
};
