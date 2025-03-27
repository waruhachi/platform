import { useState } from 'react';
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { FreeText } from '../../components/shared/FreeText.js';
import { generateChatbot, type ChatbotGenerationResult } from '../chatbot.js';
import { type GenerateStepProps } from './types.js';

export const GenerateSpecsStep = ({ config, onSuccess }: GenerateStepProps) => {
  const [formState, setFormState] = useState<{
    status: 'idle' | 'loading' | 'error' | 'success';
    data: ChatbotGenerationResult | null;
    error: string | null;
  }>({
    status: 'idle',
    data: null,
    error: null,
  });

  const handleSubmit = async (prompt: string) => {
    setFormState({ status: 'loading', data: null, error: null });

    try {
      const result = await generateChatbot({
        ...config,
        prompt,
      });

      if (result.success) {
        onSuccess(result, prompt);
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

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="blue" bold>
          🤖 Let's Create Your Chatbot!
        </Text>
      </Box>

      <FreeText
        question="What kind of chatbot would you like to create?"
        placeholder="e.g., I want a note taking chatbot..."
        onSubmit={handleSubmit}
      />

      {formState.status === 'loading' && (
        <Box marginTop={1}>
          <Spinner />
          <Text color="yellow"> Generating your chatbot specifications...</Text>
        </Box>
      )}

      {formState.status === 'error' && (
        <Box marginTop={1} flexDirection="column">
          <Text color="red">✗ Error: {formState.error}</Text>
          <Text italic>Please try again with a different prompt.</Text>
        </Box>
      )}
    </Box>
  );
};
