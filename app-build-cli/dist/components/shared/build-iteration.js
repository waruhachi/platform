import { jsx as _jsx } from "react/jsx-runtime";
import { Box } from 'ink';
import { Panel } from './panel.js';
import { TaskStatus } from './task-status.js';
const getPhaseTitle = (phase) => {
    switch (phase) {
        case 'typespec':
            return 'Generating TypeSpec model';
        case 'handlers':
            return 'Creating event handlers';
        case 'running-tests':
            return 'Running tests';
        case 'frontend':
            return 'Building frontend components';
        default:
            return phase;
    }
};
export const BuildIteration = ({ messages, iterationNumber, }) => {
    if (!messages.length)
        return null;
    // Group messages by phase
    const messagesByPhase = messages.reduce((acc, message) => {
        if (!acc[message.phase]) {
            acc[message.phase] = [];
        }
        acc[message.phase].push(message);
        return acc;
    }, {});
    // Get unique phases in order of appearance
    const phases = Array.from(new Set(messages.map((m) => m.phase)));
    const currentMessage = messages.at(-1);
    const currentPhase = currentMessage?.phase || '';
    const isStreaming = currentMessage?.status === 'streaming';
    const hasInteractive = currentMessage?.parts.some((p) => p.type === 'interactive');
    return (_jsx(Panel, { title: `Build Iteration ${iterationNumber}`, variant: "info", children: _jsx(Box, { flexDirection: "column", gap: 1, children: phases.map((phase) => {
                const phaseMessages = messagesByPhase[phase] || [];
                const isCurrentPhase = phase === currentPhase;
                const status = isCurrentPhase && hasInteractive
                    ? 'running'
                    : isCurrentPhase && isStreaming
                        ? 'running'
                        : 'done';
                const phaseDetails = phaseMessages
                    .flatMap((message) => message.parts.map((part, partIndex) => {
                    if ('content' in part && part.content) {
                        // Only highlight the text content that comes right before an interactive part
                        const nextPart = message.parts[partIndex + 1];
                        const isQuestion = isCurrentPhase &&
                            hasInteractive &&
                            nextPart?.type === 'interactive';
                        const detail = {
                            text: part.content,
                            highlight: isQuestion,
                            icon: isQuestion ? '↳' : '⎿',
                        };
                        return detail;
                    }
                    return null;
                }))
                    .filter((msg) => msg !== null);
                return (_jsx(TaskStatus, { title: getPhaseTitle(phase), status: status, details: phaseDetails }, phase));
            }) }) }));
};
//# sourceMappingURL=build-iteration.js.map