import { Box, Text, useInput } from 'ink';
import { useNavigation } from '../../chatbot/store.js';

export const ShortcutHints = () => {
  const { goBack } = useNavigation();

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
