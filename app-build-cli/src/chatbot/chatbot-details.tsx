import { Box, Text } from 'ink';
import { useListChatBots } from './use-chatbot.js';
import { useRouteParams } from '../routes.js';
import { getStatusEmoji, getStatusColor } from './chatbots-list-screen.js';
import { generateChatbot } from './chatbot.js';
import { useCreateChatbotWizardStore } from './store.js';
import { FreeText } from '../components/shared/free-text.js';
import { Panel } from '../components/shared/panel.js';

export function ChatbotDetails() {
  const { chatbotId } = useRouteParams('/chatbots/:chatbotId');
  const { data: chatbots, isLoading, error } = useListChatBots();

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

  const selectedBot = chatbots?.data.find((bot) => bot.id === chatbotId);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text color="red">Error: {error.message}</Text>;
  }

  if (!selectedBot) {
    return <Text>Bot not found</Text>;
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Panel title="📋 Bot Details" variant="info">
        <Box flexDirection="column" gap={1}>
          <Text>
            <Text color="gray">Name: </Text>
            <Text bold>{selectedBot.name}</Text>
          </Text>

          <Text>
            <Text color="gray">Status: </Text>
            {getStatusEmoji(selectedBot.deployStatus)}{' '}
            <Text color={getStatusColor(selectedBot.deployStatus)} bold>
              {selectedBot.deployStatus}
            </Text>
          </Text>

          <Text>
            <Text color="gray">Mode: </Text>
            <Text bold>
              {selectedBot.runMode === 'telegram'
                ? '📱 Telegram'
                : '🌐 HTTP Server'}
            </Text>
          </Text>

          {selectedBot.recompileInProgress && (
            <Box marginTop={1}>
              <Text color="yellow">⚡️ Bot is recompiling...</Text>
            </Box>
          )}
        </Box>
      </Panel>

      <Box marginTop={2}>
        <FreeText
          question="How would you like to modify your chatbot?"
          placeholder="e.g., Add a new feature, modify behavior, or type 'exit' to finish"
          onSubmit={(text: string) => void handleIterationSubmit(text)}
        />
      </Box>
    </Box>
  );
}
