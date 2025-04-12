import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Text, Newline } from 'ink';
import {} from './types.js';
import { Select as InkSelect, Spinner } from '@inkjs/ui';
import { Panel } from './panel.js';
import { useState } from 'react';
export const Select = ({ question, onSubmit, options, status = 'idle', loadingText, errorMessage, retryMessage, successMessage, showPrompt = true, }) => {
    const [selectedValue, setSelectedValue] = useState('');
    const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);
    if (selectedValue && status === 'success' && !isSuccessSubmitted) {
        setIsSuccessSubmitted(true);
    }
    if (!showPrompt)
        return null;
    if (isSuccessSubmitted) {
        return null;
    }
    return (_jsx(Panel, { title: question, variant: status === 'error'
            ? 'error'
            : status === 'success'
                ? 'success'
                : 'default', boxProps: { width: '100%' }, children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsx(Box, { children: _jsx(Text, { children: "Use \u2191\u2193 to navigate, ENTER to select:" }) }), _jsx(Box, { flexDirection: "column", children: selectedValue ? (_jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsx(Text, { color: "gray", children: selectedValue }), isSuccessSubmitted && successMessage && (_jsxs(Text, { color: "greenBright", children: [_jsx(Text, { children: "\u2713" }), " ", _jsx(Text, { children: successMessage })] })), status === 'error' && errorMessage && (_jsxs(Text, { color: "redBright", children: [_jsx(Text, { children: "X" }), " ", _jsx(Text, { children: errorMessage }), retryMessage && (_jsxs(_Fragment, { children: [_jsx(Newline, {}), _jsxs(Text, { children: [_jsx(Text, { color: "blue", children: "\u21B3" }), ' ', _jsx(Text, { color: "gray", children: retryMessage })] })] }))] }))] })) : (_jsx(InkSelect, { options: options, onChange: (value) => {
                            setSelectedValue(value);
                            onSubmit(value);
                        } })) }), status === 'pending' && (_jsxs(Box, { gap: 1, children: [_jsx(Spinner, {}), _jsx(Text, { color: "yellow", children: loadingText || 'Loading...' })] }))] }) }));
};
//# sourceMappingURL=select.js.map