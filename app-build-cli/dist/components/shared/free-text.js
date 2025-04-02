import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { TextInput as InkTextInput } from '@inkjs/ui';
import { Panel } from './panel.js';
export const FreeText = ({ question, onSubmit, placeholder, }) => {
    return (_jsx(Panel, { title: question, variant: "default", boxProps: { width: '100%' }, children: _jsxs(Box, { children: [_jsx(Text, { color: "blue", children: "\u276F " }), _jsx(InkTextInput, { placeholder: placeholder, onSubmit: (value) => {
                        onSubmit(value);
                    } })] }) }));
};
//# sourceMappingURL=free-text.js.map