import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { EnvironmentStep } from './steps/environment-step.js';
import { GenerateSpecsStep } from './steps/generate-specs-step.js';
import { GenerateStep } from './steps/generate-step.js';
import { SuccessStep } from './steps/success-step.js';
import { steps } from './steps/steps.js';
import { WizardHistory } from '../components/ui/wizard-history.js';
import { useCreateChatbotWizardStore } from './store.js';
import { useSafeNavigate, useSafeSearchParams } from '../routes.js';
export const CreateAppScreen = () => {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(WizardHistory, {}), _jsx(StepContent, {})] }));
};
function StepContent() {
    const { setConfig, addToHistory, addMessageToChatbotHistory } = useCreateChatbotWizardStore();
    const { safeNavigate } = useSafeNavigate();
    const [{ step, appId }] = useSafeSearchParams('/app/create');
    const handleEnvironmentSubmit = (environment) => {
        setConfig({
            useStaging: environment === 'staging',
        });
        addToHistory(steps.environment.question, steps.environment.options.find((opt) => opt.value === environment)
            ?.label || environment);
        safeNavigate({
            path: '/app/create',
            searchParams: { step: steps.environment.nextStep },
        });
    };
    const handleGenerateAppSpecsSuccess = (appSpecs, prompt) => {
        setConfig({ prompt });
        addToHistory('What kind of app would you like to create?', prompt);
        addMessageToChatbotHistory('specs', appSpecs.message);
        safeNavigate({
            path: '/app/create',
            searchParams: {
                step: steps.generateAppSpecs.nextStep,
                appId: appSpecs.appId,
            },
        });
    };
    const handleGenerateAppSuccess = (app) => {
        addMessageToChatbotHistory('generation', app.message);
        safeNavigate({
            path: '/app/create',
            searchParams: {
                step: steps.generateApp.nextStep,
                appId: app.appId,
            },
        });
    };
    switch (step) {
        case 'environment':
            return _jsx(EnvironmentStep, { onSubmit: handleEnvironmentSubmit });
        case 'generateAppSpecs':
            return _jsx(GenerateSpecsStep, { onSuccess: handleGenerateAppSpecsSuccess });
        case 'generateApp':
            return _jsx(GenerateStep, { onSuccess: handleGenerateAppSuccess });
        case 'successGeneration':
            if (!appId) {
                return _jsx(Text, { children: "No app ID found" });
            }
            return _jsx(SuccessStep, { appId: appId });
        default:
            return null;
    }
}
//# sourceMappingURL=create-chatbot-screen.js.map