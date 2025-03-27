import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { FreeText } from '../../components/shared/FreeText.js';
import { generateChatbot } from '../chatbot.js';
import {} from './types.js';
export const GenerateSpecsStep = ({ config, onSuccess }) => {
    const [formState, setFormState] = useState({
        status: 'idle',
        data: null,
        error: null,
    });
    const handleSubmit = async (prompt) => {
        setFormState({ status: 'loading', data: null, error: null });
        try {
            const result = await generateChatbot({
                ...config,
                prompt,
            });
            if (result.success) {
                onSuccess(result, prompt);
            }
            else {
                setFormState({
                    status: 'error',
                    data: null,
                    error: result.error || 'Unknown error occurred',
                });
            }
        }
        catch (err) {
            setFormState({
                status: 'error',
                data: null,
                error: err instanceof Error ? err.message : 'Failed to generate chatbot',
            });
        }
    };
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "blue", bold: true, children: "\uD83E\uDD16 Let's Create Your Chatbot!" }) }), _jsx(FreeText, { question: "What kind of chatbot would you like to create?", placeholder: "e.g., I want a note taking chatbot...", onSubmit: handleSubmit }), formState.status === 'loading' && (_jsxs(Box, { marginTop: 1, children: [_jsx(Spinner, {}), _jsx(Text, { color: "yellow", children: " Generating your chatbot specifications..." })] })), formState.status === 'error' && (_jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Text, { color: "red", children: ["\u2717 Error: ", formState.error] }), _jsx(Text, { italic: true, children: "Please try again with a different prompt." })] }))] }));
};
//# sourceMappingURL=GenerateSpecsStep.js.map