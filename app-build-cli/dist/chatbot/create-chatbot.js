import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text } from 'ink';
import {} from './chatbot.js';
import { EnvironmentStep } from './steps/EnvironmentStep.js';
import { GenerateSpecsStep } from './steps/GenerateSpecsStep.js';
import { GenerateStep } from './steps/GenerateStep.js';
import { RunModeStep } from './steps/RunModeStep.js';
import { SuccessStep } from './steps/SuccessStep.js';
import { TokenStep } from './steps/TokenStep.js';
const steps = {
    runMode: {
        label: 'Application Type',
        question: 'Select the application type:',
        options: [
            { label: 'Telegram Bot', value: 'telegram' },
            { label: 'HTTP Server', value: 'http-server' },
        ],
        nextStep: (config) => config.runMode === 'telegram'
            ? 'token'
            : 'environment',
    },
    token: {
        label: 'Bot Configuration',
        question: 'Enter your Telegram Bot Token:',
        placeholder: 'e.g., 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
        nextStep: 'environment',
    },
    environment: {
        label: 'Environment Selection',
        question: 'Choose where your chatbot will run:',
        options: [
            {
                label: '🚀 Production - For live deployment',
                value: 'production',
            },
            { label: '🔧 Staging - For testing', value: 'staging' },
        ],
        nextStep: 'generateChatbotSpecs',
    },
    generateChatbotSpecs: {
        label: 'Generating Chatbot specs',
        question: 'Generating the specs for your chatbot...',
        nextStep: 'generateChatbot',
    },
    generateChatbot: {
        label: 'Generating Chatbot',
        question: 'Generating your chatbot...',
        nextStep: 'successGeneration',
    },
    successGeneration: {
        label: 'Success',
        question: 'Chatbot created successfully!',
        nextStep: 'success',
    },
};
export const ChatBotFlow = () => {
    const [step, setStep] = useState('runMode');
    const [config, setConfig] = useState({
        telegramBotToken: '',
        useStaging: false,
        runMode: 'telegram',
        prompt: '',
    });
    const [chatbot, setChatbot] = useState(null);
    const stepContent = () => {
        switch (step) {
            case 'token':
                return (_jsx(TokenStep, { config: config, setConfig: setConfig, setStep: setStep, steps: steps, step: step }));
            case 'environment':
                return (_jsx(EnvironmentStep, { config: config, setConfig: setConfig, setStep: setStep, steps: steps, step: step }));
            case 'runMode':
                return (_jsx(RunModeStep, { config: config, setConfig: setConfig, setStep: setStep, steps: steps, step: step }));
            case 'generateChatbotSpecs':
                return (_jsx(GenerateSpecsStep, { config: config, chatbot: chatbot, onSuccess: (result, prompt) => {
                        console.log('result', result);
                        setChatbot(result);
                        setConfig((prev) => ({ ...prev, prompt }));
                        setStep(steps[step].nextStep);
                    } }));
            case 'generateChatbot':
                return (_jsx(GenerateStep, { config: config, chatbot: chatbot, onSuccess: (result, prompt) => {
                        console.log('result', result);
                        setChatbot(result);
                        setConfig((prev) => ({ ...prev, prompt }));
                        setStep(steps[step].nextStep);
                    } }));
            case 'successGeneration':
                if (chatbot?.success) {
                    return _jsx(SuccessStep, { chatbot: chatbot, config: config });
                }
                return null;
            default:
                return null;
        }
    };
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "blue", bold: true, children: steps[step].label }) }), stepContent()] }));
};
//# sourceMappingURL=create-chatbot.js.map