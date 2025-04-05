import { jsx as _jsx } from "react/jsx-runtime";
import { Box } from 'ink';
import { InfiniteFreeText } from '../../components/shared/free-text.js';
import { useGenerateChatbotSpecs } from '../use-chatbot.js';
import { useCreateChatbotWizardStore } from '../store.js';
import {} from '../chatbot.js';
export const GenerateSpecsStep = ({ onSuccess }) => {
    const config = useCreateChatbotWizardStore((s) => s.config);
    const { status: generateChatbotStatus, mutate: generateChatbot, error: generateChatbotError, } = useGenerateChatbotSpecs({
        onSuccess: (result, params) => {
            onSuccess(result, params.prompt);
        },
    });
    return (_jsx(Box, { marginY: 1, children: _jsx(InfiniteFreeText, { successMessage: "Chatbot specifications generated successfully", status: generateChatbotStatus, errorMessage: generateChatbotError?.message, retryMessage: "Please retry with a different prompt.", loadingText: "Generating your chatbot specifications...", question: "What kind of chatbot would you like to create?", placeholder: "e.g., I want a note taking chatbot...", onSubmit: (value) => {
                generateChatbot({ ...config, prompt: value });
            } }) }));
};
//# sourceMappingURL=generate-specs-step.js.map