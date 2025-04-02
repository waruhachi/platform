import { Box, Text } from 'ink';
import { TextInput as InkTextInput, type TextInputProps } from '@inkjs/ui';
import { Panel } from './panel.js';

export type FreeTextProps = {
  question?: string;
  onSubmit: (value: string) => void;
  placeholder?: string;
} & TextInputProps;

export const FreeText = ({
  question,
  onSubmit,
  placeholder,
}: FreeTextProps) => {
  return (
    <Panel title={question} variant="default" boxProps={{ width: '100%' }}>
      <Box>
        <Text color="blue">❯ </Text>
        <InkTextInput
          placeholder={placeholder}
          onSubmit={(value) => {
            onSubmit(value);
          }}
        />
      </Box>
    </Panel>
  );
};
