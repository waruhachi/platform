import { Box, Text } from 'ink';
import { EnvironmentStep } from './steps/environment-step.js';
import { GenerateSpecsStep } from './steps/generate-specs-step.js';
import { GenerateStep } from './steps/generate-step.js';
import { SuccessStep } from './steps/success-step.js';
import { steps } from './steps/steps.js';
import { WizardHistory } from '../components/ui/wizard-history.js';
import { useCreateChatbotWizardStore } from './store.js';
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
  const { setConfig, addToHistory, addMessageToChatbotHistory } =
    useCreateChatbotWizardStore();

  const { safeNavigate } = useSafeNavigate();
  const [{ step, chatbotId }] = useSafeSearchParams('/chatbot/create');

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
    case 'environment':
      return <EnvironmentStep onSubmit={handleEnvironmentSubmit} />;
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
