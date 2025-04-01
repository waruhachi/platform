import { Box, Text } from 'ink';
import { useListChatBots } from './use-chatbot.js';
import { Select } from '../components/shared/select.js';
import { useSafeNavigate } from '../routes.js';

type SelectItem = {
  label: string;
  value: string;
};

export const getStatusEmoji = (status: string): string => {
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

export const getStatusColor = (status: string): string => {
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
  const { safeNavigate } = useSafeNavigate();
  const { data: chatbots, isLoading, error } = useListChatBots();

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

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold>🤖 Your Chatbots</Text>
      </Box>

      <Select
        question="Select a chatbot to iterate on:"
        options={items}
        onSubmit={(item) => {
          safeNavigate({
            path: '/chatbots/:chatbotId',
            params: { chatbotId: item },
          });
        }}
      />
    </Box>
  );
};
