import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { FreeText } from '../../components/shared/free-text.js';
import { StepHeader } from '../../components/ui/step-header.js';
import { useGenerateChatbotSpecs } from '../use-chatbot.js';
import { useCreateChatbotWizardStore } from '../store.js';
import { type ChatbotGenerationResult } from '../chatbot.js';

type GenerateSpecsStepProps = {
  onSuccess: (result: ChatbotGenerationResult, prompt: string) => void;
};

export const GenerateSpecsStep = ({ onSuccess }: GenerateSpecsStepProps) => {
  const config = useCreateChatbotWizardStore((s) => s.config);

  const {
    mutateAsync: generateChatbot,
    isPending: isGeneratingChatbot,
    error: generateChatbotError,
  } = useGenerateChatbotSpecs();

  return (
    <Box flexDirection="column">
      <StepHeader label="Let's Create Your Chatbot" progress={0.7} />
      <Box marginY={1}>
        <FreeText
          loading={isGeneratingChatbot}
          loadingText="Generating your chatbot specifications..."
          question="What kind of chatbot would you like to create?"
          placeholder="e.g., I want a note taking chatbot..."
          onSubmit={(value) => {
            void generateChatbot({ ...config, prompt: value }).then((result) =>
              onSuccess(result, value)
            );
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
          <Text italic>Please try again with a different prompt.</Text>
        </Box>
      )}
    </Box>
  );
};
