import { Box, Text } from 'ink';
import { Select } from '../components/shared/select.js';
import { useNavigate } from 'react-router';

const items = [
  { label: '🆕 Create new chatbot', value: '/chatbot/create' as const },
  {
    label: '📋 List and iterate existing chatbots',
    value: '/chatbot/list' as const,
  },
];

export function ChatbotHomeScreen() {
  const navigate = useNavigate();

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>🤖 Chatbot Manager</Text>
      </Box>
      <Select
        question="What would you like to do?"
        options={items}
        onSubmit={(value) => {
          void navigate(value);
        }}
      />
    </Box>
  );
}
