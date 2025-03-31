import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { EnvironmentStep } from './steps/EnvironmentStep.js';
import { GenerateSpecsStep } from './steps/GenerateSpecsStep.js';
import { GenerateStep } from './steps/GenerateStep.js';
import { SuccessStep } from './steps/SuccessStep.js';
import { TokenStep } from './steps/TokenStep.js';
import { steps } from './steps/steps.js';
import { Banner } from '../components/ui/Banner.js';
import { WizardHistory } from '../components/ui/WizardHistory.js';
import { useCreateChatbotWizardStore, useNavigation } from './store.js';
import { RunModeStep } from './steps/RunModeStep.js';
export const ChatBotFlow = () => {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Banner, {}), _jsx(WizardHistory, {}), _jsx(StepContent, {})] }));
};
function StepContent() {
    const { config, setConfig, addToHistory, currentChatbotId, addMessageToChatbotHistory, } = useCreateChatbotWizardStore();
    const { currentNavigationState, navigate } = useNavigation();
    const handleRunModeSubmit = (runMode) => {
        const newConfig = {
            ...config,
            runMode: runMode,
        };
        setConfig(newConfig);
        addToHistory(steps.runMode.question, steps.runMode.options.find((opt) => opt.value === runMode)?.label ||
            runMode);
        navigate(`chatbot.create.${steps.runMode.nextStep(newConfig)}`);
    };
    const handleTokenSubmit = (token) => {
        setConfig({ telegramBotToken: token });
        addToHistory(steps.token.question, token.slice(0, 8) + '...' // Show only part of the token for security
        );
        navigate(`chatbot.create.${steps.token.nextStep}`);
    };
    const handleEnvironmentSubmit = (environment) => {
        setConfig({
            useStaging: environment === 'staging',
        });
        addToHistory(steps.environment.question, steps.environment.options.find((opt) => opt.value === environment)
            ?.label || environment);
        navigate(`chatbot.create.${steps.environment.nextStep}`);
    };
    const handleGenerateBotSpecsSuccess = (botSpecs, prompt) => {
        setConfig({ prompt });
        addToHistory('What kind of chatbot would you like to create?', prompt);
        addMessageToChatbotHistory('specs', botSpecs.message);
        navigate(`chatbot.create.${steps.generateChatbotSpecs.nextStep}`);
    };
    const handleGenerateBotSuccess = (bot) => {
        addMessageToChatbotHistory('generation', bot.message);
        navigate(`chatbot.create.${steps.generateChatbot.nextStep}`);
    };
    switch (currentNavigationState) {
        case 'chatbot.create.token':
            return _jsx(TokenStep, { onSubmit: handleTokenSubmit });
        case 'chatbot.create.environment':
            return _jsx(EnvironmentStep, { onSubmit: handleEnvironmentSubmit });
        case 'chatbot.create.runMode':
        case 'chatbot.create':
            return _jsx(RunModeStep, { onSubmit: handleRunModeSubmit });
        case 'chatbot.create.generateChatbotSpecs':
            return _jsx(GenerateSpecsStep, { onSuccess: handleGenerateBotSpecsSuccess });
        case 'chatbot.create.generateChatbot':
            return _jsx(GenerateStep, { onSuccess: handleGenerateBotSuccess });
        case 'chatbot.create.successGeneration':
            if (!currentChatbotId) {
                return _jsx(Text, { children: "No chatbot ID found" });
            }
            return _jsx(SuccessStep, { chatbotId: currentChatbotId });
        default:
            return null;
    }
}
//# sourceMappingURL=create-chatbot.js.map