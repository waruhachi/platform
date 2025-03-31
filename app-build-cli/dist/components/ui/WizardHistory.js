import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useCreateChatbotWizardStore } from '../../chatbot/store.js';
export const WizardHistory = () => {
    const { history } = useCreateChatbotWizardStore();
    if (history.length === 0)
        return null;
    return (_jsx(Box, { flexDirection: "column", marginBottom: 1, children: history.map((entry, index) => (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsxs(Box, { children: [_jsxs(Text, { color: "cyan", dimColor: true, children: ["\u276F", ' '] }), _jsx(Text, { dimColor: true, children: entry.question })] }), _jsxs(Box, { marginLeft: 2, children: [_jsx(Text, { color: "green", children: "\u2713 " }), _jsx(Text, { bold: true, children: entry.answer })] })] }, index))) }));
};
//# sourceMappingURL=WizardHistory.js.map