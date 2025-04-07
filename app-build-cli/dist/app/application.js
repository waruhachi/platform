import { config } from 'dotenv';
import fetch from 'node-fetch';
import os from 'os';
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
//# sourceMappingURL=application.js.map