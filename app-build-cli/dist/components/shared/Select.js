import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import {} from './types.js';
import { Select as InkSelect } from '@inkjs/ui';
export const Select = ({ question, onSubmit, options }) => {
    return (_jsxs(Box, { flexDirection: "column", padding: 1, borderStyle: "round", borderColor: "blue", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, children: question }) }), _jsx(Text, { children: "Use \u2191\u2193 to navigate, ENTER to select:" }), _jsx(Box, { flexDirection: "column", children: _jsx(InkSelect, { options: options, onChange: (value) => {
                        onSubmit(value);
                    } }) })] }));
};
//# sourceMappingURL=Select.js.map