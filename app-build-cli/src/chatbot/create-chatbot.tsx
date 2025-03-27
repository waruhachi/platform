import { useState } from 'react';
import { Box, Text } from 'ink';
import { FreeText } from '../components/shared/FreeText.js';
import { Select } from '../components/shared/Select.js';
import { type ChatbotGenerationResult } from './chatbot.js';
import { GenerateSpecsStep, GenerateStep } from './generate-step.js';

type ChatBotConfig = {
  telegramBotToken: string;
  useStaging: boolean;
  runMode: 'telegram' | 'http-server';
  prompt: string;
};

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
};

type Step = keyof typeof steps;

export const ChatBotFlow = () => {
  const [step, setStep] = useState<Step>('runMode');
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
          <FreeText
            question={steps.token.question}
            placeholder={steps.token.placeholder}
            onSubmit={(telegramBotToken) => {
              setConfig((prev) => ({ ...prev, telegramBotToken }));
              setStep(steps[step].nextStep);
            }}
          />
        );
      case 'environment':
        return (
          <Select
            question={steps.environment.question}
            options={steps.environment.options}
            onSubmit={(environment) => {
              setConfig((prev) => ({
                ...prev,
                useStaging: environment === 'staging',
              }));
              setStep(steps[step].nextStep);
            }}
          />
        );
      case 'runMode':
        return (
          <Select
            question={steps.runMode.question}
            options={steps.runMode.options}
            onSubmit={(runMode) => {
              const newConfig = {
                ...config,
                runMode: runMode as 'telegram' | 'http-server',
              };
              setConfig(newConfig);
              setStep(steps[step].nextStep(newConfig));
            }}
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
          {steps[step].label}
        </Text>
      </Box>
      {stepContent()}
    </Box>
  );
};
