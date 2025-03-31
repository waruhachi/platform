import { Box, Text } from 'ink';
import { useCreateChatbotWizardStore } from '../../chatbot/store.js';

export const WizardHistory = () => {
  const { history } = useCreateChatbotWizardStore();

  if (history.length === 0) return null;

  return (
    <Box flexDirection="column" marginBottom={1}>
      {history.map((entry, index) => (
        <Box key={index} flexDirection="column" marginBottom={1}>
          <Box>
            <Text color="cyan" dimColor>
              ❯{' '}
            </Text>
            <Text dimColor>{entry.question}</Text>
          </Box>
          <Box marginLeft={2}>
            <Text color="green">✓ </Text>
            <Text bold>{entry.answer}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
