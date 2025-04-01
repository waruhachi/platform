import { Box, Text } from 'ink';
import { useListChatBots } from './use-chatbot.js';
import { useRouteParams } from '../routes.js';
import { getStatusEmoji, getStatusColor } from './chatbots-list-screen.js';
import { TextInput } from '@inkjs/ui';
import { generateChatbot } from './chatbot.js';
import { useCreateChatbotWizardStore } from './store.js';

export function ChatbotDetails() {
  const { chatbotId } = useRouteParams('/chatbots/:chatbotId');

  const addMessageToChatbotHistory = useCreateChatbotWizardStore(
    (state) => state.addMessageToChatbotHistory
  );

  const handleIterationSubmit = async (text: string) => {
    if (!chatbotId || !text) return;

    await generateChatbot({
      prompt: text,
      telegramBotToken: '',
      useStaging: false,
      runMode: 'telegram',
      botId: chatbotId,
    });

    addMessageToChatbotHistory('iteration', text);
  };

  const { data: chatbots, isLoading, error } = useListChatBots();
  const selectedBot = chatbots?.data.find((bot) => bot.id === chatbotId);

  if (!selectedBot) {
    return <Text>Bot not found</Text>;
  }

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <Box flexDirection="column" marginTop={1} padding={1}>
      <Box borderStyle="single" paddingX={1} flexDirection="column" gap={1}>
        <Box>
          <Text bold>📋 Bot Details</Text>
        </Box>

        <Box gap={2}>
          <Box width={12}>
            <Text>Name:</Text>
          </Box>
          <Text>{selectedBot.name}</Text>
        </Box>

        <Box gap={2}>
          <Box width={12}>
            <Text>Status:</Text>
          </Box>
          <Box>
            <Text>
              {getStatusEmoji(selectedBot.deployStatus)}{' '}
              <Text color={getStatusColor(selectedBot.deployStatus)}>
                {selectedBot.deployStatus}
              </Text>
            </Text>
          </Box>
        </Box>

        <Box gap={2}>
          <Box width={12}>
            <Text>Mode:</Text>
          </Box>
          <Text>
            {selectedBot.runMode === 'telegram'
              ? '📱 Telegram'
              : '🌐 HTTP Server'}
          </Text>
        </Box>

        {selectedBot.recompileInProgress && (
          <Box>
            <Text color="yellow">⚡️ Bot is recompiling...</Text>
          </Box>
        )}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>✨ Iteration Prompt</Text>
        <Box marginTop={1}>
          <TextInput
            onSubmit={(text: string) => void handleIterationSubmit(text)}
            placeholder="Enter your prompt and press Enter"
          />
        </Box>
      </Box>
    </Box>
  );
}
