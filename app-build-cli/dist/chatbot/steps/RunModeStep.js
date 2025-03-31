import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from 'ink';
import { Select } from '../../components/shared/Select.js';
import { StepHeader } from '../../components/ui/StepHeader.js';
import { steps } from './steps.js';
export const RunModeStep = ({ onSubmit }) => {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(StepHeader, { label: steps.runMode.label, progress: steps.runMode.progress }), _jsx(Box, { marginY: 1, children: _jsx(Select, { question: steps.runMode.question, options: steps.runMode.options, onSubmit: (value) => onSubmit(value) }) })] }));
};
//# sourceMappingURL=RunModeStep.js.map