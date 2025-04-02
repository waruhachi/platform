import { Box } from 'ink';
import { FreeText } from '../../components/shared/free-text.js';
import { steps } from './steps.js';

type TokenStepProps = {
  onSubmit: (token: string) => void;
};

export const TokenStep = ({ onSubmit }: TokenStepProps) => {
  return (
    <Box flexDirection="column">
      <Box marginY={1}>
        <FreeText
          question={steps.token.question}
          placeholder={steps.token.placeholder}
          onSubmit={onSubmit}
        />
      </Box>
    </Box>
  );
};
