import { Box } from 'ink';
import { Select } from '../../components/shared/Select.js';
import { StepHeader } from '../../components/ui/StepHeader.js';
import { steps } from './steps.js';

type EnvironmentStepProps = {
  onSubmit: (environment: string) => void;
};

export const EnvironmentStep = ({ onSubmit }: EnvironmentStepProps) => {
  return (
    <Box flexDirection="column">
      <StepHeader
        label={steps.environment.label}
        progress={steps.environment.progress}
      />
      <Box marginY={1}>
        <Select
          question={steps.environment.question}
          options={steps.environment.options}
          onSubmit={(value) => onSubmit(value)}
        />
      </Box>
    </Box>
  );
};
