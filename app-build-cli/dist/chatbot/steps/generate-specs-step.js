import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { FreeText } from '../../components/shared/free-text.js';
import { StepHeader } from '../../components/ui/step-header.js';
import { useGenerateChatbotSpecs } from '../use-chatbot.js';
import { useCreateChatbotWizardStore } from '../store.js';
import {} from '../chatbot.js';
export const GenerateSpecsStep = ({ onSuccess }) => {
    const config = useCreateChatbotWizardStore((s) => s.config);
    const { mutateAsync: generateChatbot, isPending: isGeneratingChatbot, error: generateChatbotError, } = useGenerateChatbotSpecs();
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(StepHeader, { label: "Let's Create Your Chatbot", progress: 0.7 }), _jsx(Box, { marginY: 1, children: _jsx(FreeText, { loading: isGeneratingChatbot, loadingText: "Generating your chatbot specifications...", question: "What kind of chatbot would you like to create?", placeholder: "e.g., I want a note taking chatbot...", onSubmit: (value) => {
                        void generateChatbot({ ...config, prompt: value }).then((result) => onSuccess(result, value));
                    } }) }), generateChatbotError && (_jsxs(Box, { marginTop: 1, flexDirection: "column", borderStyle: "round", borderColor: "red", padding: 1, children: [_jsxs(Text, { color: "red", children: ["\u2717 Error: ", generateChatbotError.message] }), _jsx(Text, { italic: true, children: "Please try again with a different prompt." })] }))] }));
};
//# sourceMappingURL=generate-specs-step.js.map