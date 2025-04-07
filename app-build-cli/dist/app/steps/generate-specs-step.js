import { jsx as _jsx } from "react/jsx-runtime";
import { Box } from 'ink';
import { InfiniteFreeText } from '../../components/shared/free-text.js';
import { useGenerateAppSpecs } from '../use-application.js';
import { useCreateAppWizardStore } from '../store.js';
import {} from '../application.js';
export const GenerateSpecsStep = ({ onSuccess }) => {
    const config = useCreateAppWizardStore((s) => s.config);
    const { status: generateAppStatus, mutate: generateApp, error: generateAppError, } = useGenerateAppSpecs({
        onSuccess: (result, params) => {
            onSuccess(result, params.prompt);
        },
    });
    return (_jsx(Box, { marginY: 1, children: _jsx(InfiniteFreeText, { successMessage: "Application specifications generated successfully", status: generateAppStatus, errorMessage: generateAppError?.message, retryMessage: "Please retry with a different prompt.", loadingText: "Generating your application specifications...", question: "What kind of app would you like to create?", placeholder: "e.g., I want a note taking app...", onSubmit: (value) => {
                generateApp({ ...config, prompt: value });
            } }) }));
};
//# sourceMappingURL=generate-specs-step.js.map