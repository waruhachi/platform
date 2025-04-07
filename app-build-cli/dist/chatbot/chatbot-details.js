import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useChatbot, useGenerateChatbot } from './use-chatbot.js';
import { useRouteParams } from '../routes.js';
import { getStatusEmoji, getStatusColor } from './chatbots-list-screen.js';
import { InfiniteFreeText } from '../components/shared/free-text.js';
import { Panel } from '../components/shared/panel.js';
export function ChatbotDetails() {
    const { chatbotId } = useRouteParams('/chatbots/:chatbotId');
    const { data: chatbot, isLoading, error } = useChatbot(chatbotId);
    const { mutate: generateChatbotIteration, status: generateChatbotIterationStatus, error: generateChatbotIterationError, } = useGenerateChatbot();
    if (isLoading) {
        return _jsx(Text, { children: "Loading..." });
    }
    if (error) {
        return _jsxs(Text, { color: "red", children: ["Error: ", error.message] });
    }
    if (!chatbot) {
        return _jsx(Text, { children: "Bot not found" });
    }
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Panel, { title: "\uD83D\uDCCB Bot Details", variant: "info", children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Name: " }), _jsx(Text, { bold: true, children: chatbot.name })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Status: " }), getStatusEmoji(chatbot.deployStatus), ' ', _jsx(Text, { color: getStatusColor(chatbot.deployStatus), bold: true, children: chatbot.deployStatus })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Mode: " }), _jsx(Text, { bold: true, children: "\uD83C\uDF10 HTTP Server" })] }), chatbot.recompileInProgress && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "yellow", children: "\u26A1\uFE0F Bot is recompiling..." }) }))] }) }), _jsx(Box, { marginTop: 2, children: _jsx(InfiniteFreeText, { successMessage: "Changes applied successfully", question: "How would you like to modify your chatbot?", placeholder: "e.g., Add a new feature, modify behavior, or type 'exit' to finish", onSubmit: (text) => generateChatbotIteration({
                        prompt: text,
                        ...chatbot,
                        useStaging: false,
                    }), status: generateChatbotIterationStatus, errorMessage: generateChatbotIterationError?.message, loadingText: "Applying changes...", retryMessage: "Please retry." }) })] }));
}
//# sourceMappingURL=chatbot-details.js.map