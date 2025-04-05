import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Newline, Text } from 'ink';
import { TextInput as InkTextInput, Spinner, } from '@inkjs/ui';
import { Panel } from './panel.js';
import { useCallback, useEffect, useRef, useState } from 'react';
export const InfiniteFreeText = (props) => {
    const previousFreeInputStatus = useRef(props.status);
    const [inputsHistory, setInputsHistory] = useState([]);
    const onSubmitError = useCallback(({ errorMessage, retryMessage, prompt, question }) => {
        setInputsHistory([
            ...inputsHistory,
            {
                errorMessage,
                retryMessage,
                prompt,
                question,
                status: 'error',
                successMessage: '',
            },
        ]);
    }, [inputsHistory]);
    const onSubmitSuccess = useCallback(({ successMessage, prompt, question }) => {
        setInputsHistory([
            ...inputsHistory,
            {
                successMessage,
                prompt,
                question,
                status: 'success',
                errorMessage: '',
                retryMessage: '',
            },
        ]);
    }, [inputsHistory]);
    if (!props.status)
        return null;
    // this is to prevent the free input from showing an error when the user
    // has submitted a value and the status is error
    const freeInputStatus = previousFreeInputStatus.current === 'error' ? 'idle' : props.status;
    previousFreeInputStatus.current = freeInputStatus;
    return (_jsxs(Box, { flexDirection: "column", gap: 1, width: "100%", children: [inputsHistory.map((input, index) => input.status === 'error' ? (_jsx(FreeTextError, { ...input }, index)) : (_jsx(FreeTextSuccess, { ...input }, index))), _jsx(FreeText, { ...props, onSubmitError: onSubmitError, onSubmitSuccess: onSubmitSuccess, status: freeInputStatus })] }));
};
export const FreeText = (props) => {
    const { question, onSubmit, placeholder, status, loadingText, onSubmitError, onSubmitSuccess, } = props;
    const [submittedValue, setSubmittedValue] = useState('');
    useEffect(() => {
        if (status === 'error' && submittedValue) {
            onSubmitError?.({
                errorMessage: props.errorMessage || '',
                retryMessage: props.retryMessage || '',
                prompt: submittedValue,
                question: question || '',
            });
            setSubmittedValue('');
        }
        if (status === 'success' && submittedValue) {
            setSubmittedValue('');
            onSubmitSuccess?.({
                successMessage: props.successMessage,
                prompt: submittedValue,
                question: question || '',
            });
        }
    }, [
        status,
        submittedValue,
        onSubmitError,
        onSubmitSuccess,
        props.errorMessage,
        props.retryMessage,
        props.successMessage,
        question,
    ]);
    return (_jsx(_Fragment, { children: _jsx(Panel, { title: question, variant: "default", boxProps: { width: '100%' }, children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsxs(Box, { children: [_jsx(Text, { color: "blue", children: "\u276F " }), submittedValue ? (_jsx(Text, { color: "gray", children: submittedValue })) : (_jsx(InkTextInput, { placeholder: placeholder, onSubmit: (value) => {
                                    setSubmittedValue(value);
                                    onSubmit(value);
                                } }))] }), status === 'pending' && (_jsxs(Box, { gap: 1, children: [_jsx(Spinner, {}), _jsx(Text, { color: "yellow", children: loadingText || 'Loading...' })] }))] }) }) }));
};
function FreeTextError({ prompt, question, errorMessage, retryMessage, }) {
    return (_jsx(Panel, { title: _jsxs(Text, { children: [_jsx(Text, { children: question }), " ", _jsx(Text, { dimColor: true, children: prompt })] }), variant: "error", boxProps: { width: '100%' }, children: _jsx(Box, { flexDirection: "column", gap: 1, children: _jsxs(Text, { color: 'redBright', children: [_jsx(Text, { children: "X" }), " ", _jsx(Text, { children: errorMessage }), retryMessage && (_jsxs(_Fragment, { children: [_jsx(Newline, {}), _jsxs(Text, { children: [_jsx(Text, { color: "blue", children: "\u21B3" }), ' ', _jsx(Text, { color: "gray", children: retryMessage })] })] }))] }) }) }));
}
function FreeTextSuccess({ prompt, question, successMessage, }) {
    return (_jsx(Panel, { title: _jsxs(Text, { children: [_jsx(Text, { children: question }), " ", _jsx(Text, { dimColor: true, children: prompt })] }), variant: "success", boxProps: { width: '100%' }, children: _jsx(Box, { flexDirection: "column", gap: 1, children: _jsxs(Text, { color: 'greenBright', children: [_jsx(Text, { children: "\u2713" }), " ", _jsx(Text, { children: successMessage })] }) }) }));
}
//# sourceMappingURL=free-text.js.map