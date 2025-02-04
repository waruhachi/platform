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
  const key = `bots/${botId}/source_code.tar.gz`;
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
    const { prompt, telegramBotToken } = request.body as {
      prompt: string;
      telegramBotToken: string;
    };

    const botId = uuidv4();
    const { writeUrl, readUrl } =
      await createS3DirectoryWithPresignedUrls(botId);

    const newBot = await db
      .insert(chatbots)
      .values({
        id: botId,
        name: prompt,
        ownerId: uuidv4(), // TODO proper auth
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
      const tarballPath = path.join(downloadDir, `${botId}.tar.gz`);
      const extractDir = path.join(downloadDir, botId);

      // Create downloads directory
      fs.mkdirSync(downloadDir, { recursive: true });
      fs.mkdirSync(extractDir, { recursive: true });

      // Download the tarball
      const response = await fetch(readUrl);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(tarballPath, Buffer.from(buffer));

      // Extract the tarball
      execSync(`tar -xzf ${tarballPath} -C ${extractDir}`);

      const files = execSync(`ls -la ${extractDir}`).toString();
      console.log("Extracted files:", files);

      const packageJsonPath = execSync(
        `find ${extractDir} -name package.json -maxdepth 2 -print -quit`
      )
        .toString()
        .trim();
      const packageJsonDirectory = path.dirname(packageJsonPath);

      console.log("package.json path:", packageJsonPath);
      console.log("package.json directory:", packageJsonDirectory);

      // Create a Neon database
      const { data } = await neonClient.createProject({
        project: {},
      });
      const connectionString = data.connection_uris[0].connection_uri;

      // cd to the packageJson directory directory and run `fly launch` in there
      console.log("telegramBotToken", telegramBotToken);
      execSync(
        `fly launch -y --env TELEGRAM_BOT_TOKEN=${telegramBotToken} --env APP_DATABASE_URL='${connectionString}' --env AWS_ACCESS_KEY_ID=${process.env.DEPLOYED_BOT_AWS_ACCESS_KEY_ID!} --env AWS_SECRET_ACCESS_KEY=${process.env.DEPLOYED_BOT_AWS_SECRET_ACCESS_KEY!} --access-token '${process.env.FLY_IO_TOKEN!}' --max-concurrent 1 --ha=false --no-db`,
        { cwd: packageJsonDirectory }
      );

      // fs.rmdirSync(downloadDir, { recursive: true });
      // fs.rmdirSync(extractDir, { recursive: true });

      return reply.send({ newBot, writeUrl, readUrl, compileResult });
    } catch (error) {
      console.error("Error compiling bot:", error);
      return reply.status(500).send({ error: "Failed to compile bot" });
    }
  } catch (error) {
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
