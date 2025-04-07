import { config } from 'dotenv';
import fetch from 'node-fetch';
import os from 'os';

// Load environment variables from .env file
config();

let BACKEND_API_HOST: string;
if (process.env.NODE_ENV === 'production') {
  BACKEND_API_HOST = 'https://platform-muddy-meadow-938.fly.dev';
} else if (process.env.USE_MOCKED_AGENT === 'true') {
  BACKEND_API_HOST = 'http://127.0.0.1:4444';
} else {
  BACKEND_API_HOST = 'https://platform-muddy-meadow-938.fly.dev';
}

const BACKEND_BEARER_TOKEN = 'bOvfvvt3km3aJGYm6wvc25zy5wFZpiT1';

function generateMachineId(): string {
  const hostname = os.hostname();
  const username = os.userInfo().username;

  const machineInfo = `${hostname}-${username}`;
  return machineInfo;
}

export type Chatbot = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  flyAppId?: string | null;
  s3Checksum?: string | null;
  deployStatus: 'pending' | 'deploying' | 'deployed' | 'failed';
  traceId?: string | null;
  typespecSchema?: string | null;
  receivedSuccess: boolean;
  recompileInProgress: boolean;
  clientSource: 'slack' | 'cli';
};

export type ChatbotGenerationParams = {
  useStaging: boolean;
  prompt: string;
  botId?: string;
};

export type ChatBotSpecsGenerationParams = Omit<
  ChatbotGenerationParams,
  'botId'
>;

export type ChatbotGenerationResult = {
  chatbotId: string;
  message: string;
};

export const generateChatbot = async (params: ChatbotGenerationParams) => {
  try {
    const requestBody = {
      prompt: params.prompt,
      userId: generateMachineId(),
      useStaging: params.useStaging,
      botId: params.botId,
      clientSource: 'cli',
      useMockedAgent: process.env.USE_MOCKED_AGENT === 'true',
    };

    const response = await fetch(`${BACKEND_API_HOST}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const generateResult: {
        newBot: {
          id: string;
        };
        message: string;
      } = (await response.json()) as {
        newBot: {
          id: string;
        };
        message: string;
      };

      return {
        chatbotId: generateResult.newBot.id,
        message: generateResult.message,
        readUrl: '',
      };
    } else {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('generate endpoint error', error);

    let errorMessage = 'Unknown error occurred';
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      errorMessage = 'Request timed out after 10 minutes';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const generateChatbotSpec = async (
  params: ChatBotSpecsGenerationParams
): Promise<{
  chatbotId: string;
  message: string;
  readUrl: string;
}> => {
  return generateChatbot({ ...params, botId: undefined });
};

export const getChatbot = async (chatbotId: string) => {
  try {
    const botStatus = await fetch(`${BACKEND_API_HOST}/chatbots/${chatbotId}`, {
      headers: {
        // TODO: remove this
        Authorization: `Bearer ${BACKEND_BEARER_TOKEN}`,
      },
    });

    const botStatusJson = (await botStatus.json()) as Chatbot & {
      readUrl: string;
    };

    return {
      isDeployed: botStatusJson.deployStatus === 'deployed',
      ...botStatusJson,
    };
  } catch (error) {
    console.error('Error checking bot deployment status:', error);
    throw error;
  }
};

export const listChatBots = async () => {
  try {
    const response = await fetch(`${BACKEND_API_HOST}/chatbots`, {
      headers: {
        Authorization: `Bearer ${BACKEND_BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chatbots: ${response.statusText}`);
    }

    const chatbots = (await response.json()) as {
      data: Chatbot[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
    return chatbots;
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    throw error;
  }
};
