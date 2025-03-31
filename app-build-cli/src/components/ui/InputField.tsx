import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

type InputFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
};

export const InputField = ({
  label,
  value,
  placeholder,
  onChange,
  onSubmit,
}: InputFieldProps) => {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="gray">{label}</Text>
      </Box>
      <Box borderStyle="round" borderColor="blue" padding={1}>
        <TextInput
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      </Box>
    </Box>
  );
};
