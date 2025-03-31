import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from 'ink';
import { FreeText } from '../../components/shared/FreeText.js';
import { StepHeader } from '../../components/ui/StepHeader.js';
import { steps } from './steps.js';
export const TokenStep = ({ onSubmit }) => {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(StepHeader, { label: steps.token.label, progress: steps.token.progress }), _jsx(Box, { marginY: 1, children: _jsx(FreeText, { question: steps.token.question, placeholder: steps.token.placeholder, onSubmit: onSubmit }) })] }));
};
//# sourceMappingURL=TokenStep.js.map