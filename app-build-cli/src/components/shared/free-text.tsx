import { Box, Newline, Text } from 'ink';
import {
  TextInput as InkTextInput,
  Spinner,
  type TextInputProps,
} from '@inkjs/ui';
import { Panel } from './panel.js';
import { useCallback, useEffect, useRef, useState } from 'react';

type StatusProps = {
  status: 'pending' | 'success' | 'error' | 'idle';
  errorMessage: string | undefined;
  retryMessage?: string;
  loadingText: string;
};

type FreeTextErrorProps = {
  errorMessage: string;
  retryMessage: string;
  prompt: string;
  question: string;
};

export type FreeTextProps = {
  question?: string;
  onSubmit: (value: string) => void;
  placeholder?: string;
  retryMessage?: string;
  onSubmitError?: (args: FreeTextErrorProps) => void;
} & (
  | StatusProps
  | {
      status?: never;
      errorMessage?: never;
      loadingText?: never;
      retryMessage?: never;
    }
) &
  TextInputProps;

export const InfiniteFreeText = (props: FreeTextProps) => {
  const previousFreeInputStatus = useRef(props.status);
  const [errorInputs, setErrorInputs] = useState<
    {
      errorMessage: string;
      retryMessage: string;
      prompt: string;
      question: string;
    }[]
  >([]);

  const onSubmitError = useCallback(
    ({ errorMessage, retryMessage, prompt, question }: FreeTextErrorProps) => {
      setErrorInputs([
        ...errorInputs,
        { errorMessage, retryMessage, prompt, question },
      ]);
    },
    [errorInputs]
  );

  if (!props.status) return null;

  // this is to prevent the free input from showing an error when the user
  // has submitted a value and the status is error
  const freeInputStatus =
    previousFreeInputStatus.current === 'error' ? 'idle' : props.status;
  previousFreeInputStatus.current = freeInputStatus;

  return (
    <Box flexDirection="column" gap={1} width="100%">
      {errorInputs.map((input, index) => (
        <FreeTextError key={index} {...input} />
      ))}
      <FreeText
        {...props}
        onSubmitError={onSubmitError}
        status={freeInputStatus}
      />
    </Box>
  );
};

export const FreeText = (props: FreeTextProps) => {
  const {
    question,
    onSubmit,
    placeholder,
    status,
    loadingText,
    onSubmitError,
  } = props;

  const [submittedValue, setSubmittedValue] = useState('');

  useEffect(() => {
    if (status === 'error' && submittedValue) {
      onSubmitError?.({
        errorMessage: props.errorMessage || '',
        retryMessage: props.retryMessage || '',
        prompt: submittedValue,
        question: question || '',
      });
      setSubmittedValue('');
    }

    if (status === 'success') {
      setSubmittedValue('');
    }
  }, [
    status,
    submittedValue,
    onSubmitError,
    props.errorMessage,
    props.retryMessage,
    question,
  ]);

  return (
    <>
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
          {status === 'pending' && (
            <Box gap={1}>
              <Spinner />
              <Text color="yellow">{loadingText || 'Loading...'}</Text>
            </Box>
          )}
        </Box>
      </Panel>
    </>
  );
};

function FreeTextError({
  prompt,
  question,
  errorMessage,
  retryMessage,
}: FreeTextErrorProps) {
  return (
    <Panel
      title={
        <Text>
          <Text>{question}</Text> <Text dimColor>{prompt}</Text>
        </Text>
      }
      variant="error"
      boxProps={{ width: '100%' }}
    >
      <Box flexDirection="column" gap={1}>
        <Text color={'redBright'}>
          <Text>X</Text> <Text>{errorMessage}</Text>
          {retryMessage && (
            <>
              <Newline />
              <Text>
                <Text color="blue">↳</Text>{' '}
                <Text color="gray">{retryMessage}</Text>
              </Text>
            </>
          )}
        </Text>
      </Box>
    </Panel>
  );
}
