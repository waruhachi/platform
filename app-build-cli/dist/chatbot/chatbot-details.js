import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useListChatBots } from './use-chatbot.js';
import { useRouteParams } from '../routes.js';
import { getStatusEmoji, getStatusColor } from './chatbots-list-screen.js';
import { TextInput } from '@inkjs/ui';
import { generateChatbot } from './chatbot.js';
import { useCreateChatbotWizardStore } from './store.js';
export function ChatbotDetails() {
    const { chatbotId } = useRouteParams('/chatbots/:chatbotId');
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
    };
    const { data: chatbots, isLoading, error } = useListChatBots();
    const selectedBot = chatbots?.data.find((bot) => bot.id === chatbotId);
    if (!selectedBot) {
        return _jsx(Text, { children: "Bot not found" });
    }
    if (isLoading) {
        return _jsx(Text, { children: "Loading..." });
    }
    if (error) {
        return _jsxs(Text, { children: ["Error: ", error.message] });
    }
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, padding: 1, children: [_jsxs(Box, { borderStyle: "single", paddingX: 1, flexDirection: "column", gap: 1, children: [_jsx(Box, { children: _jsx(Text, { bold: true, children: "\uD83D\uDCCB Bot Details" }) }), _jsxs(Box, { gap: 2, children: [_jsx(Box, { width: 12, children: _jsx(Text, { children: "Name:" }) }), _jsx(Text, { children: selectedBot.name })] }), _jsxs(Box, { gap: 2, children: [_jsx(Box, { width: 12, children: _jsx(Text, { children: "Status:" }) }), _jsx(Box, { children: _jsxs(Text, { children: [getStatusEmoji(selectedBot.deployStatus), ' ', _jsx(Text, { color: getStatusColor(selectedBot.deployStatus), children: selectedBot.deployStatus })] }) })] }), _jsxs(Box, { gap: 2, children: [_jsx(Box, { width: 12, children: _jsx(Text, { children: "Mode:" }) }), _jsx(Text, { children: selectedBot.runMode === 'telegram'
                                    ? '📱 Telegram'
                                    : '🌐 HTTP Server' })] }), selectedBot.recompileInProgress && (_jsx(Box, { children: _jsx(Text, { color: "yellow", children: "\u26A1\uFE0F Bot is recompiling..." }) }))] }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, children: "\u2728 Iteration Prompt" }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { onSubmit: (text) => void handleIterationSubmit(text), placeholder: "Enter your prompt and press Enter" }) })] })] }));
}
//# sourceMappingURL=chatbot-details.js.map