import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const Banner = () => {
    return (_jsx(Box, { flexDirection: "column", marginBottom: 1, children: _jsx(Box, { marginTop: 1, paddingX: 1, borderStyle: "round", borderColor: "yellow", children: _jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsxs(Box, { children: [_jsx(Text, { color: "yellow", children: "* " }), _jsx(Text, { bold: true, children: "Welcome to AppDotBuild CLI" })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Create, deploy, and manage your chatbots with ease" }) })] }) }) }));
};
//# sourceMappingURL=Banner.js.map