import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InfiniteFreeText } from './components/shared/free-text.js';
import { Box, Text } from 'ink';
import { useBuildApp } from './app/message/use-message.js';
import { BuildingBlock } from './components/shared/building-block.js';
const queryClient = new QueryClient();
// refresh the app every 100ms
const useKeepAlive = () => useEffect(() => {
    setInterval(() => { }, 100);
}, []);
export const App = () => {
    useKeepAlive();
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(MockedAgentAppScreen, {}) }));
};
function MockedAgentAppScreen() {
    const { startBuilding, error, status, data } = useBuildApp();
    return (_jsxs(Box, { children: [_jsx(InfiniteFreeText, { successMessage: "Changes applied successfully", question: "How would you like to modify your application?", placeholder: "e.g., Add a new feature, modify behavior, or type 'exit' to finish", onSubmit: (text) => startBuilding(text), status: status, errorMessage: error?.message, loadingText: "Applying changes...", retryMessage: "Please retry." }), _jsx(BuildingBlock, { type: "free-text", onSubmit: () => { } })] }));
}
//# sourceMappingURL=app.js.map