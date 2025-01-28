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

config();

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN!,
  },
  region: process.env.AWS_REGION!,
});

async function createS3DirectoryWithPresignedUrls(
  botId: string
): Promise<{ writeUrl: string; readUrl: string }> {
  const key = `bots/${botId}/`;
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
  const { description } = request.body as { description: string };

  const botId = uuidv4();
  const { writeUrl, readUrl } = await createS3DirectoryWithPresignedUrls(botId);

  const newBot = await db
    .insert(chatbots)
    .values({
      id: botId,
      name: description,
      ownerId: uuidv4(), // TODO proper auth
    })
    .returning();

  return reply.send({ newBot, writeUrl, readUrl });
});

const start = async () => {
  try {
    await app.listen({ port: 4444 });
    console.log("Server running at http://localhost:4444");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
