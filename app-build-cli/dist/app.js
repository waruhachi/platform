import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { ChatBotFlow } from './chatbot/create-chatbot.js';
import { ChatbotList } from './components/ChatbotList.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
// refresh the app every 100ms
const useKeepAlive = () => useEffect(() => {
    setInterval(() => { }, 100);
}, []);
export const App = () => {
    useKeepAlive();
    const [mode, setMode] = useState('create');
    const items = [
        { label: 'Create new chatbot', value: 'create' },
        { label: 'List and iterate existing chatbots', value: 'list' },
    ];
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsx(Text, { children: "Choose an action:" }), _jsx(SelectInput, { items: items, onSelect: (item) => setMode(item.value) }), mode === 'create' ? _jsx(ChatBotFlow, {}) : _jsx(ChatbotList, {})] }) }));
};
//# sourceMappingURL=app.js.map