import { Box } from 'ink';
import { Select } from '../../components/shared/select.js';
import { steps } from './steps.js';

type RunModeStepProps = {
  onSubmit: (runMode: string) => void;
};

export const RunModeStep = ({ onSubmit }: RunModeStepProps) => {
  return (
    <Box flexDirection="column">
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
