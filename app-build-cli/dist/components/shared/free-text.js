import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { TextInput as InkTextInput, Spinner, } from '@inkjs/ui';
import { Panel } from './panel.js';
import { useState } from 'react';
export const FreeText = ({ question, onSubmit, placeholder, loading, loadingText, }) => {
    const [submittedValue, setSubmittedValue] = useState('');
    return (_jsx(Panel, { title: question, variant: "default", boxProps: { width: '100%' }, children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsxs(Box, { children: [_jsx(Text, { color: "blue", children: "\u276F " }), submittedValue ? (_jsx(Text, { color: "gray", children: submittedValue })) : (_jsx(InkTextInput, { placeholder: placeholder, onSubmit: (value) => {
                                setSubmittedValue(value);
                                onSubmit(value);
                            } }))] }), loading && (_jsxs(Box, { gap: 1, children: [_jsx(Spinner, {}), _jsx(Text, { color: "yellow", children: loadingText || 'Loading...' })] }))] }) }));
};
//# sourceMappingURL=free-text.js.map