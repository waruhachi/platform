import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { InfiniteFreeText } from '../../components/shared/free-text.js';
import { ProgressSteps } from '../../components/ui/progress-steps.js';
import {} from '../application.js';
import { useApplication, useGenerateApp } from '../use-application.js';
import { useCreateAppWizardStore } from '../store.js';
import { useSafeSearchParams } from '../../routes.js';
const buildSteps = [
    {
        message: '🏗️  Generating business model and use cases...',
        detail: '🎯 Analyzing requirements and creating domain models',
    },
    {
        message: '🗄️  Designing database schema...',
        detail: '📊 Creating tables, relations, and indexes',
    },
    {
        message: '⚡ Generating TypeScript code...',
        detail: '🔧 Creating type-safe implementations of your app logic',
    },
    {
        message: '🚀 Compiling TypeScript...',
        detail: '✨ Ensuring type safety and generating JavaScript',
    },
    {
        message: '🧪 Generating test suites...',
        detail: '🎯 Creating comprehensive tests for your app',
    },
    {
        message: '🛠️  Implementing handlers...',
        detail: '🔌 Creating route handlers and middleware',
    },
    {
        message: '✨ Finalizing code quality...',
        detail: '🎨 Running linters and formatters',
    },
];
export const GenerateStep = ({ onSuccess }) => {
    const config = useCreateAppWizardStore((s) => s.config);
    const [{ appId }] = useSafeSearchParams('/app/create');
    const appMessageHistory = useCreateAppWizardStore((s) => s.appMessageHistory);
    const [currentStep, setCurrentStep] = useState(0);
    const { mutate: generateApp, error: generateAppError, data: generateAppData, status: generateAppStatus, } = useGenerateApp();
    const { data: app } = useApplication(appId, {
        refetchInterval: 5_000,
    });
    const isWaitingForSpecsApproval = !app?.isDeployed && !generateAppData;
    useEffect(() => {
        if (isWaitingForSpecsApproval || !app || !appId) {
            return;
        }
        // Handle successful deployment
        if (app?.isDeployed && generateAppData) {
            onSuccess(generateAppData);
            return;
        }
        let isActive = true;
        const updateStep = () => {
            if (!isActive)
                return;
            setCurrentStep((prev) => (prev + 1) % buildSteps.length);
        };
        // Progress through steps every 5 seconds
        const stepInterval = setInterval(updateStep, 5000);
        // Cleanup function
        return () => {
            isActive = false;
            if (stepInterval) {
                clearInterval(stepInterval);
            }
        };
    }, [app, appId, generateAppData, isWaitingForSpecsApproval, onSuccess]);
    if (!app)
        return _jsx(Text, { children: "App not found" });
    if (isWaitingForSpecsApproval) {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "blue", padding: 1, marginBottom: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "blue", bold: true, children: "Generated App Specification" }) }), _jsx(Text, { children: appMessageHistory['specs'].at(-1) })] }), _jsx(Box, { marginBottom: 1, children: _jsx(Text, { children: "Would you like to proceed with deploying this app with these specifications?" }) }), _jsx(Box, { marginTop: 1, gap: 1, children: _jsx(InfiniteFreeText, { successMessage: "App deployed successfully", status: generateAppStatus, errorMessage: generateAppError?.message, retryMessage: "Please retry.", loadingText: "Deploying your app...", question: "Type 'yes' to deploy or provide feedback to modify the specifications:", placeholder: "e.g., yes or I want to add more features...", onSubmit: () => {
                            generateApp({ ...config, appId: app.id });
                        } }) })] }));
    }
    if (!app.isDeployed) {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { flexDirection: "column", borderStyle: "round", borderColor: "blue", padding: 1, marginBottom: 1, children: _jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { dimColor: true, children: "App ID: " }), _jsx(Text, { color: "yellow", bold: true, children: app.id })] }) }), _jsx(ProgressSteps, { steps: buildSteps, currentStep: currentStep, isDeployed: app.isDeployed }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: app.isDeployed ? '🎉 Deployment completed successfully!' : '' }) }), app.readUrl && (_jsx(Box, { marginTop: 1, flexDirection: "column", borderStyle: "round", borderColor: "green", padding: 1, children: _jsxs(Text, { color: "green", children: ["\uD83C\uDF10 Your app is available at:", ' ', _jsx(Text, { bold: true, underline: true, children: app?.readUrl })] }) })), _jsx(Box, { marginTop: 2, children: _jsx(Text, { dimColor: true, italic: true, children: "\uD83D\uDD04 Please wait while we set up your app..." }) })] }));
    }
    return null;
};
//# sourceMappingURL=generate-step.js.map