import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InfiniteFreeText } from './components/shared/free-text.js';
import { Box, Text } from 'ink';
import { useBuildApp } from './app/message/use-message.js';
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

function MockedAgentAppScreen() {
  const { startBuilding, error, status, data } = useBuildApp();

  console.log({ data });

  return (
    <Box>
      <InfiniteFreeText
        successMessage="Changes applied successfully"
        question="How would you like to modify your application?"
        placeholder="e.g., Add a new feature, modify behavior, or type 'exit' to finish"
        onSubmit={(text: string) => startBuilding(text)}
        status={status}
        errorMessage={error?.message}
        loadingText="Applying changes..."
        retryMessage="Please retry."
      />
    </Box>
  );
}
