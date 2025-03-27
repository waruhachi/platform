import { FreeText } from '../../components/shared/FreeText.js';
import { type StepProps } from './types.js';

export const TokenStep = ({
  config,
  setConfig,
  setStep,
  steps,
  step,
}: StepProps) => {
  return (
    <FreeText
      question={steps.token.question}
      placeholder={steps.token.placeholder}
      onSubmit={(telegramBotToken) => {
        setConfig((prev) => ({ ...prev, telegramBotToken }));
        setStep(steps[step].nextStep);
      }}
    />
  );
};
