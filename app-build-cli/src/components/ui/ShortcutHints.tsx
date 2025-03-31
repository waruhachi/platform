import { Box, Text, useInput } from 'ink';
import { useCreateChatbotWizardStore } from '../../chatbot/store.js';

export const ShortcutHints = () => {
  const goBack = useCreateChatbotWizardStore((s) => s.goBack);

  useInput((input, key) => {
    if (key.ctrl && input === 'b') {
      goBack();
    }
  });

  return (
    <Box marginTop={1}>
      <Text dimColor>Press 'ctrl+b' to go back to the previous step</Text>
    </Box>
  );
};
