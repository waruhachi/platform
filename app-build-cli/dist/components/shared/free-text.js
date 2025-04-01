import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { TextInput as InkTextInput } from '@inkjs/ui';
export const FreeText = ({ question, onSubmit, placeholder, }) => {
    return (_jsxs(Box, { flexDirection: "column", padding: 1, borderStyle: "round", borderColor: "blue", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, children: question }) }), _jsxs(Box, { children: [_jsx(Text, { color: "blue", children: "\u276F " }), _jsx(InkTextInput, { placeholder: placeholder, onSubmit: (value) => {
                            onSubmit(value);
                        } })] })] }));
};
//# sourceMappingURL=free-text.js.map