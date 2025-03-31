import { Box, Text } from 'ink';
import { EnvironmentStep } from './steps/EnvironmentStep.js';
import { GenerateSpecsStep } from './steps/GenerateSpecsStep.js';
import { GenerateStep } from './steps/GenerateStep.js';
import { SuccessStep } from './steps/SuccessStep.js';
import { TokenStep } from './steps/TokenStep.js';
import { steps, type StepType } from './steps/steps.js';
import { Banner } from '../components/ui/Banner.js';
import { WizardHistory } from '../components/ui/WizardHistory.js';
import { ShortcutHints } from '../components/ui/ShortcutHints.js';
import { useCreateChatbotWizardStore } from './store.js';
import { RunModeStep } from './steps/RunModeStep.js';
import type { ChatbotGenerationResult } from './chatbot.js';

export const ChatBotFlow = () => {
  const {
    step,
    config,
    history,
    canGoBack,
    setStep,
    setConfig,
    addToHistory,
    currentChatbotId,
    addMessageToChatbotHistory,
  } = useCreateChatbotWizardStore();

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
    setStep(steps.runMode.nextStep(newConfig));
  };

  const handleTokenSubmit = (token: string) => {
    setConfig({ telegramBotToken: token });
    addToHistory(
      steps.token.question,
      token.slice(0, 8) + '...' // Show only part of the token for security
    );
    setStep(steps.token.nextStep);
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
    setStep(steps.environment.nextStep);
  };

  const handleGenerateBotSpecsSuccess = (
    botSpecs: ChatbotGenerationResult,
    prompt: string
  ) => {
    setConfig({ prompt });
    addToHistory('What kind of chatbot would you like to create?', prompt);
    addMessageToChatbotHistory('specs', botSpecs.message);
    setStep(steps[step].nextStep as StepType);
  };

  const handleGenerateBotSuccess = (bot: ChatbotGenerationResult) => {
    addMessageToChatbotHistory('generation', bot.message);
    setStep(steps[step].nextStep as StepType);
  };

  const stepContent = () => {
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
        if (!currentChatbotId) {
          return <Text>No chatbot ID found</Text>;
        }
        return <SuccessStep chatbotId={currentChatbotId} />;
      default:
        return null;
    }
  };

  const showShortcutHints =
    history.length > 0 && step !== 'successGeneration' && canGoBack;

  return (
    <Box flexDirection="column">
      <Banner />
      <WizardHistory entries={history} />
      {stepContent()}
      {showShortcutHints && <ShortcutHints />}
    </Box>
  );
};
