import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useListChatBots } from './use-chatbot.js';
import { useRouteParams } from '../routes.js';
import { getStatusEmoji, getStatusColor } from './chatbots-list-screen.js';
import { generateChatbot } from './chatbot.js';
import { useCreateChatbotWizardStore } from './store.js';
import { FreeText } from '../components/shared/free-text.js';
import { Panel } from '../components/shared/panel.js';
export function ChatbotDetails() {
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
    };
    const selectedBot = chatbots?.data.find((bot) => bot.id === chatbotId);
    if (isLoading) {
        return _jsx(Text, { children: "Loading..." });
    }
    if (error) {
        return _jsxs(Text, { color: "red", children: ["Error: ", error.message] });
    }
    if (!selectedBot) {
        return _jsx(Text, { children: "Bot not found" });
    }
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Panel, { title: "\uD83D\uDCCB Bot Details", variant: "info", children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Name: " }), _jsx(Text, { bold: true, children: selectedBot.name })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Status: " }), getStatusEmoji(selectedBot.deployStatus), ' ', _jsx(Text, { color: getStatusColor(selectedBot.deployStatus), bold: true, children: selectedBot.deployStatus })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Mode: " }), _jsx(Text, { bold: true, children: selectedBot.runMode === 'telegram'
                                        ? '📱 Telegram'
                                        : '🌐 HTTP Server' })] }), selectedBot.recompileInProgress && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "yellow", children: "\u26A1\uFE0F Bot is recompiling..." }) }))] }) }), _jsx(Box, { marginTop: 2, children: _jsx(FreeText, { question: "How would you like to modify your chatbot?", placeholder: "e.g., Add a new feature, modify behavior, or type 'exit' to finish", onSubmit: (text) => void handleIterationSubmit(text) }) })] }));
}
//# sourceMappingURL=chatbot-details.js.map