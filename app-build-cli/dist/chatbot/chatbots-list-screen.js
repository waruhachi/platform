import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useListChatBots } from './use-chatbot.js';
import { Select } from '../components/shared/select.js';
import { useSafeNavigate } from '../routes.js';
export const getStatusEmoji = (status) => {
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
export const getStatusColor = (status) => {
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
    const emoji = '🌐';
    return `${statusEmoji}  ${bot.name}  ${emoji}`;
};
export const ChatbotsListScreen = () => {
    const { safeNavigate } = useSafeNavigate();
    const { data: chatbots, isLoading, error } = useListChatBots();
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
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, children: "\uD83E\uDD16 Your Chatbots" }) }), _jsx(Select, { question: "Select a chatbot to iterate on:", options: items, onSubmit: (item) => {
                    safeNavigate({
                        path: '/chatbots/:chatbotId',
                        params: { chatbotId: item },
                    });
                } })] }));
};
//# sourceMappingURL=chatbots-list-screen.js.map