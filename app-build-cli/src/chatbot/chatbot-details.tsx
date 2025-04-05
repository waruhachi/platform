import { Box, Text } from 'ink';
import { useChatbot, useGenerateChatbot } from './use-chatbot.js';
import { useRouteParams } from '../routes.js';
import { getStatusEmoji, getStatusColor } from './chatbots-list-screen.js';
import { InfiniteFreeText } from '../components/shared/free-text.js';
import { Panel } from '../components/shared/panel.js';

export function ChatbotDetails() {
  const { chatbotId } = useRouteParams('/chatbots/:chatbotId');
  const { data: chatbot, isLoading, error } = useChatbot(chatbotId);
  const {
    mutate: generateChatbotIteration,
    status: generateChatbotIterationStatus,
    error: generateChatbotIterationError,
  } = useGenerateChatbot();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text color="red">Error: {error.message}</Text>;
  }

  if (!chatbot) {
    return <Text>Bot not found</Text>;
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Panel title="📋 Bot Details" variant="info">
        <Box flexDirection="column" gap={1}>
          <Text>
            <Text color="gray">Name: </Text>
            <Text bold>{chatbot.name}</Text>
          </Text>

          <Text>
            <Text color="gray">Status: </Text>
            {getStatusEmoji(chatbot.deployStatus)}{' '}
            <Text color={getStatusColor(chatbot.deployStatus)} bold>
              {chatbot.deployStatus}
            </Text>
          </Text>

          <Text>
            <Text color="gray">Mode: </Text>
            <Text bold>
              {chatbot.runMode === 'telegram'
                ? '📱 Telegram'
                : '🌐 HTTP Server'}
            </Text>
          </Text>

          {chatbot.recompileInProgress && (
            <Box marginTop={1}>
              <Text color="yellow">⚡️ Bot is recompiling...</Text>
            </Box>
          )}
        </Box>
      </Panel>

      <Box marginTop={2}>
        <InfiniteFreeText
          successMessage="Changes applied successfully"
          question="How would you like to modify your chatbot?"
          placeholder="e.g., Add a new feature, modify behavior, or type 'exit' to finish"
          onSubmit={(text: string) =>
            generateChatbotIteration({
              prompt: text,
              ...chatbot,
              useStaging: false,
              telegramBotToken: '',
              runMode: 'http-server',
            })
          }
          status={generateChatbotIterationStatus}
          errorMessage={generateChatbotIterationError?.message}
          loadingText="Applying changes..."
          retryMessage="Please retry."
        />
      </Box>
    </Box>
  );
}
