import { useState } from 'react';
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { FreeText } from '../components/shared/FreeText.js';
import {
  generateChatbot,
  type ChatbotGenerationResult,
} from './deploy-chatbot.js';

type GenerateStepProps = {
  config: {
    telegramBotToken: string;
    useStaging: boolean;
    runMode: 'telegram' | 'http-server';
  };
  onSuccess: (result: ChatbotGenerationResult, prompt: string) => void;
};

export const GenerateStep = ({ config, onSuccess }: GenerateStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateChatbot({
        ...config,
        prompt,
        userId: '123',
      });

      if (result.success) {
        onSuccess(result, prompt);
      } else {
        setError(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate chatbot'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box flexDirection="column">
      <FreeText
        question="Enter the prompt for your chatbot:"
        placeholder="e.g., You are a helpful assistant that..."
        onSubmit={handleSubmit}
      />

      {isLoading && (
        <Box marginTop={1}>
          <Spinner />
          <Text color="yellow"> Generating your chatbot...</Text>
        </Box>
      )}

      {error && (
        <Box marginTop={1} flexDirection="column">
          <Text color="red">✗ Error: {error}</Text>
          <Text italic>Please try again with a different prompt.</Text>
        </Box>
      )}
    </Box>
  );
};
