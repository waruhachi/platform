import { Select } from '../../components/shared/Select.js';
import { type StepProps } from './types.js';

export const EnvironmentStep = ({
  config,
  setConfig,
  setStep,
  steps,
  step,
}: StepProps) => {
  return (
    <Select
      question={steps.environment.question}
      options={steps.environment.options}
      onSubmit={(environment) => {
        setConfig((prev) => ({
          ...prev,
          useStaging: environment === 'staging',
        }));
        setStep(steps[step].nextStep);
      }}
    />
  );
};
