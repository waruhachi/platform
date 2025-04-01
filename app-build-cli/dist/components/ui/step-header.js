import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { ProgressBar } from './progress-bar.js';
export const StepHeader = ({ label, progress }) => {
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Box, { children: _jsx(Text, { color: "blue", bold: true, children: label }) }), _jsx(Box, { marginY: 1, children: _jsx(ProgressBar, { progress: progress }) })] }));
};
//# sourceMappingURL=step-header.js.map