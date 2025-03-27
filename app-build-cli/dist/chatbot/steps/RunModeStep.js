import { jsx as _jsx } from "react/jsx-runtime";
import { Select } from '../../components/shared/Select.js';
import {} from './types.js';
export const RunModeStep = ({ config, setConfig, setStep, steps, step, }) => {
    return (_jsx(Select, { question: steps.runMode.question, options: steps.runMode.options, onSubmit: (runMode) => {
            const newConfig = {
                ...config,
                runMode: runMode,
            };
            setConfig(newConfig);
            setStep(steps[step].nextStep(newConfig));
        } }));
};
//# sourceMappingURL=RunModeStep.js.map