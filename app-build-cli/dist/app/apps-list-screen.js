import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { useListApps } from './use-application.js';
import { Select } from '../components/shared/select.js';
import { useSafeNavigate } from '../routes.js';
export const getStatusEmoji = (status) => {
    switch (status) {
        case 'deployed':
            return '🟢';
        case 'deploying':
            return '🟡';
        case 'failed':
            return '🔴';
        default:
            return '⚪️';
    }
};
export const getStatusColor = (status) => {
    switch (status) {
        case 'deployed':
            return 'green';
        case 'deploying':
            return 'yellow';
        case 'failed':
            return 'red';
        default:
            return 'gray';
    }
};
const formatAppLabel = (app) => {
    const status = app.recompileInProgress ? 'recompiling' : app.deployStatus;
    const statusEmoji = getStatusEmoji(status);
    return `${statusEmoji} ${app.name}`;
};
export const AppsListScreen = () => {
    const { safeNavigate } = useSafeNavigate();
    const { data: apps, isLoading, error } = useListApps();
    if (isLoading) {
        return (_jsx(Box, { justifyContent: "center", paddingY: 1, children: _jsx(Text, { children: "\u23F3 Loading applications..." }) }));
    }
    if (error) {
        return (_jsxs(Box, { flexDirection: "column", alignItems: "center", paddingY: 1, children: [_jsx(Text, { color: "red", children: "\u274C Error loading applications" }), _jsx(Text, { dimColor: true, children: error.message })] }));
    }
    if (!apps?.data.length) {
        return (_jsx(Box, { justifyContent: "center", paddingY: 1, children: _jsx(Text, { children: "\uD83D\uDCED No apps found" }) }));
    }
    const items = apps.data.map((app) => ({
        label: formatAppLabel(app),
        value: app.id,
    }));
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, children: "\uD83E\uDD16 Your Applications" }) }), _jsx(Select, { question: "Select an application to iterate on:", options: items, onSubmit: (item) => {
                    safeNavigate({
                        path: '/apps/:appId',
                        params: { appId: item },
                    });
                } })] }));
};
//# sourceMappingURL=apps-list-screen.js.map