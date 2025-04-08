import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import {} from './types.js';
import { MultiSelect as InkMultiSelect } from '@inkjs/ui';
export const MultiSelect = ({ question, options, onSubmit, }) => {
    return (_jsxs(Box, { flexDirection: "column", padding: 1, borderStyle: "round", borderColor: "blue", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { bold: true, children: question }) }), _jsxs(Text, { children: ["Use \u2191\u2193 to navigate, ", _jsx(Text, { bold: true, children: "SPACE to select" }), ", ENTER to confirm:"] }), _jsx(Box, { flexDirection: "column", children: _jsx(InkMultiSelect, { options: options, onSubmit: (value) => {
                        const selectedOptions = options.filter((o) => {
                            return value.includes(o.value);
                        });
                        onSubmit(selectedOptions);
                    } }) })] }));
};
//# sourceMappingURL=multi-select.js.map