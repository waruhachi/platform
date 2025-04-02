import { Box } from 'ink';
import { Text } from 'ink';
import { useChatbot } from '../use-chatbot.js';
import React from 'react';
import { useSafeNavigate } from '../../routes.js';

type SuccessStepProps = {
  chatbotId: string;
};

export const SuccessStep = ({ chatbotId }: SuccessStepProps) => {
  const { data: chatbot } = useChatbot(chatbotId);
  const { safeNavigate } = useSafeNavigate();

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      safeNavigate({
        path: '/chatbots/:chatbotId',
        params: {
          chatbotId,
        },
      });
    }, 1_000);

    return () => clearTimeout(timeout);
  }, [chatbotId, safeNavigate]);

  if (!chatbot) {
    return null;
  }

  return (
    <Box flexDirection="column">
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="green"
        padding={1}
        marginBottom={1}
      >
        <Box>
          <Text color="green">✓ Your chatbot is ready at: </Text>
          <Text color="blue" bold underline>
            {chatbot.readUrl}
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Bot ID: </Text>
          <Text bold>{chatbotId}</Text>
        </Box>
      </Box>
    </Box>
  );
};
