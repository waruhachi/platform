import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const TaskStatus = ({ title, status, details, duration }) => {
    const statusSymbol = {
        running: '⏺',
        done: '✓',
        error: '✗',
    }[status];
    const statusColor = {
        running: 'yellow',
        done: 'green',
        error: 'red',
    }[status];
    return (_jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsx(Box, { children: _jsxs(Text, { color: statusColor, children: [statusSymbol, " ", title, duration && _jsxs(Text, { color: "gray", children: [" \u00B7 ", duration] })] }) }), details && details.length > 0 && (_jsx(Box, { marginLeft: 2, flexDirection: "column", children: details.map((detail, index) => (_jsx(Box, { children: detail.highlight ? (_jsxs(Text, { children: [_jsx(Text, { color: "yellow", children: detail.icon || '⎿' }), _jsxs(Text, { color: "white", bold: true, children: [' ', detail.text] })] })) : (_jsxs(Text, { color: "gray", children: [detail.icon || '⎿', " ", detail.text] })) }, index))) }))] }));
};
//# sourceMappingURL=task-status.js.map