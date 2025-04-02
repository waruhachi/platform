import { jsx as _jsx } from "react/jsx-runtime";
import { Box } from 'ink';
import { Select } from '../../components/shared/select.js';
import { steps } from './steps.js';
export const RunModeStep = ({ onSubmit }) => {
    return (_jsx(Box, { flexDirection: "column", children: _jsx(Box, { marginY: 1, children: _jsx(Select, { question: steps.runMode.question, options: steps.runMode.options, onSubmit: (value) => onSubmit(value) }) }) }));
};
//# sourceMappingURL=run-mode-step.js.map