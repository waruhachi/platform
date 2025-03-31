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
import { ShortcutHints } from '../components/ui/ShortcutHints.js';
import { useCreateChatbotWizardStore } from './store.js';
import { RunModeStep } from './steps/RunModeStep.js';
export const ChatBotFlow = () => {
    const { step, config, history, canGoBack, setStep, setConfig, addToHistory, currentChatbotId, addMessageToChatbotHistory, } = useCreateChatbotWizardStore();
    const handleRunModeSubmit = (runMode) => {
        const newConfig = {
            ...config,
            runMode: runMode,
        };
        setConfig(newConfig);
        addToHistory(steps.runMode.question, steps.runMode.options.find((opt) => opt.value === runMode)?.label ||
            runMode);
        setStep(steps.runMode.nextStep(newConfig));
    };
    const handleTokenSubmit = (token) => {
        setConfig({ telegramBotToken: token });
        addToHistory(steps.token.question, token.slice(0, 8) + '...' // Show only part of the token for security
        );
        setStep(steps.token.nextStep);
    };
    const handleEnvironmentSubmit = (environment) => {
        setConfig({
            useStaging: environment === 'staging',
        });
        addToHistory(steps.environment.question, steps.environment.options.find((opt) => opt.value === environment)
            ?.label || environment);
        setStep(steps.environment.nextStep);
    };
    const handleGenerateBotSpecsSuccess = (botSpecs, prompt) => {
        setConfig({ prompt });
        addToHistory('What kind of chatbot would you like to create?', prompt);
        addMessageToChatbotHistory('specs', botSpecs.message);
        setStep(steps[step].nextStep);
    };
    const handleGenerateBotSuccess = (bot) => {
        addMessageToChatbotHistory('generation', bot.message);
        setStep(steps[step].nextStep);
    };
    const stepContent = () => {
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
                if (!currentChatbotId) {
                    return _jsx(Text, { children: "No chatbot ID found" });
                }
                return _jsx(SuccessStep, { chatbotId: currentChatbotId });
            default:
                return null;
        }
    };
    const showShortcutHints = history.length > 0 && step !== 'successGeneration' && canGoBack;
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Banner, {}), _jsx(WizardHistory, { entries: history }), stepContent(), showShortcutHints && _jsx(ShortcutHints, {})] }));
};
//# sourceMappingURL=create-chatbot.js.map