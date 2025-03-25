import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { FreeText } from '../components/shared/FreeText.js';
import { generateChatbot, } from './deploy-chatbot.js';
export const GenerateStep = ({ config, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (prompt) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateChatbot({
                ...config,
                prompt,
                userId: '123',
            });
            if (result.success) {
                onSuccess(result, prompt);
            }
            else {
                setError(result.error || 'Unknown error occurred');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate chatbot');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(FreeText, { question: "Enter the prompt for your chatbot:", placeholder: "e.g., You are a helpful assistant that...", onSubmit: handleSubmit }), isLoading && (_jsxs(Box, { marginTop: 1, children: [_jsx(Spinner, {}), _jsx(Text, { color: "yellow", children: " Generating your chatbot..." })] })), error && (_jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Text, { color: "red", children: ["\u2717 Error: ", error] }), _jsx(Text, { italic: true, children: "Please try again with a different prompt." })] }))] }));
};
//# sourceMappingURL=generate-step.js.map