import { Box, Text } from 'ink';
import { useApplication, useGenerateApp } from './use-application.js';
import { useRouteParams } from '../routes.js';
import { getStatusEmoji, getStatusColor } from './apps-list-screen.js';
import { InfiniteFreeText } from '../components/shared/free-text.js';
import { Panel } from '../components/shared/panel.js';

export function AppDetails() {
  const { appId } = useRouteParams('/apps/:appId');
  const { data: app, isLoading, error } = useApplication(appId);
  const {
    mutate: generateAppIteration,
    status: generateAppIterationStatus,
    error: generateAppIterationError,
  } = useGenerateApp();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text color="red">Error: {error.message}</Text>;
  }

  if (!app) {
    return <Text>Application not found</Text>;
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Panel title="📋 Application Details" variant="info">
        <Box flexDirection="column" gap={1}>
          <Text>
            <Text color="gray">Name: </Text>
            <Text bold>{app.name}</Text>
          </Text>

          <Text>
            <Text color="gray">Status: </Text>
            {getStatusEmoji(app.deployStatus)}{' '}
            <Text color={getStatusColor(app.deployStatus)} bold>
              {app.deployStatus}
            </Text>
          </Text>

          <Text>
            <Text color="gray">Mode: </Text>
            <Text bold>🌐 HTTP Server</Text>
          </Text>

          {app.recompileInProgress && (
            <Box marginTop={1}>
              <Text color="yellow">⚡️ Application is recompiling...</Text>
            </Box>
          )}
        </Box>
      </Panel>

      <Box marginTop={2}>
        <InfiniteFreeText
          successMessage="Changes applied successfully"
          question="How would you like to modify your app?"
          placeholder="e.g., Add a new feature, modify behavior, or type 'exit' to finish"
          onSubmit={(text: string) =>
            generateAppIteration({
              prompt: text,
              ...app,
              useStaging: false,
            })
          }
          status={generateAppIterationStatus}
          errorMessage={generateAppIterationError?.message}
          loadingText="Applying changes..."
          retryMessage="Please retry."
        />
      </Box>
    </Box>
  );
}
