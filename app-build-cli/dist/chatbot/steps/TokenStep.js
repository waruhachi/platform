import { jsx as _jsx } from "react/jsx-runtime";
import { FreeText } from '../../components/shared/FreeText.js';
import {} from './types.js';
export const TokenStep = ({ config, setConfig, setStep, steps, step, }) => {
    return (_jsx(FreeText, { question: steps.token.question, placeholder: steps.token.placeholder, onSubmit: (telegramBotToken) => {
            setConfig((prev) => ({ ...prev, telegramBotToken }));
            setStep(steps[step].nextStep);
        } }));
};
//# sourceMappingURL=TokenStep.js.map