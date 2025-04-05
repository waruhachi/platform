import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
const variantColors = {
    info: {
        borderColor: '#1d4ed8',
    },
    default: {
        borderColor: '#3a3a3a',
    },
    error: {
        borderColor: '#b91c1c',
    },
    success: {
        borderColor: '#16a34a',
    },
};
export function Panel({ children, title, variant = 'default', boxProps, }) {
    const { borderColor } = variantColors[variant];
    return (_jsxs(Box, { borderStyle: "round", borderColor: borderColor, flexDirection: "column", padding: 1, ...boxProps, children: [title && (_jsx(Box, { marginBottom: 2, children: _jsx(Text, { bold: true, children: title }) })), children] }));
}
//# sourceMappingURL=panel.js.map