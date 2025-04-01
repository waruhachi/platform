import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const ProgressSteps = ({ steps, currentStep, isDeployed, }) => {
    return (_jsx(Box, { flexDirection: "column", marginY: 1, children: steps.map((step, index) => (_jsxs(Box, { marginY: 1, children: [_jsx(Box, { width: 2, children: index === currentStep && !isDeployed ? (_jsx(Text, { color: "yellow", children: "\u27D0" })) : index < currentStep || isDeployed ? (_jsx(Text, { color: "green", children: "\u2713" })) : (_jsx(Text, { color: "gray", children: "\u25CB" })) }), _jsxs(Box, { marginLeft: 1, flexDirection: "column", children: [_jsx(Text, { color: index === currentStep && !isDeployed
                                ? 'yellow'
                                : index < currentStep || isDeployed
                                    ? 'green'
                                    : 'gray', bold: index === currentStep && !isDeployed, children: step.message }), index === currentStep && !isDeployed && (_jsx(Box, { marginLeft: 2, marginTop: 1, children: _jsx(Text, { color: "gray", italic: true, children: step.detail }) }))] })] }, index))) }));
};
//# sourceMappingURL=progress-steps.js.map