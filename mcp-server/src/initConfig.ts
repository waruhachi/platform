import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);
const claudeConfigPath = path.join(
  os.homedir(),
  "Library",
  "Application Support",
  "Claude",
  "claude_desktop_config.json",
);

const MCP_APP_BUILD_SERVER = "app-build";

export const parseArgs = () => {
  const args = process.argv;

  if (args.length !== 3) {
    console.error("Invalid number of arguments");
    process.exit(1);
  }

  return {
    executablePath: args[1],
    command: args[2],
  };
};

export async function handleInit({
  executablePath,
}: {
  executablePath: string;
}) {
  // If the executable path is a local path to the dist/index.js file, use it directly
  // Otherwise, use the name of the package to always load the latest version from remote
  const serverPath = executablePath.includes("dist/index.js")
    ? executablePath
    : packageJson.name;

  const appBuildConfig = {
    command: "npx",
    args: ["-y", serverPath, "start"],
  };

  const configDir = path.dirname(claudeConfigPath);
  if (!fs.existsSync(configDir)) {
    console.log(chalk.blue("Creating Claude config directory..."));
    fs.mkdirSync(configDir, { recursive: true });
  }

  const existingConfig = fs.existsSync(claudeConfigPath)
    ? JSON.parse(fs.readFileSync(claudeConfigPath, "utf8"))
    : { mcpServers: {} };

  if (MCP_APP_BUILD_SERVER in (existingConfig?.mcpServers || {})) {
    console.log(chalk.yellow("Replacing existing App.Build MCP config..."));
  }

  const newConfig = {
    ...existingConfig,
    mcpServers: {
      ...existingConfig.mcpServers,
      [MCP_APP_BUILD_SERVER]: appBuildConfig,
    },
  };

  fs.writeFileSync(claudeConfigPath, JSON.stringify(newConfig, null, 2));
  console.log(chalk.green(`Config written to: ${claudeConfigPath}`));
  console.log(
    chalk.blue(
      "The App.Build MCP server will start automatically the next time you open Claude.",
    ),
  );
}
