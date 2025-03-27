import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { FreeText } from '../components/shared/FreeText.js';
import { generateChatbot } from './chatbot.js';
import { useCheckChatbotStatus } from './useChatbot.js';
export const GenerateSpecsStep = ({ config, onSuccess }) => {
    const [formState, setFormState] = useState({
        status: 'idle',
        data: null,
        error: null,
    });
    const handleSubmit = async (prompt) => {
        setFormState({ status: 'loading', data: null, error: null });
        try {
            const result = await generateChatbot({
                ...config,
                prompt,
            });
            if (result.success) {
                onSuccess(result, prompt);
            }
            else {
                setFormState({
                    status: 'error',
                    data: null,
                    error: result.error || 'Unknown error occurred',
                });
            }
        }
        catch (err) {
            setFormState({
                status: 'error',
                data: null,
                error: err instanceof Error ? err.message : 'Failed to generate chatbot',
            });
        }
    };
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "blue", bold: true, children: "\uD83E\uDD16 Let's Create Your Chatbot!" }) }), _jsx(FreeText, { question: "What kind of chatbot would you like to create?", placeholder: "e.g., I want a note taking chatbot...", onSubmit: handleSubmit }), formState.status === 'loading' && (_jsxs(Box, { marginTop: 1, children: [_jsx(Spinner, {}), _jsx(Text, { color: "yellow", children: " Generating your chatbot specifications..." })] })), formState.status === 'error' && (_jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Text, { color: "red", children: ["\u2717 Error: ", formState.error] }), _jsx(Text, { italic: true, children: "Please try again with a different prompt." })] }))] }));
};
export const GenerateStep = ({ onSuccess, chatbot, config, }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formState, setFormState] = useState({
        status: 'idle',
        data: null,
        error: null,
    });
    const { isDeployed, readUrl, error } = useCheckChatbotStatus(
    // @ts-expect-error
    chatbot?.chatbotId);
    const isWaitingForSpecsApproval = formState.status !== 'success' && !isDeployed;
    const steps = [
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
    useEffect(() => {
        let stepInterval;
        let isActive = true;
        const updateStep = () => {
            if (!isActive)
                return;
            setCurrentStep((prev) => (prev + 1) % steps.length);
        };
        // Handle successful deployment
        if (isDeployed && chatbot?.success) {
            onSuccess(chatbot, config.prompt);
            return;
        }
        // Don't start interval if already deployed or if chatbot failed
        if (isDeployed || !chatbot?.success) {
            return;
        }
        // Progress through steps every 5 seconds
        stepInterval = setInterval(updateStep, 5000);
        // Cleanup function
        return () => {
            isActive = false;
            if (stepInterval) {
                clearInterval(stepInterval);
            }
        };
    }, [chatbot?.success, isDeployed, config.prompt]);
    const handleSubmit = async (prompt) => {
        if (!chatbot?.success) {
            setFormState({
                status: 'error',
                data: null,
                error: 'Failed to get chatbot ID',
            });
            return;
        }
        setFormState({ status: 'loading', data: null, error: null });
        try {
            const result = await generateChatbot({
                ...config,
                prompt,
                botId: chatbot.chatbotId,
            });
            if (result.success) {
                setFormState({ status: 'success', data: result, error: null });
            }
            else {
                setFormState({
                    status: 'error',
                    data: null,
                    error: result.error || 'Unknown error occurred',
                });
            }
        }
        catch (err) {
            setFormState({
                status: 'error',
                data: null,
                error: err instanceof Error ? err.message : 'Failed to generate chatbot',
            });
        }
    };
    if (!chatbot?.success) {
        return (_jsx(Box, { flexDirection: "column", children: _jsxs(Text, { color: "red", children: ["\u2717 Error: ", chatbot?.error] }) }));
    }
    if (isWaitingForSpecsApproval) {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "blue", padding: 1, marginBottom: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "blue", bold: true, children: "Generated Chatbot Specification" }) }), _jsx(Text, { children: chatbot.message })] }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { children: "Would you like to proceed with deploying this chatbot with these specifications?" }) }), _jsxs(Box, { marginTop: 1, gap: 1, children: [formState.status === 'loading' && _jsx(Spinner, {}), _jsx(FreeText, { question: "Type 'yes' to deploy or provide feedback to modify the specifications:", placeholder: "e.g., yes or I want to add more features...", onSubmit: handleSubmit })] }), formState.status === 'error' && (_jsx(Box, { marginTop: 1, flexDirection: "column", children: _jsxs(Text, { color: "red", children: ["\u2717 Error: ", formState.error] }) }))] }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "blue", padding: 1, marginBottom: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "blue", bold: true, children: "\uD83E\uDD16 Building Your Chatbot" }) }), _jsxs(Text, { children: ["\uD83D\uDD11 Bot ID: ", _jsx(Text, { color: "yellow", children: chatbot.chatbotId })] })] }), _jsx(Box, { flexDirection: "column", marginY: 1, children: steps.map((step, index) => (_jsx(Box, { marginY: 1, children: index === currentStep && !isDeployed ? (_jsxs(_Fragment, { children: [_jsx(Text, { color: "yellow", children: "\u27D0 " }), _jsx(Text, { color: "yellow", bold: true, children: step.message })] })) : index < currentStep || isDeployed ? (_jsxs(_Fragment, { children: [_jsx(Text, { color: "green", children: "\u2713 " }), _jsx(Text, { dimColor: true, children: step.message })] })) : (_jsxs(_Fragment, { children: [_jsx(Text, { color: "gray", children: "\u25CB " }), _jsx(Text, { dimColor: true, children: step.message })] })) }, index))) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: isDeployed
                        ? '🎉 Deployment completed successfully!'
                        : steps[currentStep]?.detail || 'Preparing your chatbot...' }) }), readUrl && (_jsx(Box, { marginTop: 1, flexDirection: "column", children: _jsxs(Text, { color: "green", children: ["\uD83C\uDF10 Your bot is available at: ", _jsx(Text, { bold: true, children: readUrl })] }) })), _jsx(Box, { marginTop: 2, flexDirection: "column", children: error ? (_jsxs(Text, { color: "red", children: ["\u274C Error: ", error] })) : (!isDeployed && (_jsx(Text, { dimColor: true, italic: true, children: "\uD83D\uDD04 Please wait while we set up your chatbot..." }))) })] }));
};
//# sourceMappingURL=generate-step.js.map