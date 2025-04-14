import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text, useInput } from 'ink';
import { create } from 'zustand';
const useDebugStore = create((set) => ({
    logs: [],
    isVisible: true,
    addLog: (data) => set((state) => ({
        logs: [
            ...state.logs,
            {
                timestamp: new Date().toISOString(),
                data,
            },
        ],
    })),
    clearLogs: () => set({ logs: [] }),
    toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
}));
// Debug panel component
export const DebugPanel = () => {
    const logs = useDebugStore((state) => state.logs);
    const isVisible = useDebugStore((state) => state.isVisible);
    const toggleVisibility = useDebugStore((state) => state.toggleVisibility);
    // Toggle visibility with a hotkey (Ctrl+D)
    useInput((input, key) => {
        if (key.ctrl && input === 'd') {
            toggleVisibility();
        }
    });
    if (!isVisible)
        return null;
    return (_jsxs(Box, { borderStyle: "single", borderColor: "yellow", padding: 1, flexDirection: "column", children: [_jsx(Text, { bold: true, color: "yellow", children: "DEBUG PANEL (Ctrl+D to toggle)" }), logs.map((log, i) => (_jsxs(Text, { color: "gray", children: [log.timestamp, ": ", JSON.stringify(log.data)] }, i)))] }));
};
export const useDebug = () => {
    const addLog = useDebugStore((state) => state.addLog);
    const clearLogs = useDebugStore((state) => state.clearLogs);
    return { addLog, clearLogs };
};
//# sourceMappingURL=debugger-panel.js.map