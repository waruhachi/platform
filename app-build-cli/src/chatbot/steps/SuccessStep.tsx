import { Box, Text } from 'ink';
import { type ChatbotGenerationResult } from '../chatbot.js';
import { type ChatBotConfig } from './types.js';

type SuccessStepProps = {
  chatbot: ChatbotGenerationResult;
  config: ChatBotConfig;
};

export const SuccessStep = ({ chatbot, config }: SuccessStepProps) => {
  if (!chatbot?.success) return null;

  return (
    <Box flexDirection="column" padding={1}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="green"
        padding={1}
        marginBottom={1}
      >
        <Box>
          <Text backgroundColor="green" color="black" bold>
            {' '}
            SUCCESS{' '}
          </Text>
          <Text color="green" bold>
            {' '}
            Chatbot created successfully!
          </Text>
        </Box>
        <Box marginLeft={2} marginTop={1}>
          <Text dimColor>Chatbot ID: </Text>
          <Text bold>{chatbot.chatbotId}</Text>
        </Box>
        {chatbot.message && (
          <Box marginLeft={2}>
            <Text dimColor>Message: </Text>
            <Text>{chatbot.message}</Text>
          </Box>
        )}
      </Box>

      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="blue"
        padding={1}
      >
        <Text bold underline>
          Configuration Summary
        </Text>
        <Box marginTop={1}>
          <Text dimColor>Bot Token: </Text>
          <Text color="green">{config.telegramBotToken}</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Environment: </Text>
          <Text color="green">
            {config.useStaging ? 'Staging' : 'Production'}
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Run Mode: </Text>
          <Text color="green">{config.runMode}</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Prompt: </Text>
          <Text color="green">{config.prompt}</Text>
        </Box>
      </Box>

      <Box marginTop={2} flexDirection="column">
        <Text bold>Next Steps:</Text>
        <Text>
          1. Save your Chatbot ID:{' '}
          <Text color="yellow" bold>
            {chatbot.chatbotId}
          </Text>
        </Text>
        <Text>
          2.{' '}
          {config.runMode === 'telegram'
            ? 'Open Telegram and start chatting with your bot!'
            : 'Your HTTP server is ready to accept requests.'}
        </Text>
        <Box marginTop={1}>
          <Text dimColor italic>
            Press Ctrl+C to exit
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
