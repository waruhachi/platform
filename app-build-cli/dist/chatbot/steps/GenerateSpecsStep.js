import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { FreeText } from '../../components/shared/FreeText.js';
import { StepHeader } from '../../components/ui/StepHeader.js';
import { useGenerateChatbotSpecs } from '../useChatbot.js';
import { useCreateChatbotWizardStore } from '../store.js';
import {} from '../chatbot.js';
export const GenerateSpecsStep = ({ onSuccess }) => {
    const config = useCreateChatbotWizardStore((s) => s.config);
    const { mutateAsync: generateChatbot, isPending: isGeneratingChatbot, error: generateChatbotError, data: generateChatbotData, } = useGenerateChatbotSpecs();
    console.log({
        error: generateChatbotError,
        data: generateChatbotData,
        pending: isGeneratingChatbot,
    });
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(StepHeader, { label: "Let's Create Your Chatbot", progress: 0.7 }), _jsx(Box, { marginY: 1, children: _jsx(FreeText, { question: "What kind of chatbot would you like to create?", placeholder: "e.g., I want a note taking chatbot...", onSubmit: (value) => {
                        void generateChatbot({ ...config, prompt: value }).then((result) => onSuccess(result, value));
                    } }) }), isGeneratingChatbot && (_jsxs(Box, { marginTop: 1, borderStyle: "round", borderColor: "yellow", padding: 1, children: [_jsx(Spinner, {}), _jsx(Text, { color: "yellow", children: " Generating your chatbot specifications..." })] })), generateChatbotError && (_jsxs(Box, { marginTop: 1, flexDirection: "column", borderStyle: "round", borderColor: "red", padding: 1, children: [_jsxs(Text, { color: "red", children: ["\u2717 Error: ", generateChatbotError.message] }), _jsx(Text, { italic: true, children: "Please try again with a different prompt." })] }))] }));
};
//# sourceMappingURL=GenerateSpecsStep.js.map