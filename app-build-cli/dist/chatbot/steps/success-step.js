import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from 'ink';
import { Text } from 'ink';
import { useChatbot } from '../use-chatbot.js';
import React from 'react';
import { useSafeNavigate } from '../../routes.js';
export const SuccessStep = ({ chatbotId }) => {
    const { data: chatbot } = useChatbot(chatbotId);
    const { safeNavigate } = useSafeNavigate();
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            safeNavigate({
                path: '/chatbots/:chatbotId',
                params: {
                    chatbotId,
                },
            });
        }, 1_000);
        return () => clearTimeout(timeout);
    }, [chatbotId, safeNavigate]);
    if (!chatbot) {
        return null;
    }
    return (_jsx(Box, { flexDirection: "column", children: _jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "green", padding: 1, marginBottom: 1, children: [_jsxs(Box, { children: [_jsx(Text, { color: "green", children: "\u2713 Your chatbot is ready at: " }), _jsx(Text, { color: "blue", bold: true, underline: true, children: chatbot.readUrl })] }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { dimColor: true, children: "Bot ID: " }), _jsx(Text, { bold: true, children: chatbotId })] })] }) }));
};
//# sourceMappingURL=success-step.js.map