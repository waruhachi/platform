import { jsx as _jsx } from "react/jsx-runtime";
import { Box } from 'ink';
import { FreeText } from '../../components/shared/free-text.js';
import { steps } from './steps.js';
export const TokenStep = ({ onSubmit }) => {
    return (_jsx(Box, { flexDirection: "column", children: _jsx(Box, { marginY: 1, children: _jsx(FreeText, { question: steps.token.question, placeholder: steps.token.placeholder, onSubmit: onSubmit }) }) }));
};
//# sourceMappingURL=token-step.js.map