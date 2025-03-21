import { useState } from 'react';
import { Box, Text } from 'ink';
import { FreeText } from '../components/shared/FreeText.js';
import { Select } from '../components/shared/Select.js';
import { type ChatbotGenerationResult } from '../deploy-chatbot.js';
import { GenerateStep } from './generate-step.js';

type TelegramBotConfig = {
  telegramBotToken: string;
  useStaging: boolean;
  runMode: 'telegram' | 'http-server';
  prompt: string;
};

const steps = {
  token: {
    number: 1,
    label: 'Bot Configuration',
    question: 'Enter your Telegram Bot Token:',
    placeholder: 'e.g., 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
    nextStep: 'environment' as const,
  },
  environment: {
    number: 2,
    label: 'Environment Selection',
    question: 'Choose where your chatbot will run:',
    options: [
      { label: '🚀 Production - For live deployment', value: 'true' },
      { label: '🔧 Staging - For testing', value: 'false' },
    ],
    nextStep: 'runMode' as const,
  },
  runMode: {
    number: 3,
    label: 'Run Mode Selection',
    question: 'Select the run mode:',
    options: [
      { label: 'Telegram Bot', value: 'telegram' },
      { label: 'HTTP Server', value: 'http-server' },
    ],
    nextStep: 'generate' as const,
  },
  generate: {
    number: 4,
    label: 'Generation',
    question: 'Generating your chatbot...',
    nextStep: 'successGeneration' as const,
  },
  successGeneration: {
    number: 5,
    label: 'Success',
    question: 'Chatbot created successfully!',
    nextStep: 'success' as const,
  },
};

type Step = keyof typeof steps;

export const TelegramBotFlow = () => {
  const [step, setStep] = useState<Step>('token');
  const [config, setConfig] = useState<TelegramBotConfig>({
    telegramBotToken: '',
    useStaging: false,
    runMode: 'telegram',
    prompt: '',
  });

  const [chatbot, setChatbot] = useState<ChatbotGenerationResult | null>(null);

  // Configuration Steps
  const stepContent = () => {
    switch (step) {
      case 'token':
        return (
          <FreeText
            question={steps.token.question}
            placeholder={steps.token.placeholder}
            onSubmit={(telegramBotToken) => {
              setConfig((prev) => ({ ...prev, telegramBotToken }));
              setStep(steps.token.nextStep);
            }}
          />
        );
      case 'environment':
        return (
          <Select
            question={steps.environment.question}
            options={steps.environment.options}
            onSubmit={(useStaging) => {
              setConfig((prev) => ({
                ...prev,
                useStaging: useStaging === 'true',
              }));
              setStep(steps.environment.nextStep);
            }}
          />
        );
      case 'runMode':
        return (
          <Select
            question={steps.runMode.question}
            options={steps.runMode.options}
            onSubmit={(runMode) => {
              setConfig((prev) => ({
                ...prev,
                runMode: runMode as 'telegram' | 'http-server',
              }));
              setStep(steps.runMode.nextStep);
            }}
          />
        );
      case 'generate':
        return (
          <GenerateStep
            config={config}
            onSuccess={(result, prompt) => {
              setChatbot(result);
              setConfig((prev) => ({ ...prev, prompt }));
              setStep(steps.generate.nextStep);
            }}
          />
        );
      case 'successGeneration':
        // Success State
        if (chatbot?.success) {
          return (
            <Box flexDirection="column" padding={1}>
              <Box
                flexDirection="column"
                borderStyle="round"
                borderColor="green"
                padding={1}
                marginBottom={1}
              >
                <Box>
                  <Text backgroundColor="green" color="black" bold>
                    {' '}
                    SUCCESS{' '}
                  </Text>
                  <Text color="green" bold>
                    {' '}
                    Chatbot created successfully!
                  </Text>
                </Box>
                <Box marginLeft={2} marginTop={1}>
                  <Text dimColor>Chatbot ID: </Text>
                  <Text bold>{chatbot.chatbotId}</Text>
                </Box>
                {chatbot.message && (
                  <Box marginLeft={2}>
                    <Text dimColor>Message: </Text>
                    <Text>{chatbot.message}</Text>
                  </Box>
                )}
              </Box>

              <Box
                flexDirection="column"
                borderStyle="round"
                borderColor="blue"
                padding={1}
              >
                <Text bold underline>
                  Configuration Summary
                </Text>
                <Box marginTop={1}>
                  <Text dimColor>Bot Token: </Text>
                  <Text color="green">{config.telegramBotToken}</Text>
                </Box>
                <Box marginTop={1}>
                  <Text dimColor>Environment: </Text>
                  <Text color="green">
                    {config.useStaging ? 'Staging' : 'Production'}
                  </Text>
                </Box>
                <Box marginTop={1}>
                  <Text dimColor>Run Mode: </Text>
                  <Text color="green">{config.runMode}</Text>
                </Box>
                <Box marginTop={1}>
                  <Text dimColor>Prompt: </Text>
                  <Text color="green">{config.prompt}</Text>
                </Box>
              </Box>

              <Box marginTop={2} flexDirection="column">
                <Text bold>Next Steps:</Text>
                <Text>
                  1. Save your Chatbot ID:{' '}
                  <Text color="yellow" bold>
                    {chatbot.chatbotId}
                  </Text>
                </Text>
                <Text>
                  2.{' '}
                  {config.runMode === 'telegram'
                    ? 'Open Telegram and start chatting with your bot!'
                    : 'Your HTTP server is ready to accept requests.'}
                </Text>
                <Box marginTop={1}>
                  <Text dimColor italic>
                    Press Ctrl+C to exit
                  </Text>
                </Box>
              </Box>
            </Box>
          );
        }

        // This should never happen as we stay in step 3 on error
        return null;
      default:
        return null;
    }
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="blue" bold>
          Step {steps[step].number} of {steps.successGeneration.number}:{' '}
          {steps[step].label}
        </Text>
      </Box>
      {stepContent()}
    </Box>
  );
};
