import { useState } from 'react';
import { Box, Text } from 'ink';
import { type ChatbotGenerationResult } from './chatbot.js';
import { EnvironmentStep } from './steps/EnvironmentStep.js';
import { GenerateSpecsStep } from './steps/GenerateSpecsStep.js';
import { GenerateStep } from './steps/GenerateStep.js';
import { RunModeStep } from './steps/RunModeStep.js';
import { SuccessStep } from './steps/SuccessStep.js';
import { TokenStep } from './steps/TokenStep.js';
import type { ChatBotConfig, StepType } from './steps/types.js';

const steps = {
  runMode: {
    label: 'Application Type',
    question: 'Select the application type:',
    options: [
      { label: 'Telegram Bot', value: 'telegram' },
      { label: 'HTTP Server', value: 'http-server' },
    ],
    nextStep: (config: ChatBotConfig) =>
      config.runMode === 'telegram'
        ? ('token' as const)
        : ('environment' as const),
  },
  token: {
    label: 'Bot Configuration',
    question: 'Enter your Telegram Bot Token:',
    placeholder: 'e.g., 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
    nextStep: 'environment' as const,
  },
  environment: {
    label: 'Environment Selection',
    question: 'Choose where your chatbot will run:',
    options: [
      {
        label: '🚀 Production - For live deployment',
        value: 'production' as const,
      },
      { label: '🔧 Staging - For testing', value: 'staging' as const },
    ],
    nextStep: 'generateChatbotSpecs' as const,
  },
  generateChatbotSpecs: {
    label: 'Generating Chatbot specs',
    question: 'Generating the specs for your chatbot...',
    nextStep: 'generateChatbot' as const,
  },
  generateChatbot: {
    label: 'Generating Chatbot',
    question: 'Generating your chatbot...',
    nextStep: 'successGeneration' as const,
  },
  successGeneration: {
    label: 'Success',
    question: 'Chatbot created successfully!',
    nextStep: 'success' as const,
  },
} as const;

export const ChatBotFlow = () => {
  const [step, setStep] = useState<StepType>('runMode');
  const [config, setConfig] = useState<ChatBotConfig>({
    telegramBotToken: '',
    useStaging: false,
    runMode: 'telegram',
    prompt: '',
  });

  const [chatbot, setChatbot] = useState<ChatbotGenerationResult | null>(null);

  const stepContent = () => {
    switch (step) {
      case 'token':
        return (
          <TokenStep
            config={config}
            setConfig={setConfig}
            setStep={setStep}
            steps={steps}
            step={step}
          />
        );
      case 'environment':
        return (
          <EnvironmentStep
            config={config}
            setConfig={setConfig}
            setStep={setStep}
            steps={steps}
            step={step}
          />
        );
      case 'runMode':
        return (
          <RunModeStep
            config={config}
            setConfig={setConfig}
            setStep={setStep}
            steps={steps}
            step={step}
          />
        );
      case 'generateChatbotSpecs':
        return (
          <GenerateSpecsStep
            config={config}
            chatbot={chatbot}
            onSuccess={(result, prompt) => {
              console.log('result', result);
              setChatbot(result);
              setConfig((prev) => ({ ...prev, prompt }));
              setStep(steps[step].nextStep);
            }}
          />
        );
      case 'generateChatbot':
        return (
          <GenerateStep
            config={config}
            chatbot={chatbot}
            onSuccess={(result, prompt) => {
              console.log('result', result);
              setChatbot(result);
              setConfig((prev) => ({ ...prev, prompt }));
              setStep(steps[step].nextStep);
            }}
          />
        );
      case 'successGeneration':
        if (chatbot?.success) {
          return <SuccessStep chatbot={chatbot} config={config} />;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="blue" bold>
          {steps[step].label}
        </Text>
      </Box>
      {stepContent()}
    </Box>
  );
};
