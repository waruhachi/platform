import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { InfiniteFreeText } from '../../components/shared/free-text.js';
import { ProgressSteps } from '../../components/ui/progress-steps.js';
import {} from '../application.js';
import { useChatbot, useGenerateChatbot } from '../use-app.js';
import { useCreateChatbotWizardStore } from '../store.js';
import { useSafeSearchParams } from '../../routes.js';
const buildSteps = [
    {
        message: '🏗️  Generating business model and use cases...',
        detail: '🎯 Analyzing requirements and creating domain models',
    },
    {
        message: '🗄️  Designing database schema...',
        detail: '📊 Creating tables, relations, and indexes',
    },
    {
        message: '⚡ Generating TypeScript code...',
        detail: '🔧 Creating type-safe implementations of your bot logic',
    },
    {
        message: '🚀 Compiling TypeScript...',
        detail: '✨ Ensuring type safety and generating JavaScript',
    },
    {
        message: '🧪 Generating test suites...',
        detail: '🎯 Creating comprehensive tests for your bot',
    },
    {
        message: '🛠️  Implementing handlers...',
        detail: '🔌 Creating route handlers and middleware',
    },
    {
        message: '✨ Finalizing code quality...',
        detail: '🎨 Running linters and formatters',
    },
];
export const GenerateStep = ({ onSuccess }) => {
    const config = useCreateChatbotWizardStore((s) => s.config);
    const [{ chatbotId }] = useSafeSearchParams('/chatbot/create');
    const chatbotMessageHistory = useCreateChatbotWizardStore((s) => s.chatbotMessageHistory);
    const [currentStep, setCurrentStep] = useState(0);
    const { mutate: generateChatbot, error: generateChatbotError, data: generateChatbotData, status: generateChatbotStatus, } = useGenerateChatbot();
    const { data: chatbot } = useChatbot(chatbotId, {
        refetchInterval: 5_000,
    });
    const isWaitingForSpecsApproval = !chatbot?.isDeployed && !generateChatbotData;
    useEffect(() => {
        if (isWaitingForSpecsApproval || !chatbot || !chatbotId) {
            return;
        }
        // Handle successful deployment
        if (chatbot?.isDeployed && generateChatbotData) {
            onSuccess(generateChatbotData);
            return;
        }
        let isActive = true;
        const updateStep = () => {
            if (!isActive)
                return;
            setCurrentStep((prev) => (prev + 1) % buildSteps.length);
        };
        // Progress through steps every 5 seconds
        const stepInterval = setInterval(updateStep, 5000);
        // Cleanup function
        return () => {
            isActive = false;
            if (stepInterval) {
                clearInterval(stepInterval);
            }
        };
    }, [
        chatbot,
        chatbotId,
        generateChatbotData,
        isWaitingForSpecsApproval,
        onSuccess,
    ]);
    if (!chatbot)
        return _jsx(Text, { children: "Bot not found" });
    if (isWaitingForSpecsApproval) {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "blue", padding: 1, marginBottom: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "blue", bold: true, children: "Generated Chatbot Specification" }) }), _jsx(Text, { children: chatbotMessageHistory['specs'].at(-1) })] }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { children: "Would you like to proceed with deploying this chatbot with these specifications?" }) }), _jsx(Box, { marginTop: 1, gap: 1, children: _jsx(InfiniteFreeText, { successMessage: "Chatbot deployed successfully", status: generateChatbotStatus, errorMessage: generateChatbotError?.message, retryMessage: "Please retry.", loadingText: "Deploying your chatbot...", question: "Type 'yes' to deploy or provide feedback to modify the specifications:", placeholder: "e.g., yes or I want to add more features...", onSubmit: () => {
                            generateChatbot({ ...config, botId: chatbot.id });
                        } }) })] }));
    }
    if (!chatbot.isDeployed) {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { flexDirection: "column", borderStyle: "round", borderColor: "blue", padding: 1, marginBottom: 1, children: _jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { dimColor: true, children: "Bot ID: " }), _jsx(Text, { color: "yellow", bold: true, children: chatbot.id })] }) }), _jsx(ProgressSteps, { steps: buildSteps, currentStep: currentStep, isDeployed: chatbot.isDeployed }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: chatbot.isDeployed
                            ? '🎉 Deployment completed successfully!'
                            : buildSteps[currentStep]?.detail || 'Preparing your chatbot...' }) }), chatbot.readUrl && (_jsx(Box, { marginTop: 1, flexDirection: "column", borderStyle: "round", borderColor: "green", padding: 1, children: _jsxs(Text, { color: "green", children: ["\uD83C\uDF10 Your bot is available at:", ' ', _jsx(Text, { bold: true, underline: true, children: chatbot?.readUrl })] }) })), _jsx(Box, { marginTop: 2, children: _jsx(Text, { dimColor: true, italic: true, children: "\uD83D\uDD04 Please wait while we set up your chatbot..." }) })] }));
    }
    return null;
};
//# sourceMappingURL=generate-step.js.map