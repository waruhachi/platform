import { jsx as _jsx } from "react/jsx-runtime";
import { Select } from '../../components/shared/Select.js';
import {} from './types.js';
export const EnvironmentStep = ({ config, setConfig, setStep, steps, step, }) => {
    return (_jsx(Select, { question: steps.environment.question, options: steps.environment.options, onSubmit: (environment) => {
            setConfig((prev) => ({
                ...prev,
                useStaging: environment === 'staging',
            }));
            setStep(steps[step].nextStep);
        } }));
};
//# sourceMappingURL=EnvironmentStep.js.map