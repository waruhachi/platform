import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useApplication } from './use-application.js';
import { useRouteParams } from '../routes.js';
import { getStatusEmoji, getStatusColor } from './apps-list-screen.js';
import { Panel } from '../components/shared/panel.js';
import { AppBuildTextArea } from './app-build-screen.js';
export function AppDetails() {
    const { appId } = useRouteParams('/apps/:appId');
    const { data: app, isLoading: isLoadingApp, error: errorApp, } = useApplication(appId);
    if (isLoadingApp) {
        return _jsx(Text, { children: "Loading..." });
    }
    if (errorApp) {
        return _jsxs(Text, { color: "red", children: ["Error: ", errorApp.message] });
    }
    if (!app) {
        return _jsx(Text, { children: "Application not found" });
    }
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Panel, { title: "\uD83D\uDCCB Application Details", variant: "info", children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "ID: " }), _jsx(Text, { bold: true, children: app.id })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Name: " }), _jsx(Text, { bold: true, children: app.name })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Status: " }), getStatusEmoji(app.deployStatus), ' ', _jsx(Text, { color: getStatusColor(app.deployStatus), bold: true, children: app.deployStatus })] }), _jsxs(Text, { children: [_jsx(Text, { color: "gray", children: "Mode: " }), _jsx(Text, { bold: true, children: "\uD83C\uDF10 HTTP Server" })] }), app.recompileInProgress && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "yellow", children: "\u26A1\uFE0F Application is recompiling..." }) }))] }) }), _jsx(Box, { marginTop: 2, children: _jsx(AppBuildTextArea, { initialPrompt: "How would you like to modify your application?" }) })] }));
}
//# sourceMappingURL=app-details.js.map