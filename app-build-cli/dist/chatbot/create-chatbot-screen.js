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
export const CreateChatbotScreen = () => {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(WizardHistory, {}), _jsx(StepContent, {})] }));
};
function StepContent() {
    const { setConfig, addToHistory, addMessageToChatbotHistory } = useCreateChatbotWizardStore();
    const { safeNavigate } = useSafeNavigate();
    const [{ step, chatbotId }] = useSafeSearchParams('/chatbot/create');
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
            searchParams: {
                step: steps.generateChatbotSpecs.nextStep,
                chatbotId: botSpecs.chatbotId,
            },
        });
    };
    const handleGenerateBotSuccess = (bot) => {
        addMessageToChatbotHistory('generation', bot.message);
        safeNavigate({
            path: '/chatbot/create',
            searchParams: {
                step: steps.generateChatbot.nextStep,
                chatbotId: bot.chatbotId,
            },
        });
    };
    switch (step) {
        case 'environment':
            return _jsx(EnvironmentStep, { onSubmit: handleEnvironmentSubmit });
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