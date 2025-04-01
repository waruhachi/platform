import { Box, Text } from 'ink';
import { Select } from '../components/shared/select.js';
import { useSafeNavigate, type RoutePath } from '../routes.js';

const items = [
  { label: '🆕 Create new chatbot', value: '/chatbot/create' as const },
  {
    label: '📋 List and iterate existing chatbots',
    value: '/chatbots' as const,
  },
] satisfies Array<{
  label: string;
  value: RoutePath;
}>;

export function ChatbotHomeScreen() {
  const { safeNavigate } = useSafeNavigate();

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>🤖 Chatbot Manager</Text>
      </Box>
      <Select
        question="What would you like to do?"
        options={items}
        onSubmit={(value) => {
          safeNavigate({ path: value });
        }}
      />
    </Box>
  );
}
