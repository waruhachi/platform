import { Box, Text } from 'ink';
import { ProgressBar } from './progress-bar.js';

type StepHeaderProps = {
  label: string;
  progress: number; // 0 to 1
};

export const StepHeader = ({ label, progress }: StepHeaderProps) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color="blue" bold>
          {label}
        </Text>
      </Box>
      <Box marginY={1}>
        <ProgressBar progress={progress} />
      </Box>
    </Box>
  );
};
