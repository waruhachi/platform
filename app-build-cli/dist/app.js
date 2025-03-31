import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Box, Text } from 'ink';
import { ChatBotFlow } from './chatbot/create-chatbot.js';
import { ChatbotList } from './components/ChatbotList.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Select } from './components/shared/Select.js';
import { ShortcutHints } from './components/ui/ShortcutHints.js';
import { useNavigation } from './chatbot/store.js';
const queryClient = new QueryClient();
// refresh the app every 100ms
const useKeepAlive = () => useEffect(() => {
    setInterval(() => { }, 100);
}, []);
export const App = () => {
    useKeepAlive();
    const { currentNavigationState, navigate } = useNavigation();
    const items = [
        { label: '🆕 Create new chatbot', value: 'chatbot.create' },
        {
            label: '📋 List and iterate existing chatbots',
            value: 'chatbot.list',
        },
    ];
    let content;
    if (currentNavigationState?.startsWith('chatbot.create')) {
        content = _jsx(ChatBotFlow, {});
    }
    else if (currentNavigationState?.startsWith('chatbot.list')) {
        content = _jsx(ChatbotList, {});
    }
    else {
        content = (_jsxs(_Fragment, { children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, children: "\uD83E\uDD16 Chatbot Manager" }) }), _jsx(Select, { question: "What would you like to do?", options: items, onSubmit: (value) => navigate(value) })] }));
    }
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(Box, { flexDirection: "column", padding: 1, children: [content, _jsx(ShortcutHints, {})] }) }));
};
//# sourceMappingURL=app.js.map