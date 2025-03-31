import { Box, Text } from 'ink';

type HistoryEntry = {
  question: string;
  answer: string;
};

type WizardHistoryProps = {
  entries: HistoryEntry[];
};

export const WizardHistory = ({ entries }: WizardHistoryProps) => {
  if (entries.length === 0) return null;

  return (
    <Box flexDirection="column" marginBottom={1}>
      {entries.map((entry, index) => (
        <Box key={index} flexDirection="column" marginBottom={1}>
          <Box>
            <Text color="cyan" dimColor>
              ❯{' '}
            </Text>
            <Text dimColor>{entry.question}</Text>
          </Box>
          <Box marginLeft={2}>
            <Text color="green">✓ </Text>
            <Text bold>{entry.answer}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
