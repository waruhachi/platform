import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { ChatBotFlow } from './chatbot/create-chatbot.js';
// refresh the app every 100ms
const useKeepAlive = () => useEffect(() => {
    setInterval(() => { }, 100);
}, []);
export const App = () => {
    useKeepAlive();
    return _jsx(ChatBotFlow, {});
};
//# sourceMappingURL=app.js.map