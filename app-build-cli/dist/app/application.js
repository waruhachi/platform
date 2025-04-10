import { config } from 'dotenv';
import fetch from 'node-fetch';
import os from 'os';
import chalk from 'chalk';
import { EventSource } from 'eventsource';
import { error } from 'console';
// Load environment variables from .env file
config();
let BACKEND_API_HOST;
if (process.env.NODE_ENV === 'production') {
    BACKEND_API_HOST = 'https://platform-muddy-meadow-938.fly.dev';
}
else if (process.env.USE_MOCKED_AGENT === 'true') {
    BACKEND_API_HOST = 'http://127.0.0.1:4444';
}
else {
    BACKEND_API_HOST = 'https://platform-muddy-meadow-938.fly.dev';
}
const BACKEND_BEARER_TOKEN = 'bOvfvvt3km3aJGYm6wvc25zy5wFZpiT1';
function generateMachineId() {
    const hostname = os.hostname();
    const username = os.userInfo().username;
    const machineInfo = `${hostname}-${username}`;
    return machineInfo;
}
export const generateApp = async (params) => {
    try {
        const requestBody = {
            prompt: params.prompt,
            userId: generateMachineId(),
            useStaging: params.useStaging,
            appId: params.appId,
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
            const generateResult = (await response.json());
            return {
                appId: generateResult.newApp.id,
                message: generateResult.message,
                readUrl: '',
            };
        }
        else {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
    }
    catch (error) {
        console.error('generate endpoint error', error);
        let errorMessage = 'Unknown error occurred';
        if (error instanceof DOMException && error.name === 'TimeoutError') {
            errorMessage = 'Request timed out after 10 minutes';
        }
        else if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
};
export const generateAppSpec = async (params) => {
    return generateApp({ ...params, appId: undefined });
};
export const getApp = async (appId) => {
    try {
        const appStatus = await fetch(`${BACKEND_API_HOST}/apps/${appId}`, {
            headers: {
                // TODO: remove this
                Authorization: `Bearer ${BACKEND_BEARER_TOKEN}`,
            },
        });
        const appStatusJson = (await appStatus.json());
        return {
            isDeployed: appStatusJson.deployStatus === 'deployed',
            ...appStatusJson,
        };
    }
    catch (error) {
        console.error('Error checking app deployment status:', error);
        throw error;
    }
};
export const listApps = async () => {
    try {
        const response = await fetch(`${BACKEND_API_HOST}/apps`, {
            headers: {
                Authorization: `Bearer ${BACKEND_BEARER_TOKEN}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch applications: ${response.statusText}`);
        }
        const apps = (await response.json());
        return apps;
    }
    catch (error) {
        console.error('Error fetching applications:', error);
        throw error;
    }
};
export async function sendMessage(message) {
    const response = await fetch(`${BACKEND_API_HOST}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            clientSource: 'cli',
            userId: generateMachineId(),
        }),
    });
    if (!response.ok) {
        const errorData = (await response.json());
        throw new Error(errorData.error || 'Unknown error');
    }
    const result = (await response.json());
    console.log('sendMessage result', result);
    return result.applicationId;
}
export function subscribeToMessages(applicationId, { onNewMessage, }) {
    const es = new EventSource(`${BACKEND_API_HOST}/message?applicationId=${applicationId}`);
    let assistantResponse = '';
    es.addEventListener('open', () => {
        console.log(chalk.green('🔗 Connected to SSE stream.\n'));
    });
    es.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);
            onNewMessage(data);
            if (data.status === 'running') {
                console.log(chalk.yellow('⚙️ Processing...\n'));
                renderParts(data.parts);
                assistantResponse += extractText(data.parts);
                // ✅ Handle stream completion flag
                if (data.done) {
                    console.log(chalk.green('\n✅ Done signal received.\n'));
                    es.close();
                }
            }
            if (data.status === 'idle') {
                console.log(chalk.green('\n✅ Response complete:\n'));
                renderParts(data.parts);
                assistantResponse += extractText(data.parts);
                es.close();
            }
        }
        catch (error) {
            console.error(chalk.red(`❌ Failed to process SSE message: ${error}`));
        }
    });
    es.addEventListener('error', (event) => {
        console.log({ readyState: es.readyState });
        // Ignore harmless disconnects
        if (es.readyState === 2 /* CLOSED */) {
            console.log(chalk.gray('ℹ️ SSE connection closed cleanly.'));
            return;
        }
        console.error(chalk.red(`🔥 SSE Error occurred: ${JSON.stringify(error)}`));
        es.close();
    });
    return es;
}
// Helper to render message parts
function renderParts(parts) {
    parts.forEach((part) => {
        if (part.type === 'text') {
            console.log(part.content);
        }
        else if (part.type === 'interactive') {
            console.log(chalk.cyan('\n💡 Interactive Options:'));
            part.elements?.forEach((element) => {
                if (element.type === 'choice') {
                    console.log(chalk.cyan(`\n❓ ${element.questionId}`));
                    element.options?.forEach((opt, i) => console.log(`  ${i + 1}. ${opt.label} (${opt.value})`));
                }
                else if (element.type === 'action') {
                    console.log(`⚙️  Action: ${element.label} (${element.id})`);
                }
            });
        }
    });
}
// Helper to accumulate text for history
function extractText(parts) {
    return (parts
        .filter((p) => p.type === 'text')
        .map((p) => p.content)
        .join('\n') + '\n');
}
//# sourceMappingURL=application.js.map