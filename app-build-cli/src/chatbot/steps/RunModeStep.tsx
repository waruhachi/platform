import { Select } from '../../components/shared/Select.js';
import { type StepProps } from './types.js';

export const RunModeStep = ({
  config,
  setConfig,
  setStep,
  steps,
  step,
}: StepProps) => {
  return (
    <Select
      question={steps.runMode.question}
      options={steps.runMode.options}
      onSubmit={(runMode) => {
        const newConfig = {
          ...config,
          runMode: runMode as 'telegram' | 'http-server',
        };
        setConfig(newConfig);
        setStep(steps[step].nextStep(newConfig));
      }}
    />
  );
};
