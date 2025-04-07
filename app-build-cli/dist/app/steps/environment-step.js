import { jsx as _jsx } from "react/jsx-runtime";
import { Box } from 'ink';
import { Select } from '../../components/shared/select.js';
import { steps } from './steps.js';
export const EnvironmentStep = ({ onSubmit }) => {
    return (_jsx(Box, { flexDirection: "column", children: _jsx(Box, { marginY: 1, children: _jsx(Select, { question: steps.environment.question, options: steps.environment.options, onSubmit: (value) => onSubmit(value) }) }) }));
};
//# sourceMappingURL=environment-step.js.map