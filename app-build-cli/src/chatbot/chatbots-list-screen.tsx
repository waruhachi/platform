import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';
import { generateChatbot } from './chatbot.js';
import { useCreateChatbotWizardStore } from './store.js';
import { useListChatBots } from './use-chatbot.js';
import { Select } from '../components/shared/select.js';

type SelectItem = {
  label: string;
  value: string;
};

const getStatusEmoji = (status: string): string => {
  switch (status) {
    case 'deployed':
      return '🟢';
    case 'deploying':
      return '🟡';
    case 'failed':
      return '🔴';
    default:
      return '⚪️';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'deployed':
      return 'green';
    case 'deploying':
      return 'yellow';
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
};

const formatBotLabel = (bot: {
  name: string;
  id: string;
  deployStatus: string;
  runMode: string;
  recompileInProgress: boolean;
}) => {
  const status = bot.recompileInProgress ? 'recompiling' : bot.deployStatus;
  const statusEmoji = getStatusEmoji(status);
  const runModeEmoji = bot.runMode === 'telegram' ? '📱' : '🌐';

  return `${statusEmoji}  ${bot.name}  ${runModeEmoji}`;
};

export const ChatbotsListScreen = () => {
  const [selectedChatbotId, setSelectedChatbotId] = useState<string>('');
  const [iterationPrompt, setIterationPrompt] = useState('');

  const { data: chatbots, isLoading, error } = useListChatBots();

  const addMessageToChatbotHistory = useCreateChatbotWizardStore(
    (state) => state.addMessageToChatbotHistory
  );

  const handleIterationSubmit = async (text: string) => {
    if (!selectedChatbotId || !text) return;

    await generateChatbot({
      prompt: text,
      telegramBotToken: '',
      useStaging: false,
      runMode: 'telegram',
      botId: selectedChatbotId,
    });

    addMessageToChatbotHistory('iteration', text);
    setIterationPrompt('');
  };

  if (isLoading) {
    return (
      <Box justifyContent="center" paddingY={1}>
        <Text>⏳ Loading chatbots...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" alignItems="center" paddingY={1}>
        <Text color="red">❌ Error loading chatbots</Text>
        <Text dimColor>{error.message}</Text>
      </Box>
    );
  }

  if (!chatbots?.data.length) {
    return (
      <Box justifyContent="center" paddingY={1}>
        <Text>📭 No chatbots found</Text>
      </Box>
    );
  }

  const items: SelectItem[] = chatbots.data.map((bot) => ({
    label: formatBotLabel(bot),
    value: bot.id,
  }));

  const selectedBot = chatbots.data.find((bot) => bot.id === selectedChatbotId);

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold>🤖 Your Chatbots</Text>
      </Box>

      <Select
        question="Select a chatbot to iterate on:"
        options={items}
        onSubmit={(item) => setSelectedChatbotId(item)}
      />

      {selectedBot && (
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
                value={iterationPrompt}
                onChange={setIterationPrompt}
                onSubmit={(text: string) => void handleIterationSubmit(text)}
                placeholder="Enter your prompt and press Enter"
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
