import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
export const InputField = ({ label, value, placeholder, onChange, onSubmit, }) => {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "gray", children: label }) }), _jsx(Box, { borderStyle: "round", borderColor: "blue", padding: 1, children: _jsx(TextInput, { value: value, placeholder: placeholder, onChange: onChange, onSubmit: onSubmit }) })] }));
};
//# sourceMappingURL=input-field.js.map