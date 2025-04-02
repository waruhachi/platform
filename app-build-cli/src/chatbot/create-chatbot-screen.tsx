import { Box, Text } from 'ink';
import { EnvironmentStep } from './steps/environment-step.js';
import { GenerateSpecsStep } from './steps/generate-specs-step.js';
import { GenerateStep } from './steps/generate-step.js';
import { SuccessStep } from './steps/success-step.js';
import { TokenStep } from './steps/token-step.js';
import { steps } from './steps/steps.js';
import { WizardHistory } from '../components/ui/wizard-history.js';
import { useCreateChatbotWizardStore } from './store.js';
import { RunModeStep } from './steps/run-mode-step.js';
import type { ChatbotGenerationResult } from './chatbot.js';
import { useSafeNavigate, useSafeSearchParams } from '../routes.js';

export const CreateChatbotScreen = () => {
  return (
    <Box flexDirection="column">
      <WizardHistory />
      <StepContent />
    </Box>
  );
};

function StepContent() {
  const { config, setConfig, addToHistory, addMessageToChatbotHistory } =
    useCreateChatbotWizardStore();

  const { safeNavigate } = useSafeNavigate();
  const [{ step, chatbotId }] = useSafeSearchParams('/chatbot/create');

  const handleRunModeSubmit = (runMode: string) => {
    const newConfig = {
      ...config,
      runMode: runMode as 'telegram' | 'http-server',
    };

    setConfig(newConfig);
    addToHistory(
      steps.runMode.question,
      steps.runMode.options.find((opt) => opt.value === runMode)?.label ||
        runMode
    );

    safeNavigate({
      path: '/chatbot/create',
      searchParams: { step: steps.runMode.nextStep(newConfig) },
    });
  };

  const handleTokenSubmit = (token: string) => {
    setConfig({ telegramBotToken: token });
    addToHistory(
      steps.token.question,
      token.slice(0, 8) + '...' // Show only part of the token for security
    );
    safeNavigate({
      path: '/chatbot/create',
      searchParams: { step: steps.token.nextStep },
    });
  };

  const handleEnvironmentSubmit = (environment: string) => {
    setConfig({
      useStaging: environment === 'staging',
    });
    addToHistory(
      steps.environment.question,
      steps.environment.options.find((opt) => opt.value === environment)
        ?.label || environment
    );
    safeNavigate({
      path: '/chatbot/create',
      searchParams: { step: steps.environment.nextStep },
    });
  };

  const handleGenerateBotSpecsSuccess = (
    botSpecs: ChatbotGenerationResult,
    prompt: string
  ) => {
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

  const handleGenerateBotSuccess = (bot: ChatbotGenerationResult) => {
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
    case 'token':
      return <TokenStep onSubmit={handleTokenSubmit} />;
    case 'environment':
      return <EnvironmentStep onSubmit={handleEnvironmentSubmit} />;
    case 'runMode':
      return <RunModeStep onSubmit={handleRunModeSubmit} />;
    case 'generateChatbotSpecs':
      return <GenerateSpecsStep onSuccess={handleGenerateBotSpecsSuccess} />;
    case 'generateChatbot':
      return <GenerateStep onSuccess={handleGenerateBotSuccess} />;
    case 'successGeneration':
      if (!chatbotId) {
        return <Text>No chatbot ID found</Text>;
      }
      return <SuccessStep chatbotId={chatbotId} />;
    default:
      return null;
  }
}
