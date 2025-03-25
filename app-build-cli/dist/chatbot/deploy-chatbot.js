import { config } from 'dotenv';
import fetch from 'node-fetch';
// Load environment variables from .env file
config();
let BACKEND_API_HOST;
if (process.env.NODE_ENV === 'production') {
    BACKEND_API_HOST = 'https://platform-muddy-meadow-938.fly.dev';
}
else {
    BACKEND_API_HOST = 'https://platform-muddy-meadow-938.fly.dev';
    // BACKEND_API_HOST = 'http://localhost:4444';
}
export const generateChatbot = async (params) => {
    try {
        console.log('calling generate endpoint');
        const requestBody = {
            prompt: params.prompt,
            telegramBotToken: params.runMode === 'telegram' ? params.telegramBotToken : undefined,
            userId: params.userId,
            useStaging: params.useStaging,
            runMode: params.runMode,
            botId: params.botId,
            clientSource: 'cli',
        };
        // If a source code file ID is provided, add it to the request
        if (params.sourceCodeFileId) {
            requestBody.sourceCodeFile = {
                id: params.sourceCodeFileId,
            };
        }
        const response = await fetch(`${BACKEND_API_HOST}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        if (response.ok) {
            const generateResult = (await response.json());
            return {
                success: true,
                chatbotId: generateResult.newBot.id,
                message: generateResult.message,
            };
        }
        else {
            console.error('generate1 error', response);
            const errorMessage = await response.text();
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    catch (error) {
        console.error('generate endpoint error', error);
        if (error instanceof DOMException && error.name === 'TimeoutError') {
            return {
                success: false,
                error: 'Request timed out after 10 minutes',
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
};
export const checkBotDeploymentStatus = async (chatbotId) => {
    try {
        const botStatus = await fetch(`${BACKEND_API_HOST}/chatbots/${chatbotId}`, {
            headers: {
                Authorization: `Bearer ${process.env.BACKEND_API_SECRET}`,
            },
        });
        const botStatusJson = (await botStatus.json());
        return {
            isDeployed: !!botStatusJson.flyAppId,
            readUrl: botStatusJson.readUrl,
            flyAppId: botStatusJson.flyAppId,
        };
    }
    catch (error) {
        console.error('Error checking bot deployment status:', error);
        return {
            isDeployed: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
};
/*
export const updateBotDeploymentStatus = async (
  threadTs: string,
  deployed: boolean
) => {
  try {
    await db
      .update(threads)
      .set({
        deployed,
      })
      .where(eq(threads.threadTs, threadTs));

    return true;
  } catch (error) {
    console.error('Error updating bot deployment status:', error);
    return false;
  }
};
*/
//# sourceMappingURL=deploy-chatbot.js.map