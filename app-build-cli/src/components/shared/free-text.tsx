import { Box, Text } from 'ink';
import {
  TextInput as InkTextInput,
  Spinner,
  type TextInputProps,
} from '@inkjs/ui';
import { Panel } from './panel.js';
import { useState } from 'react';

export type FreeTextProps = {
  question?: string;
  onSubmit: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  loadingText?: string;
} & TextInputProps;

export const FreeText = ({
  question,
  onSubmit,
  placeholder,
  loading,
  loadingText,
}: FreeTextProps) => {
  const [submittedValue, setSubmittedValue] = useState('');

  return (
    <Panel title={question} variant="default" boxProps={{ width: '100%' }}>
      <Box flexDirection="column" gap={1}>
        <Box>
          <Text color="blue">❯ </Text>
          {submittedValue ? (
            <Text color="gray">{submittedValue}</Text>
          ) : (
            <InkTextInput
              placeholder={placeholder}
              onSubmit={(value) => {
                setSubmittedValue(value);
                onSubmit(value);
              }}
            />
          )}
        </Box>
        {loading && (
          <Box gap={1}>
            <Spinner />
            <Text color="yellow">{loadingText || 'Loading...'}</Text>
          </Box>
        )}
      </Box>
    </Panel>
  );
};
