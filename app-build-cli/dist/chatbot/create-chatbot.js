import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text } from 'ink';
import { FreeText } from '../components/shared/FreeText.js';
import { Select } from '../components/shared/Select.js';
import {} from './deploy-chatbot.js';
import { GenerateStep } from './generate-step.js';
const steps = {
    token: {
        number: 1,
        label: 'Bot Configuration',
        question: 'Enter your Telegram Bot Token:',
        placeholder: 'e.g., 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
        nextStep: 'environment',
    },
    environment: {
        number: 2,
        label: 'Environment Selection',
        question: 'Choose where your chatbot will run:',
        options: [
            { label: '🚀 Production - For live deployment', value: 'true' },
            { label: '🔧 Staging - For testing', value: 'false' },
        ],
        nextStep: 'runMode',
    },
    runMode: {
        number: 3,
        label: 'Run Mode Selection',
        question: 'Select the run mode:',
        options: [
            { label: 'Telegram Bot', value: 'telegram' },
            { label: 'HTTP Server', value: 'http-server' },
        ],
        nextStep: 'generate',
    },
    generate: {
        number: 4,
        label: 'Generation',
        question: 'Generating your chatbot...',
        nextStep: 'successGeneration',
    },
    successGeneration: {
        number: 5,
        label: 'Success',
        question: 'Chatbot created successfully!',
        nextStep: 'success',
    },
};
export const ChatBotFlow = () => {
    const [step, setStep] = useState('token');
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
                return (_jsx(FreeText, { question: steps.token.question, placeholder: steps.token.placeholder, onSubmit: (telegramBotToken) => {
                        setConfig((prev) => ({ ...prev, telegramBotToken }));
                        setStep(steps.token.nextStep);
                    } }));
            case 'environment':
                return (_jsx(Select, { question: steps.environment.question, options: steps.environment.options, onSubmit: (useStaging) => {
                        setConfig((prev) => ({
                            ...prev,
                            useStaging: useStaging === 'true',
                        }));
                        setStep(steps.environment.nextStep);
                    } }));
            case 'runMode':
                return (_jsx(Select, { question: steps.runMode.question, options: steps.runMode.options, onSubmit: (runMode) => {
                        setConfig((prev) => ({
                            ...prev,
                            runMode: runMode,
                        }));
                        setStep(steps.runMode.nextStep);
                    } }));
            case 'generate':
                return (_jsx(GenerateStep, { config: config, onSuccess: (result, prompt) => {
                        setChatbot(result);
                        setConfig((prev) => ({ ...prev, prompt }));
                        setStep(steps.generate.nextStep);
                    } }));
            case 'successGeneration':
                // Success State
                if (chatbot?.success) {
                    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "green", padding: 1, marginBottom: 1, children: [_jsxs(Box, { children: [_jsxs(Text, { backgroundColor: "green", color: "black", bold: true, children: [' ', "SUCCESS", ' '] }), _jsxs(Text, { color: "green", bold: true, children: [' ', "Chatbot created successfully!"] })] }), _jsxs(Box, { marginLeft: 2, marginTop: 1, children: [_jsx(Text, { dimColor: true, children: "Chatbot ID: " }), _jsx(Text, { bold: true, children: chatbot.chatbotId })] }), chatbot.message && (_jsxs(Box, { marginLeft: 2, children: [_jsx(Text, { dimColor: true, children: "Message: " }), _jsx(Text, { children: chatbot.message })] }))] }), _jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "blue", padding: 1, children: [_jsx(Text, { bold: true, underline: true, children: "Configuration Summary" }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { dimColor: true, children: "Bot Token: " }), _jsx(Text, { color: "green", children: config.telegramBotToken })] }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { dimColor: true, children: "Environment: " }), _jsx(Text, { color: "green", children: config.useStaging ? 'Staging' : 'Production' })] }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { dimColor: true, children: "Run Mode: " }), _jsx(Text, { color: "green", children: config.runMode })] }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { dimColor: true, children: "Prompt: " }), _jsx(Text, { color: "green", children: config.prompt })] })] }), _jsxs(Box, { marginTop: 2, flexDirection: "column", children: [_jsx(Text, { bold: true, children: "Next Steps:" }), _jsxs(Text, { children: ["1. Save your Chatbot ID:", ' ', _jsx(Text, { color: "yellow", bold: true, children: chatbot.chatbotId })] }), _jsxs(Text, { children: ["2.", ' ', config.runMode === 'telegram'
                                                ? 'Open Telegram and start chatting with your bot!'
                                                : 'Your HTTP server is ready to accept requests.'] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Press Ctrl+C to exit" }) })] })] }));
                }
                // This should never happen as we stay in step 3 on error
                return null;
            default:
                return null;
        }
    };
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsxs(Text, { color: "blue", bold: true, children: ["Step ", steps[step].number, " of ", steps.successGeneration.number, ":", ' ', steps[step].label] }) }), stepContent()] }));
};
//# sourceMappingURL=create-chatbot.js.map