import { Box, Text } from 'ink';
import { type SelectItem } from './types.js';
import { Select as InkSelect } from '@inkjs/ui';

export type SelectProps = {
  question: string;
  onSubmit: (value: string) => void;
  options: SelectItem<string>[];
};

export const Select = ({ question, onSubmit, options }: SelectProps) => {
  return (
    <Box
      flexDirection="column"
      padding={1}
      borderStyle="round"
      borderColor="blue"
    >
      <Box marginBottom={1}>
        <Text bold>{question}</Text>
      </Box>
      <Text>Use ↑↓ to navigate, ENTER to select:</Text>
      <Box flexDirection="column">
        <InkSelect
          options={options}
          onChange={(value) => {
            onSubmit(value);
          }}
        />
      </Box>
    </Box>
  );
};
