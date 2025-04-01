import { Box, Text } from 'ink';
import { EnvironmentStep } from './steps/environment-step.js';
import { GenerateSpecsStep } from './steps/generate-specs-step.js';
import { GenerateStep } from './steps/generate-step.js';
import { SuccessStep } from './steps/success-step.js';
import { TokenStep } from './steps/token-step.js';
import { steps } from './steps/steps.js';
import { Banner } from '../components/ui/banner.js';
import { WizardHistory } from '../components/ui/wizard-history.js';
import { useCreateChatbotWizardStore, useNavigation } from './store.js';
import { RunModeStep } from './steps/run-mode-step.js';
import type { ChatbotGenerationResult } from './chatbot.js';

export const ChatBotFlow = () => {
  return (
    <Box flexDirection="column">
      <Banner />
      <WizardHistory />
      <StepContent />
    </Box>
  );
};

function StepContent() {
  const {
    config,
    setConfig,
    addToHistory,
    currentChatbotId,
    addMessageToChatbotHistory,
  } = useCreateChatbotWizardStore();

  const { currentNavigationState, navigate } = useNavigation();

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
    navigate(`chatbot.create.${steps.runMode.nextStep(newConfig)}`);
  };

  const handleTokenSubmit = (token: string) => {
    setConfig({ telegramBotToken: token });
    addToHistory(
      steps.token.question,
      token.slice(0, 8) + '...' // Show only part of the token for security
    );
    navigate(`chatbot.create.${steps.token.nextStep}`);
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
    navigate(`chatbot.create.${steps.environment.nextStep}`);
  };

  const handleGenerateBotSpecsSuccess = (
    botSpecs: ChatbotGenerationResult,
    prompt: string
  ) => {
    setConfig({ prompt });
    addToHistory('What kind of chatbot would you like to create?', prompt);
    addMessageToChatbotHistory('specs', botSpecs.message);
    navigate(`chatbot.create.${steps.generateChatbotSpecs.nextStep}`);
  };

  const handleGenerateBotSuccess = (bot: ChatbotGenerationResult) => {
    addMessageToChatbotHistory('generation', bot.message);
    navigate(`chatbot.create.${steps.generateChatbot.nextStep}`);
  };

  switch (currentNavigationState) {
    case 'chatbot.create.token':
      return <TokenStep onSubmit={handleTokenSubmit} />;
    case 'chatbot.create.environment':
      return <EnvironmentStep onSubmit={handleEnvironmentSubmit} />;
    case 'chatbot.create.runMode':
    case 'chatbot.create':
      return <RunModeStep onSubmit={handleRunModeSubmit} />;
    case 'chatbot.create.generateChatbotSpecs':
      return <GenerateSpecsStep onSuccess={handleGenerateBotSpecsSuccess} />;
    case 'chatbot.create.generateChatbot':
      return <GenerateStep onSuccess={handleGenerateBotSuccess} />;
    case 'chatbot.create.successGeneration':
      if (!currentChatbotId) {
        return <Text>No chatbot ID found</Text>;
      }
      return <SuccessStep chatbotId={currentChatbotId} />;
    default:
      return null;
  }
}
