import { useEffect } from 'react';
import { Box, Text } from 'ink';
import { ChatBotFlow } from './chatbot/create-chatbot.js';
import { ChatbotList } from './components/chatbot-list.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Select } from './components/shared/select.js';
import { ShortcutHints } from './components/ui/shortcut-hints.js';
import { useNavigation } from './chatbot/store.js';

const queryClient = new QueryClient();

// refresh the app every 100ms
const useKeepAlive = () =>
  useEffect(() => {
    setInterval(() => {}, 100);
  }, []);

export const App = () => {
  useKeepAlive();
  const { currentNavigationState, navigate } = useNavigation();

  const items = [
    { label: '🆕 Create new chatbot', value: 'chatbot.create' as const },
    {
      label: '📋 List and iterate existing chatbots',
      value: 'chatbot.list' as const,
    },
  ];

  let content;
  if (currentNavigationState?.startsWith('chatbot.create')) {
    content = <ChatBotFlow />;
  } else if (currentNavigationState?.startsWith('chatbot.list')) {
    content = <ChatbotList />;
  } else {
    content = (
      <>
        <Box marginBottom={1}>
          <Text bold>🤖 Chatbot Manager</Text>
        </Box>
        <Select
          question="What would you like to do?"
          options={items}
          onSubmit={(value) => navigate(value)}
        />
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Box flexDirection="column" padding={1}>
        {content}
        <ShortcutHints />
      </Box>
    </QueryClientProvider>
  );
};
