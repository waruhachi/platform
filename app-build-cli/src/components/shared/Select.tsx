import { Box, Text } from 'ink';
import { type SelectItem } from './types.js';
import { Select as InkSelect } from '@inkjs/ui';

export type SelectProps<T extends string> = {
  question: string;
  onSubmit: (value: T) => void;
  options: SelectItem<T>[];
};

export const Select = <T extends string>({
  question,
  onSubmit,
  options,
}: SelectProps<T>) => {
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
            onSubmit(value as T);
          }}
        />
      </Box>
    </Box>
  );
};
