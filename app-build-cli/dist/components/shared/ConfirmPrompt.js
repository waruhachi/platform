import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { ConfirmInput as InkConfirm } from '@inkjs/ui';
function ConfirmPrompt({ question, onSubmit }) {
    return (_jsxs(Box, { flexDirection: "column", padding: 1, borderStyle: "round", borderColor: "blue", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, children: question }) }), _jsx(InkConfirm, { onConfirm: () => onSubmit(true), onCancel: () => onSubmit(false) })] }));
}
export default ConfirmPrompt;
//# sourceMappingURL=ConfirmPrompt.js.map