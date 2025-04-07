import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useApp, useGenerateApp } from './use-app.js';
import { useRouteParams } from '../routes.js';
import { getStatusEmoji, getStatusColor } from './chatbots-list-screen.js';
import { InfiniteFreeText } from '../components/shared/free-text.js';
import { Panel } from '../components/shared/panel.js';
export function ChatbotDetails() {
    const { appId } = useRouteParams('/apps/:appId');
    const { data: app, isLoading, error } = useApp(appId);
    const { mutate: generateAppIteration, status: generateAppIterationStatus, error: generateAppIterationError, } = useGenerateApp();
    if (isLoading) {
        return _jsx(Text, { children: "Loading..." });
    }
    if (error) {
        return _jsxs(Text, { color: "red", children: ["Error: ", error.message] });
    }
    if (!app) {
        return _jsx(Text, { children: "App not found" });
    }
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Panel, { title: "\uD83D\uDCCB App Details", variant: "info", children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Name: " }), _jsx(Text, { bold: true, children: app.name })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Status: " }), getStatusEmoji(app.deployStatus), ' ', _jsx(Text, { color: getStatusColor(app.deployStatus), bold: true, children: app.deployStatus })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Mode: " }), _jsx(Text, { bold: true, children: "\uD83C\uDF10 HTTP Server" })] }), app.recompileInProgress && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "yellow", children: "\u26A1\uFE0F App is recompiling..." }) }))] }) }), _jsx(Box, { marginTop: 2, children: _jsx(InfiniteFreeText, { successMessage: "Changes applied successfully", question: "How would you like to modify your application?", placeholder: "e.g., Add a new feature, modify behavior, or type 'exit' to finish", onSubmit: (text) => generateAppIteration({
                        prompt: text,
                        ...app,
                        useStaging: false,
                    }), status: generateAppIterationStatus, errorMessage: generateAppIterationError?.message, loadingText: "Applying changes...", retryMessage: "Please retry." }) })] }));
}
//# sourceMappingURL=chatbot-details.js.map