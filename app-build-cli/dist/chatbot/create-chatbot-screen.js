import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { EnvironmentStep } from './steps/environment-step.js';
import { GenerateSpecsStep } from './steps/generate-specs-step.js';
import { GenerateStep } from './steps/generate-step.js';
import { SuccessStep } from './steps/success-step.js';
import { TokenStep } from './steps/token-step.js';
import { steps } from './steps/steps.js';
import { Banner } from '../components/ui/banner.js';
import { WizardHistory } from '../components/ui/wizard-history.js';
import { useCreateChatbotWizardStore } from './store.js';
import { RunModeStep } from './steps/run-mode-step.js';
import { useSafeNavigate, useSafeSearchParams } from '../routes.js';
export const CreateChatbotScreen = () => {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Banner, {}), _jsx(WizardHistory, {}), _jsx(StepContent, {})] }));
};
function StepContent() {
    const { config, setConfig, addToHistory, addMessageToChatbotHistory } = useCreateChatbotWizardStore();
    const { safeNavigate } = useSafeNavigate();
    const [{ step, chatbotId }] = useSafeSearchParams('/chatbot/create');
    const handleRunModeSubmit = (runMode) => {
        const newConfig = {
            ...config,
            runMode: runMode,
        };
        safeNavigate({
            path: '/chatbot/create',
            searchParams: { step: steps.runMode.nextStep(newConfig) },
        });
    };
    const handleTokenSubmit = (token) => {
        setConfig({ telegramBotToken: token });
        addToHistory(steps.token.question, token.slice(0, 8) + '...' // Show only part of the token for security
        );
        safeNavigate({
            path: '/chatbot/create',
            searchParams: { step: steps.token.nextStep },
        });
    };
    const handleEnvironmentSubmit = (environment) => {
        setConfig({
            useStaging: environment === 'staging',
        });
        addToHistory(steps.environment.question, steps.environment.options.find((opt) => opt.value === environment)
            ?.label || environment);
        safeNavigate({
            path: '/chatbot/create',
            searchParams: { step: steps.environment.nextStep },
        });
    };
    const handleGenerateBotSpecsSuccess = (botSpecs, prompt) => {
        setConfig({ prompt });
        addToHistory('What kind of chatbot would you like to create?', prompt);
        addMessageToChatbotHistory('specs', botSpecs.message);
        safeNavigate({
            path: '/chatbot/create',
            searchParams: { step: steps.generateChatbotSpecs.nextStep },
        });
    };
    const handleGenerateBotSuccess = (bot) => {
        addMessageToChatbotHistory('generation', bot.message);
        safeNavigate({
            path: '/chatbot/create',
            searchParams: { step: steps.generateChatbot.nextStep },
        });
    };
    switch (step) {
        case 'token':
            return _jsx(TokenStep, { onSubmit: handleTokenSubmit });
        case 'environment':
            return _jsx(EnvironmentStep, { onSubmit: handleEnvironmentSubmit });
        case 'runMode':
            return _jsx(RunModeStep, { onSubmit: handleRunModeSubmit });
        case 'generateChatbotSpecs':
            return _jsx(GenerateSpecsStep, { onSuccess: handleGenerateBotSpecsSuccess });
        case 'generateChatbot':
            return _jsx(GenerateStep, { onSuccess: handleGenerateBotSuccess });
        case 'successGeneration':
            if (!chatbotId) {
                return _jsx(Text, { children: "No chatbot ID found" });
            }
            return _jsx(SuccessStep, { chatbotId: chatbotId });
        default:
            return null;
    }
}
//# sourceMappingURL=create-chatbot-screen.js.map