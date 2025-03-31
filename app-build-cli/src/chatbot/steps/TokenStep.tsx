import { Box } from 'ink';
import { FreeText } from '../../components/shared/FreeText.js';
import { StepHeader } from '../../components/ui/StepHeader.js';
import { steps } from './steps.js';

type TokenStepProps = {
  onSubmit: (token: string) => void;
};

export const TokenStep = ({ onSubmit }: TokenStepProps) => {
  return (
    <Box flexDirection="column">
      <StepHeader label={steps.token.label} progress={steps.token.progress} />
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
