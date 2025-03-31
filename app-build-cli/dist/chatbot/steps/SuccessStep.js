import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from 'ink';
import { StepHeader } from '../../components/ui/StepHeader.js';
import { SuccessMessage } from '../../components/ui/SuccessMessage.js';
import { useChatbot } from '../useChatbot.js';
export const SuccessStep = ({ chatbotId }) => {
    const { data: chatbot } = useChatbot(chatbotId);
    if (!chatbot) {
        return null;
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(StepHeader, { label: "Success!", progress: 1 }), _jsx(SuccessMessage, { title: "Chatbot Created Successfully!", message: `Your chatbot has been created and is ready to use. You can access it at: ${chatbot.readUrl}`, details: [
                    { label: 'Bot ID', value: chatbotId },
                    {
                        label: 'Status',
                        value: 'Your chatbot is now ready to handle user interactions.',
                        color: 'green',
                    },
                    {
                        label: 'Next Steps',
                        value: 'You can customize and extend its functionality through the web interface.',
                    },
                ] })] }));
};
//# sourceMappingURL=SuccessStep.js.map