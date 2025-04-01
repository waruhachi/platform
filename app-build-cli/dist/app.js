import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './routes.js';
import { ShortcutHints } from './components/ui/shortcut-hints.js';
const queryClient = new QueryClient();
// refresh the app every 100ms
const useKeepAlive = () => useEffect(() => {
    setInterval(() => { }, 100);
}, []);
export const App = () => {
    useKeepAlive();
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AppRouter, {}) }));
};
//# sourceMappingURL=app.js.map