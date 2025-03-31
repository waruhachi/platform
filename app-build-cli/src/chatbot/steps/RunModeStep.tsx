import { Box } from 'ink';
import { Select } from '../../components/shared/Select.js';
import { StepHeader } from '../../components/ui/StepHeader.js';
import { steps } from './steps.js';

type RunModeStepProps = {
  onSubmit: (runMode: string) => void;
};

export const RunModeStep = ({ onSubmit }: RunModeStepProps) => {
  return (
    <Box flexDirection="column">
      <StepHeader
        label={steps.runMode.label}
        progress={steps.runMode.progress}
      />
      <Box marginY={1}>
        <Select
          question={steps.runMode.question}
          options={steps.runMode.options}
          onSubmit={(value) => onSubmit(value as string)}
        />
      </Box>
    </Box>
  );
};
