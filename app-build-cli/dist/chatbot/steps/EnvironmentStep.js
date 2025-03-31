import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from 'ink';
import { Select } from '../../components/shared/Select.js';
import { StepHeader } from '../../components/ui/StepHeader.js';
import { steps } from './steps.js';
export const EnvironmentStep = ({ onSubmit }) => {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(StepHeader, { label: steps.environment.label, progress: steps.environment.progress }), _jsx(Box, { marginY: 1, children: _jsx(Select, { question: steps.environment.question, options: steps.environment.options, onSubmit: (value) => onSubmit(value) }) })] }));
};
//# sourceMappingURL=EnvironmentStep.js.map