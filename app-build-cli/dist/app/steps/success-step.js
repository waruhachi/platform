import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from 'ink';
import { Text } from 'ink';
import { useApplication } from '../use-application.js';
import React from 'react';
import { useSafeNavigate } from '../../routes.js';
export const SuccessStep = ({ appId }) => {
    const { data: app } = useApplication(appId);
    const { safeNavigate } = useSafeNavigate();
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            safeNavigate({
                path: '/apps/:appId',
                params: {
                    appId,
                },
            });
        }, 1_000);
        return () => clearTimeout(timeout);
    }, [appId, safeNavigate]);
    if (!app) {
        return null;
    }
    return (_jsx(Box, { flexDirection: "column", children: _jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "green", padding: 1, marginBottom: 1, children: [_jsxs(Box, { children: [_jsx(Text, { color: "green", children: "\u2713 Your app is ready at: " }), _jsx(Text, { color: "blue", bold: true, underline: true, children: app.readUrl })] }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { dimColor: true, children: "Application ID: " }), _jsx(Text, { bold: true, children: appId })] })] }) }));
};
//# sourceMappingURL=success-step.js.map