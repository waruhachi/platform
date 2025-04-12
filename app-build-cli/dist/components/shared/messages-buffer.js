import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { Panel } from './panel.js';
import { useCallback, useState } from 'react';
export const MessagesBuffer = ({ onMessageComplete }) => {
    const [messages, setMessages] = useState([]);
    const addMessage = useCallback((content) => {
        const newMessage = {
            id: Math.random().toString(36).substring(7),
            content,
            status: 'pending',
        };
        setMessages((prev) => [...prev, newMessage]);
        return newMessage.id;
    }, []);
    const updateMessage = useCallback((id, updates) => {
        setMessages((prev) => {
            const newMessages = prev.map((msg) => {
                if (msg.id === id) {
                    const updatedMessage = { ...msg, ...updates };
                    if (updates.status === 'success' && onMessageComplete) {
                        onMessageComplete(updatedMessage);
                    }
                    return updatedMessage;
                }
                return msg;
            });
            return newMessages;
        });
    }, [onMessageComplete]);
    const removeMessage = useCallback((id) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, []);
    return (_jsx(Box, { flexDirection: "column", gap: 1, children: messages.map((message) => (_jsx(Panel, { variant: message.status === 'error'
                ? 'error'
                : message.status === 'success'
                    ? 'success'
                    : 'default', boxProps: { width: '100%' }, children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsx(Text, { children: message.content }), message.status === 'pending' && (_jsx(Text, { color: "yellow", children: "Processing..." })), message.status === 'streaming' && (_jsx(Text, { color: "blue", children: "Receiving response..." })), message.status === 'error' && message.error && (_jsxs(Text, { color: "redBright", children: ["Error: ", message.error] })), message.status === 'success' && (_jsx(Text, { color: "greenBright", children: "\u2713 Complete" }))] }) }, message.id))) }));
};
// Export utility hooks for managing messages
export const useMessagesBuffer = () => {
    const [messages, setMessages] = useState([]);
    const addMessage = useCallback((content) => {
        const newMessage = {
            id: Math.random().toString(36).substring(7),
            content,
            status: 'pending',
        };
        setMessages((prev) => [...prev, newMessage]);
        return newMessage.id;
    }, []);
    const updateMessage = useCallback((id, updates) => {
        setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)));
    }, []);
    const removeMessage = useCallback((id) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, []);
    return {
        messages,
        addMessage,
        updateMessage,
        removeMessage,
    };
};
//# sourceMappingURL=messages-buffer.js.map