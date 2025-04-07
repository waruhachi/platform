import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text } from 'ink';
import { FreeText } from './shared/free-text.js';
import { MultiSelect } from './shared/multi-select.js';
import { Select } from './shared/select.js';
import {} from './shared/types.js';
export const AppIdeaPrompt = () => {
    const [step, setStep] = useState(0);
    const [appIdea, setAppIdea] = useState({});
    const featureOptions = [
        { label: 'User Authentication', value: 'auth' },
        { label: 'API Integration', value: 'api' },
        { label: 'Real-time Updates', value: 'realtime' },
        { label: 'File Upload', value: 'files' },
        { label: 'Search Functionality', value: 'search' },
        { label: 'Analytics Dashboard', value: 'analytics' },
    ];
    if (step === 0) {
        return (_jsx(FreeText, { question: "What's your app idea? Describe it briefly:", placeholder: "e.g., A task management app for teams", onSubmit: (description) => {
                setAppIdea((prev) => ({ ...prev, description }));
                setStep(1);
            } }));
    }
    if (step === 1) {
        return (_jsx(MultiSelect, { question: "Which features would you like to include?", options: featureOptions, onSubmit: (features) => {
                setAppIdea((prev) => ({ ...prev, features }));
                setStep(2);
            } }));
    }
    if (step === 2) {
        return (_jsx(Select, { question: "Would you like to include a database?", options: [
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' },
            ], onSubmit: (hasDatabase) => {
                setAppIdea((prev) => ({
                    ...prev,
                    hasDatabase: hasDatabase === 'true',
                }));
                setStep(3);
            } }));
    }
    return (_jsx(Box, { flexDirection: "column", padding: 1, borderStyle: "round", borderColor: "green", children: _jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { children: [_jsx(Text, { children: "Application Description: " }), _jsx(Text, { color: "green", children: appIdea.description })] }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { children: "Selected Features:" }), appIdea.features?.map((feature) => (_jsx(Box, { marginLeft: 1, children: _jsxs(Text, { color: "green", children: ["\u2022 ", feature.label] }) }, feature.value)))] }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { children: "Database: " }), _jsx(Text, { color: appIdea.hasDatabase ? 'green' : 'red', children: appIdea.hasDatabase ? 'Yes' : 'No' })] })] }) }));
};
//# sourceMappingURL=app-idea-prompt.js.map