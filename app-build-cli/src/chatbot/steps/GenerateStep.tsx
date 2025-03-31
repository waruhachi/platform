import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { FreeText } from '../../components/shared/FreeText.js';
import { StepHeader } from '../../components/ui/StepHeader.js';
import { ProgressSteps } from '../../components/ui/ProgressSteps.js';
import { type ChatbotGenerationResult } from '../chatbot.js';
import { useChatbot, useGenerateChatbot } from '../useChatbot.js';
import { useCreateChatbotWizardStore } from '../store.js';

const buildSteps = [
  {
    message: '🏗️  Generating business model and use cases...',
    detail: '🎯 Analyzing requirements and creating domain models',
  },
  {
    message: '🗄️  Designing database schema...',
    detail: '📊 Creating tables, relations, and indexes',
  },
  {
    message: '⚡ Generating TypeScript code...',
    detail: '🔧 Creating type-safe implementations of your bot logic',
  },
  {
    message: '🚀 Compiling TypeScript...',
    detail: '✨ Ensuring type safety and generating JavaScript',
  },
  {
    message: '🧪 Generating test suites...',
    detail: '🎯 Creating comprehensive tests for your bot',
  },
  {
    message: '🛠️  Implementing handlers...',
    detail: '🔌 Creating route handlers and middleware',
  },
  {
    message: '✨ Finalizing code quality...',
    detail: '🎨 Running linters and formatters',
  },
];

export type GenerateStepProps = {
  onSuccess: (bot: ChatbotGenerationResult) => void;
};

export const GenerateStep = ({ onSuccess }: GenerateStepProps) => {
  const config = useCreateChatbotWizardStore((s) => s.config);
  const chatbotId = useCreateChatbotWizardStore((s) => s.currentChatbotId);

  const chatbotMessageHistory = useCreateChatbotWizardStore(
    (s) => s.chatbotMessageHistory
  );

  const [currentStep, setCurrentStep] = useState(0);
  const {
    mutate: generateChatbot,
    isPending: isGeneratingChatbot,
    error: generateChatbotError,
    data: generateChatbotData,
  } = useGenerateChatbot();
  const { data: chatbot } = useChatbot(chatbotId, {
    refetchInterval: 5_000,
  });

  const isWaitingForSpecsApproval =
    !chatbot?.isDeployed && !generateChatbotData;

  useEffect(() => {
    if (isWaitingForSpecsApproval || !chatbot || !chatbotId) {
      return;
    }

    // Handle successful deployment
    if (chatbot?.isDeployed && generateChatbotData) {
      console.log(
        'LET"S goooooooo - - - - - - -- - - - - - - - - -- - - dasdasdas'
      );
      onSuccess(generateChatbotData);
      return;
    }

    let isActive = true;

    const updateStep = () => {
      if (!isActive) return;
      setCurrentStep((prev) => (prev + 1) % buildSteps.length);
    };

    // Progress through steps every 5 seconds
    const stepInterval = setInterval(updateStep, 5000);

    // Cleanup function
    return () => {
      isActive = false;
      if (stepInterval) {
        clearInterval(stepInterval);
      }
    };
  }, [
    chatbot,
    chatbotId,
    generateChatbotData,
    isWaitingForSpecsApproval,
    onSuccess,
  ]);

  if (!chatbot) return null;

  if (isWaitingForSpecsApproval) {
    return (
      <Box flexDirection="column">
        <StepHeader label="Review Specifications" progress={0.8} />
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="blue"
          padding={1}
          marginBottom={1}
        >
          <Box marginBottom={1}>
            <Text color="blue" bold>
              Generated Chatbot Specification
            </Text>
          </Box>
          <Text>{chatbotMessageHistory['specs'].at(-1)}</Text>
        </Box>

        <Box marginBottom={1}>
          <Text>
            Would you like to proceed with deploying this chatbot with these
            specifications?
          </Text>
        </Box>

        <Box marginTop={1} gap={1}>
          {isGeneratingChatbot && <Spinner />}
          <FreeText
            question="Type 'yes' to deploy or provide feedback to modify the specifications:"
            placeholder="e.g., yes or I want to add more features..."
            onSubmit={() => {
              generateChatbot({ ...config, botId: chatbot.id });
            }}
          />
        </Box>

        {generateChatbotError && (
          <Box
            marginTop={1}
            flexDirection="column"
            borderStyle="round"
            borderColor="red"
            padding={1}
          >
            <Text color="red">✗ Error: {generateChatbotError.message}</Text>
          </Box>
        )}
      </Box>
    );
  }

  if (!chatbot.isDeployed) {
    return (
      <Box flexDirection="column">
        <StepHeader label="Building Your Chatbot" progress={0.9} />
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="blue"
          padding={1}
          marginBottom={1}
        >
          <Box marginBottom={1}>
            <Text dimColor>Bot ID: </Text>
            <Text color="yellow" bold>
              {chatbot.id}
            </Text>
          </Box>
        </Box>

        <ProgressSteps
          steps={buildSteps}
          currentStep={currentStep}
          isDeployed={chatbot.isDeployed}
        />

        <Box marginTop={1}>
          <Text dimColor italic>
            {chatbot.isDeployed
              ? '🎉 Deployment completed successfully!'
              : buildSteps[currentStep]?.detail || 'Preparing your chatbot...'}
          </Text>
        </Box>

        {chatbot.readUrl && (
          <Box
            marginTop={1}
            flexDirection="column"
            borderStyle="round"
            borderColor="green"
            padding={1}
          >
            <Text color="green">
              🌐 Your bot is available at:{' '}
              <Text bold underline>
                {chatbot?.readUrl}
              </Text>
            </Text>
          </Box>
        )}

        {generateChatbotError && (
          <Box
            marginTop={2}
            flexDirection="column"
            borderStyle="round"
            borderColor="red"
            padding={1}
          >
            <Text color="red">❌ Error: {generateChatbotError.message}</Text>
          </Box>
        )}

        {!chatbot.isDeployed && !generateChatbotError && (
          <Box marginTop={2}>
            <Text dimColor italic>
              🔄 Please wait while we set up your chatbot...
            </Text>
          </Box>
        )}
      </Box>
    );
  }
};
