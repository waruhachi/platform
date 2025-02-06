import { drizzle } from "drizzle-orm/neon-serverless";
import fastify from "fastify";
import { chatbots } from "./db/schema";
import { v4 as uuidv4 } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "dotenv";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { createApiClient } from "@neondatabase/api-client";
import * as unzipper from "unzipper";
import { eq } from "drizzle-orm";

config();

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN!,
  },
  region: process.env.AWS_REGION!,
});

const neonClient = createApiClient({
  apiKey: process.env.NEON_API_KEY!,
});

async function createS3DirectoryWithPresignedUrls(
  botId: string
): Promise<{ writeUrl: string; readUrl: string }> {
  const key = `bots/${botId}/source_code.zip`;
  const baseParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  };

  const writeCommand = new PutObjectCommand(baseParams);
  const readCommand = new GetObjectCommand(baseParams);

  const writeUrl = await getSignedUrl(s3Client, writeCommand, {
    expiresIn: 3600,
  });
  const readUrl = await getSignedUrl(s3Client, readCommand, {
    expiresIn: 3600,
  });

  return { writeUrl, readUrl };
}

const app = fastify({
  logger: true,
});

const db = drizzle(process.env.DATABASE_URL!);

app.post("/generate", async (request, reply) => {
  try {
    const { prompt, telegramBotToken, userId } = request.body as {
      prompt: string;
      telegramBotToken: string;
      userId: string;
    };

    const botId = uuidv4();
    const { writeUrl, readUrl } =
      await createS3DirectoryWithPresignedUrls(botId);

    const newBot = await db
      .insert(chatbots)
      .values({
        id: botId,
        name: prompt,
        ownerId: userId,
        telegramBotToken,
      })
      .returning();

    try {
      const compileResponse = await fetch("http://44.244.252.49:8080/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AGENT_API_SECRET_AUTH!}`,
        },
        body: JSON.stringify({
          prompt,
          writeUrl,
          botId,
          // readUrl,
        }),
      });
      console.log("compileResponse", compileResponse);

      if (!compileResponse.ok) {
        throw new Error(`HTTP error! status: ${compileResponse.status}`);
      }

      const compileResult: {
        status: string;
        message: string;
        metadata: {
          functions: Array<{
            name: string;
            description: string;
            examples: Array<string>;
          }>;
        };
      } = await compileResponse.json();

      const downloadDir = path.join(process.cwd(), "downloads");
      const zipPath = path.join(downloadDir, `${botId}.zip`);
      const extractDir = path.join(downloadDir, botId);

      // Create downloads directory
      fs.mkdirSync(downloadDir, { recursive: true });
      fs.mkdirSync(extractDir, { recursive: true });

      // Download the zip with proper error handling
      const response = await fetch(readUrl);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(zipPath, Buffer.from(buffer));

      await fs
        .createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractDir }))
        .promise();

      const files = execSync(`ls -la ${extractDir}`).toString();
      console.log("Extracted files:", files);

      const packageJsonPath = execSync(
        `find ${extractDir} -name package.json -maxdepth 2 -print -quit`
      )
        .toString()
        .trim();
      const packageJsonDirectory = path.dirname(packageJsonPath);

      console.log("package.json directory:", packageJsonDirectory);

      // Create a Neon database
      const { data } = await neonClient.createProject({
        project: {},
      });
      const connectionString = data.connection_uris[0].connection_uri;

      let flyBinary;
      if (process.env.NODE_ENV === "production") {
        flyBinary = "/root/.fly/bin/fly";
      } else {
        flyBinary = "fly";
      }

      // Write the `Dockerfile` to the packageJsonDirectory
      fs.writeFileSync(
        path.join(packageJsonDirectory, "Dockerfile"),
        `
# syntax = docker/dockerfile:1
# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.2.1

FROM oven/bun:\${BUN_VERSION}-slim AS base
LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base AS build


# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

# Install node modules
COPY bun.lock package-lock.json package.json ./
RUN bun install --ci


# Copy application code
COPY . .

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime

EXPOSE 3000

CMD [ "bun", "run", "start" ]
`
      );

      // Find existing app with `telegramBotToken`
      const existingBots = await db
        .select({
          flyAppId: chatbots.flyAppId,
        })
        .from(chatbots)
        .where(eq(chatbots.telegramBotToken, telegramBotToken));

      console.log("existingBots", existingBots);

      if (existingBots.length > 0) {
        for (const existingBot of existingBots) {
          if (existingBot.flyAppId) {
            console.log(`Destroying ${existingBot.flyAppId}`);
            try {
              execSync(
                `${flyBinary} apps destroy ${existingBot.flyAppId} --yes --access-token '${process.env.FLY_IO_TOKEN!}'`,
                {
                  stdio: "inherit",
                }
              );
            } catch (error) {
              console.error("Error destroying fly app:", error);
            }
          }
        }
      }

      const flyAppName = `app-${botId}`;
      execSync(
        `${flyBinary} launch -y --env TELEGRAM_BOT_TOKEN=${telegramBotToken} --env APP_DATABASE_URL='${connectionString}' --env AWS_ACCESS_KEY_ID=${process.env.DEPLOYED_BOT_AWS_ACCESS_KEY_ID!} --env AWS_SECRET_ACCESS_KEY=${process.env.DEPLOYED_BOT_AWS_SECRET_ACCESS_KEY!} --access-token '${process.env.FLY_IO_TOKEN!}' --max-concurrent 1 --ha=false --no-db --no-deploy --name '${flyAppName}'`,
        { cwd: packageJsonDirectory, stdio: "inherit" }
      );

      await db.update(chatbots).set({
        flyAppId: flyAppName,
      });

      const flyTomlPath = path.join(packageJsonDirectory, "fly.toml");
      const flyTomlContent = fs.readFileSync(flyTomlPath, "utf8");
      const updatedContent = flyTomlContent.replace(
        "min_machines_running = 0",
        "min_machines_running = 1"
      );
      fs.writeFileSync(flyTomlPath, updatedContent);

      execSync(
        `${flyBinary} deploy --ha=false --max-concurrent 1 --access-token '${process.env.FLY_IO_TOKEN!}'`,
        { cwd: packageJsonDirectory, stdio: "inherit" }
      );

      if (process.env.NODE_ENV === "production") {
        if (fs.existsSync(downloadDir)) {
          fs.rmdirSync(downloadDir, { recursive: true });
        }
        if (fs.existsSync(extractDir)) {
          fs.rmdirSync(extractDir, { recursive: true });
        }
      }

      return reply.send({ newBot, writeUrl, readUrl, compileResult });
    } catch (error) {
      console.error("Error compiling bot:", error);
      return reply.status(500).send({ error: "Failed to compile bot" });
    }
  } catch (error) {
    console.error("Error generating  bot:", error);
    return reply.status(400).send({ error: "Bad request" });
  }
});
const start = async () => {
  try {
    await app.listen({ host: "0.0.0.0", port: 4444 });
    console.log("Server running at http://localhost:4444");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
