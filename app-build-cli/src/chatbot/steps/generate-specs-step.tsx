import { Box } from 'ink';
import { InfiniteFreeText } from '../../components/shared/free-text.js';
import { useGenerateChatbotSpecs } from '../use-chatbot.js';
import { useCreateChatbotWizardStore } from '../store.js';
import { type ChatbotGenerationResult } from '../chatbot.js';

type GenerateSpecsStepProps = {
  onSuccess: (result: ChatbotGenerationResult, prompt: string) => void;
};

export const GenerateSpecsStep = ({ onSuccess }: GenerateSpecsStepProps) => {
  const config = useCreateChatbotWizardStore((s) => s.config);

  const {
    status: generateChatbotStatus,
    mutate: generateChatbot,
    error: generateChatbotError,
  } = useGenerateChatbotSpecs({
    onSuccess: (result, params) => {
      onSuccess(result, params.prompt);
    },
  });

  return (
    <Box marginY={1}>
      <InfiniteFreeText
        status={generateChatbotStatus}
        errorMessage={generateChatbotError?.message}
        retryMessage="Please retry with a different prompt."
        loadingText="Generating your chatbot specifications..."
        question="What kind of chatbot would you like to create?"
        placeholder="e.g., I want a note taking chatbot..."
        onSubmit={(value) => {
          generateChatbot({ ...config, prompt: value });
        }}
      />
    </Box>
  );
};
