import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InfiniteFreeText } from './components/shared/free-text.js';
import { Box } from 'ink';
import { useBuildApp } from './app/message/use-message.js';
import { BuildingBlock } from './components/shared/building-block.js';
import { Panel } from './components/shared/panel.js';
import {
  TaskStatus,
  type TaskDetail,
} from './components/shared/task-status.js';

const queryClient = new QueryClient();

// refresh the app every 100ms
const useKeepAlive = () =>
  useEffect(() => {
    setInterval(() => {}, 100);
  }, []);

export const App = () => {
  useKeepAlive();

  return (
    <QueryClientProvider client={queryClient}>
      <MockedAgentAppScreen />
    </QueryClientProvider>
  );
};

export const MockedAgentAppScreen = () => {
  const {
    createApplication,
    createApplicationData,
    createApplicationError,
    createApplicationStatus,
    streamingMessagesData,
    isStreamingMessages,
  } = useBuildApp();

  const getPhaseTitle = (phase: string) => {
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
    if (!streamingMessagesData?.messages.length) return null;

    const currentMessage = streamingMessagesData.messages.at(-1);
    const currentPhase = currentMessage?.phase;
    const isStreaming = currentMessage?.status === 'streaming';
    const hasInteractive = currentMessage?.parts.some(
      (p) => p.type === 'interactive'
    );

    type PhaseGroup = {
      phase: string;
      messages: typeof streamingMessagesData.messages;
    };

    // Group messages by consecutive phases
    const phaseGroups = streamingMessagesData.messages.reduce(
      (groups: PhaseGroup[], message, index) => {
        // Start a new group if:
        // 1. It's the first message
        // 2. Previous message had a different phase
        if (
          index === 0 ||
          streamingMessagesData.messages[index - 1]?.phase !== message.phase
        ) {
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
      },
      []
    );

    // Find the last group that has an interactive element
    const lastInteractiveGroupIndex = phaseGroups.reduce(
      (lastIndex, group, currentIndex) => {
        const hasInteractiveInGroup = group.messages.some((m) =>
          m.parts.some((p) => p.type === 'interactive')
        );
        return hasInteractiveInGroup ? currentIndex : lastIndex;
      },
      -1
    );

    return (
      <Panel title="Build in Progress" variant="info">
        <Box flexDirection="column" gap={1}>
          {phaseGroups.map((group, groupIndex) => {
            const isCurrentPhase =
              group.phase === currentPhase &&
              groupIndex === phaseGroups.length - 1;
            const isLastInteractiveGroup =
              groupIndex === lastInteractiveGroupIndex;

            const status: TaskStatus =
              isCurrentPhase && hasInteractive
                ? 'running'
                : isCurrentPhase && isStreaming
                ? 'running'
                : 'done';

            const phaseMessages = group.messages
              .flatMap((m) =>
                m.parts.map((p, partIndex) => {
                  if ('content' in p) {
                    const nextPart = m.parts[partIndex + 1];
                    const shouldHighlight =
                      isCurrentPhase &&
                      isLastInteractiveGroup &&
                      nextPart?.type === 'interactive';

                    const detail: TaskDetail = {
                      text: p.content,
                      highlight: shouldHighlight,
                      icon: shouldHighlight ? '↳' : '⎿',
                    };
                    return detail;
                  }
                  return null;
                })
              )
              .filter((msg): msg is TaskDetail => msg !== null);

            return (
              <TaskStatus
                key={`${group.phase}-${groupIndex}`}
                title={getPhaseTitle(group.phase)}
                status={status}
                details={phaseMessages}
              />
            );
          })}
        </Box>
      </Panel>
    );
  };

  const renderInteractiveContent = () => {
    const currentMessage = streamingMessagesData?.messages.at(-1);
    if (!currentMessage) return null;

    const interactivePart = currentMessage.parts.find(
      (p) => p.type === 'interactive'
    );
    if (!interactivePart || !('elements' in interactivePart)) return null;

    const firstElement = interactivePart.elements[0];
    if (!firstElement) return null;

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

    if (options.length === 0) return null;

    return (
      <BuildingBlock
        type="select"
        question="Select an option"
        status={createApplicationStatus}
        options={options}
        onSubmit={(value: string) => {
          createApplication({
            message: value,
            applicationId: createApplicationData?.applicationId,
          });
        }}
      />
    );
  };

  return (
    <Box flexDirection="column">
      <InfiniteFreeText
        successMessage="Application build started..."
        question="What would you like to build?"
        placeholder="e.g., Add a new feature, modify behavior, or type 'exit' to finish"
        onSubmit={(text: string) => createApplication({ message: text })}
        status={createApplicationStatus}
        errorMessage={createApplicationError?.message}
        loadingText="Applying changes..."
        retryMessage="Please retry."
        showPrompt={!streamingMessagesData}
      />

      {streamingMessagesData && renderBuildStages()}
      {streamingMessagesData && renderInteractiveContent()}

      <InfiniteFreeText
        successMessage="The requested changes are being applied..."
        question="How would you like to modify your application?"
        placeholder="e.g., Add a new feature, modify behavior, or type 'exit' to finish"
        onSubmit={(text: string) =>
          isStreamingMessages ? undefined : createApplication({ message: text })
        }
        status={createApplicationStatus}
        errorMessage={createApplicationError?.message}
        loadingText="Applying changes..."
        retryMessage="Please retry."
        showPrompt={Boolean(
          streamingMessagesData &&
            !isStreamingMessages &&
            streamingMessagesData?.messages.at(-1)?.parts.at(-1)?.type !==
              'interactive'
        )}
      />
    </Box>
  );
};
