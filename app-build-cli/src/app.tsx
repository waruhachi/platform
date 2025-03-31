import { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { ChatBotFlow } from './chatbot/create-chatbot.js';
import { ChatbotList } from './components/ChatbotList.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// refresh the app every 100ms
const useKeepAlive = () =>
  useEffect(() => {
    setInterval(() => {}, 100);
  }, []);

type Mode = 'create' | 'list';

type MenuItem = {
  label: string;
  value: Mode;
};

export const App = () => {
  useKeepAlive();
  const [mode, setMode] = useState<Mode>('create');

  const items: MenuItem[] = [
    { label: 'Create new chatbot', value: 'create' },
    { label: 'List and iterate existing chatbots', value: 'list' },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <Box flexDirection="column" gap={1}>
        <Text>Choose an action:</Text>
        <SelectInput
          items={items}
          onSelect={(item: MenuItem) => setMode(item.value)}
        />

        {mode === 'create' ? <ChatBotFlow /> : <ChatbotList />}
      </Box>
    </QueryClientProvider>
  );
};
