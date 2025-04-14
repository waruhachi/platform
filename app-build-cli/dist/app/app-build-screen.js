import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from 'ink';
import { BuildingBlock } from '../components/shared/building-block.js';
import { InfiniteFreeText } from '../components/shared/free-text.js';
import { Panel } from '../components/shared/panel.js';
import { TaskStatus, } from '../components/shared/task-status.js';
import { useDebug } from '../debug/debugger-panel.js';
import { useBuildApp } from './message/use-message.js';
export const AppBuildScreen = () => {
    const { createApplication, createApplicationData, createApplicationError, createApplicationStatus, streamingMessagesData, isStreamingMessages, } = useBuildApp();
    const { addLog } = useDebug();
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
    const renderBuildStages = () => {
        if (!streamingMessagesData?.messages.length)
            return null;
        const currentMessage = streamingMessagesData.messages.at(-1);
        const currentPhase = currentMessage?.phase;
        const isStreaming = currentMessage?.status === 'streaming';
        const hasInteractive = currentMessage?.parts.some((p) => p.type === 'interactive');
        // Group messages by consecutive phases
        const phaseGroups = streamingMessagesData.messages.reduce((groups, message, index) => {
            // Start a new group if:
            // 1. It's the first message
            // 2. Previous message had a different phase
            if (index === 0 ||
                streamingMessagesData.messages[index - 1]?.phase !== message.phase) {
                return [
                    ...groups,
                    {
                        phase: message.phase,
                        messages: [message],
                    },
                ];
            }
            // Add to the last group if consecutive
            const lastGroup = groups[groups.length - 1];
            if (lastGroup) {
                lastGroup.messages.push(message);
            }
            return groups;
        }, []);
        // Find the last group that has an interactive element
        const lastInteractiveGroupIndex = phaseGroups.reduce((lastIndex, group, currentIndex) => {
            const hasInteractiveInGroup = group.messages.some((m) => m.parts.some((p) => p.type === 'interactive'));
            return hasInteractiveInGroup ? currentIndex : lastIndex;
        }, -1);
        return (_jsx(Panel, { title: "Build in Progress", variant: "info", children: _jsx(Box, { flexDirection: "column", gap: 1, children: phaseGroups.map((group, groupIndex) => {
                    const isCurrentPhase = group.phase === currentPhase &&
                        groupIndex === phaseGroups.length - 1;
                    const isLastInteractiveGroup = groupIndex === lastInteractiveGroupIndex;
                    const status = isCurrentPhase && hasInteractive
                        ? 'running'
                        : isCurrentPhase && isStreaming
                            ? 'running'
                            : 'done';
                    const phaseMessages = group.messages
                        .flatMap((m) => m.parts.map((p, partIndex) => {
                        if ('content' in p) {
                            const nextPart = m.parts[partIndex + 1];
                            const shouldHighlight = isCurrentPhase &&
                                isLastInteractiveGroup &&
                                nextPart?.type === 'interactive';
                            const detail = {
                                text: p.content,
                                highlight: shouldHighlight,
                                icon: shouldHighlight ? '↳' : '⎿',
                            };
                            return detail;
                        }
                        return null;
                    }))
                        .filter((msg) => msg !== null);
                    addLog({
                        phase: group.phase,
                        phaseIndex: groupIndex,
                    });
                    return (_jsx(TaskStatus, { title: getPhaseTitle(group.phase), status: status, details: phaseMessages }, `${group.phase}-${groupIndex}`));
                }) }) }));
    };
    const renderInteractiveContent = () => {
        const currentMessage = streamingMessagesData?.messages.at(-1);
        if (!currentMessage)
            return null;
        const interactivePart = currentMessage.parts.find((p) => p.type === 'interactive');
        if (!interactivePart || !('elements' in interactivePart))
            return null;
        const firstElement = interactivePart.elements[0];
        if (!firstElement)
            return null;
        const options = interactivePart.elements
            .map((element) => {
            if (element.type === 'choice') {
                return element.options.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                }));
            }
            return {
                value: element.id,
                label: element.label,
            };
        })
            .flat();
        if (options.length === 0)
            return null;
        return (_jsx(BuildingBlock, { type: "select", question: "Select an option", status: createApplicationStatus, options: options, onSubmit: (value) => {
                const selectedOpt = options.find((opt) => opt.value === value);
                // add the user selected option to the client state messages
                streamingMessagesData?.messages.at(-1)?.parts?.push({
                    type: 'text',
                    content: `Selected: ${selectedOpt?.label || value}`,
                });
                createApplication({
                    message: value,
                    applicationId: createApplicationData?.applicationId,
                });
            } }));
    };
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(InfiniteFreeText, { successMessage: "Application build started...", question: "What would you like to build?", placeholder: "e.g., Add a new feature, modify behavior, or type 'exit' to finish", onSubmit: (text) => createApplication({ message: text }), status: createApplicationStatus, errorMessage: createApplicationError?.message, loadingText: "Applying changes...", retryMessage: "Please retry.", showPrompt: !streamingMessagesData }), streamingMessagesData && renderBuildStages(), streamingMessagesData && renderInteractiveContent(), _jsx(InfiniteFreeText, { successMessage: "The requested changes are being applied...", question: "How would you like to modify your application?", placeholder: "e.g., Add a new feature, modify behavior, or type 'exit' to finish", onSubmit: (text) => isStreamingMessages ? undefined : createApplication({ message: text }), status: createApplicationStatus, errorMessage: createApplicationError?.message, loadingText: "Applying changes...", retryMessage: "Please retry.", showPrompt: Boolean(streamingMessagesData &&
                    !isStreamingMessages &&
                    streamingMessagesData?.messages.at(-1)?.parts.at(-1)?.type !==
                        'interactive') })] }));
};
//# sourceMappingURL=app-build-screen.js.map