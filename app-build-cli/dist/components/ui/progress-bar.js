import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const ProgressBar = ({ progress, width = 30 }) => {
    const filledWidth = Math.round(progress * width);
    const emptyWidth = width - filledWidth;
    return (_jsx(Box, { children: _jsxs(Text, { color: "blue", children: ['━'.repeat(filledWidth), _jsx(Text, { color: "gray", children: '━'.repeat(emptyWidth) })] }) }));
};
//# sourceMappingURL=progress-bar.js.map