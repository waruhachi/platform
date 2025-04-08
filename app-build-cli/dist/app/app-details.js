import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useApplication, useGenerateApp } from './use-application.js';
import { useRouteParams } from '../routes.js';
import { getStatusEmoji, getStatusColor } from './apps-list-screen.js';
import { InfiniteFreeText } from '../components/shared/free-text.js';
import { Panel } from '../components/shared/panel.js';
export function AppDetails() {
    const { appId } = useRouteParams('/apps/:appId');
    const { data: app, isLoading: isLoadingApp, error: errorApp, } = useApplication(appId);
    const { mutate: generateAppIteration, status: generateAppIterationStatus, error: generateAppIterationError, } = useGenerateApp();
    if (isLoadingApp) {
        return _jsx(Text, { children: "Loading..." });
    }
    if (errorApp) {
        return _jsxs(Text, { color: "red", children: ["Error: ", errorApp.message] });
    }
    if (!app) {
        return _jsx(Text, { children: "Application not found" });
    }
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Panel, { title: "\uD83D\uDCCB Application Details", variant: "info", children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "ID: " }), _jsx(Text, { bold: true, children: app.id })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Name: " }), _jsx(Text, { bold: true, children: app.name })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Status: " }), getStatusEmoji(app.deployStatus), ' ', _jsx(Text, { color: getStatusColor(app.deployStatus), bold: true, children: app.deployStatus })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Mode: " }), _jsx(Text, { bold: true, children: "\uD83C\uDF10 HTTP Server" })] }), app.recompileInProgress && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "yellow", children: "\u26A1\uFE0F Application is recompiling..." }) }))] }) }), _jsx(Box, { marginTop: 2, children: _jsx(InfiniteFreeText, { successMessage: "Changes applied successfully", question: "How would you like to modify your application?", placeholder: "e.g., Add a new feature, modify behavior, or type 'exit' to finish", onSubmit: (text) => generateAppIteration({
                        prompt: text,
                        appId: app.id,
                        useStaging: false,
                    }), status: generateAppIterationStatus, errorMessage: generateAppIterationError?.message, loadingText: "Applying changes...", retryMessage: "Please retry." }) })] }));
}
//# sourceMappingURL=app-details.js.map