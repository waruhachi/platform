import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { FreeText } from '../../components/shared/FreeText.js';
import { generateChatbot } from '../chatbot.js';
import { useCheckChatbotStatus } from '../useChatbot.js';
import { type GenerateStepProps } from './types.js';

export const GenerateStep = ({
  onSuccess,
  chatbot,
  config,
}: GenerateStepProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formState, setFormState] = useState<{
    status: 'idle' | 'loading' | 'error' | 'success';
    data: any;
    error: string | null;
  }>({
    status: 'idle',
    data: null,
    error: null,
  });

  const { isDeployed, readUrl, error } = useCheckChatbotStatus(
    // @ts-expect-error
    chatbot?.chatbotId
  );

  const isWaitingForSpecsApproval =
    formState.status !== 'success' && !isDeployed;

  const steps = [
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

  useEffect(() => {
    let stepInterval: NodeJS.Timeout;
    let isActive = true;

    const updateStep = () => {
      if (!isActive) return;
      setCurrentStep((prev) => (prev + 1) % steps.length);
    };

    // Handle successful deployment
    if (isDeployed && chatbot?.success) {
      onSuccess(chatbot, config.prompt);
      return;
    }

    // Don't start interval if already deployed or if chatbot failed
    if (isDeployed || !chatbot?.success) {
      return;
    }

    // Progress through steps every 5 seconds
    stepInterval = setInterval(updateStep, 5000);

    // Cleanup function
    return () => {
      isActive = false;
      if (stepInterval) {
        clearInterval(stepInterval);
      }
    };
  }, [chatbot?.success, isDeployed, config.prompt]);

  const handleSubmit = async (prompt: string) => {
    if (!chatbot?.success) {
      setFormState({
        status: 'error',
        data: null,
        error: 'Failed to get chatbot ID',
      });
      return;
    }

    setFormState({ status: 'loading', data: null, error: null });

    try {
      const result = await generateChatbot({
        ...config,
        prompt,
        botId: chatbot.chatbotId,
      });

      if (result.success) {
        setFormState({ status: 'success', data: result, error: null });
      } else {
        setFormState({
          status: 'error',
          data: null,
          error: result.error || 'Unknown error occurred',
        });
      }
    } catch (err) {
      setFormState({
        status: 'error',
        data: null,
        error:
          err instanceof Error ? err.message : 'Failed to generate chatbot',
      });
    }
  };

  if (!chatbot?.success) {
    return (
      <Box flexDirection="column">
        <Text color="red">✗ Error: {chatbot?.error}</Text>
      </Box>
    );
  }

  if (isWaitingForSpecsApproval) {
    return (
      <Box flexDirection="column">
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
          <Text>{chatbot.message}</Text>
        </Box>

        <Box marginBottom={1}>
          <Text>
            Would you like to proceed with deploying this chatbot with these
            specifications?
          </Text>
        </Box>

        <Box marginTop={1} gap={1}>
          {formState.status === 'loading' && <Spinner />}
          <FreeText
            question="Type 'yes' to deploy or provide feedback to modify the specifications:"
            placeholder="e.g., yes or I want to add more features..."
            onSubmit={handleSubmit}
          />
        </Box>

        {formState.status === 'error' && (
          <Box marginTop={1} flexDirection="column">
            <Text color="red">✗ Error: {formState.error}</Text>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="blue"
        padding={1}
        marginBottom={1}
      >
        <Box marginBottom={1}>
          <Text color="blue" bold>
            🤖 Building Your Chatbot
          </Text>
        </Box>
        <Text>
          🔑 Bot ID: <Text color="yellow">{chatbot.chatbotId}</Text>
        </Text>
      </Box>

      <Box flexDirection="column" marginY={1}>
        {steps.map((step, index) => (
          <Box key={index} marginY={1}>
            {index === currentStep && !isDeployed ? (
              <>
                <Text color="yellow">⟐ </Text>
                <Text color="yellow" bold>
                  {step.message}
                </Text>
              </>
            ) : index < currentStep || isDeployed ? (
              <>
                <Text color="green">✓ </Text>
                <Text dimColor>{step.message}</Text>
              </>
            ) : (
              <>
                <Text color="gray">○ </Text>
                <Text dimColor>{step.message}</Text>
              </>
            )}
          </Box>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text dimColor italic>
          {isDeployed
            ? '🎉 Deployment completed successfully!'
            : steps[currentStep]?.detail || 'Preparing your chatbot...'}
        </Text>
      </Box>

      {readUrl && (
        <Box marginTop={1} flexDirection="column">
          <Text color="green">
            🌐 Your bot is available at: <Text bold>{readUrl}</Text>
          </Text>
        </Box>
      )}

      <Box marginTop={2} flexDirection="column">
        {error ? (
          <Text color="red">❌ Error: {error}</Text>
        ) : (
          !isDeployed && (
            <Text dimColor italic>
              🔄 Please wait while we set up your chatbot...
            </Text>
          )
        )}
      </Box>
    </Box>
  );
};
