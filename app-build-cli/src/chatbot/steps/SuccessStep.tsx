import { Box } from 'ink';
import { StepHeader } from '../../components/ui/StepHeader.js';
import { SuccessMessage } from '../../components/ui/SuccessMessage.js';
import { useChatbot } from '../useChatbot.js';

type SuccessStepProps = {
  chatbotId: string;
};

export const SuccessStep = ({ chatbotId }: SuccessStepProps) => {
  const { data: chatbot } = useChatbot(chatbotId);

  if (!chatbot) {
    return null;
  }

  return (
    <Box flexDirection="column">
      <StepHeader label="Success!" progress={1} />
      <SuccessMessage
        title="Chatbot Created Successfully!"
        message={`Your chatbot has been created and is ready to use. You can access it at: ${chatbot.readUrl}`}
        details={[
          { label: 'Bot ID', value: chatbotId },
          {
            label: 'Status',
            value: 'Your chatbot is now ready to handle user interactions.',
            color: 'green',
          },
          {
            label: 'Next Steps',
            value:
              'You can customize and extend its functionality through the web interface.',
          },
        ]}
      />
    </Box>
  );
};
