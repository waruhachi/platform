import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';
import { generateChatbot } from './chatbot.js';
import { useCreateChatbotWizardStore } from './store.js';
import { useListChatBots } from './use-chatbot.js';
import { Select } from '../components/shared/select.js';
import { useRouteParams, useSafeNavigate } from '../routes.js';
const getStatusEmoji = (status) => {
    switch (status) {
        case 'deployed':
            return '🟢';
        case 'deploying':
            return '🟡';
        case 'failed':
            return '🔴';
        default:
            return '⚪️';
    }
};
const getStatusColor = (status) => {
    switch (status) {
        case 'deployed':
            return 'green';
        case 'deploying':
            return 'yellow';
        case 'failed':
            return 'red';
        default:
            return 'gray';
    }
};
const formatBotLabel = (bot) => {
    const status = bot.recompileInProgress ? 'recompiling' : bot.deployStatus;
    const statusEmoji = getStatusEmoji(status);
    const runModeEmoji = bot.runMode === 'telegram' ? '📱' : '🌐';
    return `${statusEmoji}  ${bot.name}  ${runModeEmoji}`;
};
export const ChatbotsListScreen = () => {
    const [iterationPrompt, setIterationPrompt] = useState('');
    const { safeNavigate } = useSafeNavigate();
    const { chatbotId } = useRouteParams('/chatbots/:chatbotId');
    const { data: chatbots, isLoading, error } = useListChatBots();
    const addMessageToChatbotHistory = useCreateChatbotWizardStore((state) => state.addMessageToChatbotHistory);
    const handleIterationSubmit = async (text) => {
        if (!chatbotId || !text)
            return;
        await generateChatbot({
            prompt: text,
            telegramBotToken: '',
            useStaging: false,
            runMode: 'telegram',
            botId: chatbotId,
        });
        addMessageToChatbotHistory('iteration', text);
        setIterationPrompt('');
    };
    if (isLoading) {
        return (_jsx(Box, { justifyContent: "center", paddingY: 1, children: _jsx(Text, { children: "\u23F3 Loading chatbots..." }) }));
    }
    if (error) {
        return (_jsxs(Box, { flexDirection: "column", alignItems: "center", paddingY: 1, children: [_jsx(Text, { color: "red", children: "\u274C Error loading chatbots" }), _jsx(Text, { dimColor: true, children: error.message })] }));
    }
    if (!chatbots?.data.length) {
        return (_jsx(Box, { justifyContent: "center", paddingY: 1, children: _jsx(Text, { children: "\uD83D\uDCED No chatbots found" }) }));
    }
    const items = chatbots.data.map((bot) => ({
        label: formatBotLabel(bot),
        value: bot.id,
    }));
    const selectedBot = chatbots.data.find((bot) => bot.id === chatbotId);
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, children: "\uD83E\uDD16 Your Chatbots" }) }), _jsx(Select, { question: "Select a chatbot to iterate on:", options: items, onSubmit: (item) => {
                    safeNavigate({
                        path: '/chatbots/:chatbotId',
                        params: { chatbotId: item },
                    });
                } }), selectedBot && (_jsxs(Box, { flexDirection: "column", marginTop: 1, padding: 1, children: [_jsxs(Box, { borderStyle: "single", paddingX: 1, flexDirection: "column", gap: 1, children: [_jsx(Box, { children: _jsx(Text, { bold: true, children: "\uD83D\uDCCB Bot Details" }) }), _jsxs(Box, { gap: 2, children: [_jsx(Box, { width: 12, children: _jsx(Text, { children: "Name:" }) }), _jsx(Text, { children: selectedBot.name })] }), _jsxs(Box, { gap: 2, children: [_jsx(Box, { width: 12, children: _jsx(Text, { children: "Status:" }) }), _jsx(Box, { children: _jsxs(Text, { children: [getStatusEmoji(selectedBot.deployStatus), ' ', _jsx(Text, { color: getStatusColor(selectedBot.deployStatus), children: selectedBot.deployStatus })] }) })] }), _jsxs(Box, { gap: 2, children: [_jsx(Box, { width: 12, children: _jsx(Text, { children: "Mode:" }) }), _jsx(Text, { children: selectedBot.runMode === 'telegram'
                                            ? '📱 Telegram'
                                            : '🌐 HTTP Server' })] }), selectedBot.recompileInProgress && (_jsx(Box, { children: _jsx(Text, { color: "yellow", children: "\u26A1\uFE0F Bot is recompiling..." }) }))] }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, children: "\u2728 Iteration Prompt" }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: iterationPrompt, onChange: setIterationPrompt, onSubmit: (text) => void handleIterationSubmit(text), placeholder: "Enter your prompt and press Enter" }) })] })] }))] }));
};
//# sourceMappingURL=chatbots-list-screen.js.map