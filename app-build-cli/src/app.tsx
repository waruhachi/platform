import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './routes.js';

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
      <AppRouter />
    </QueryClientProvider>
  );
};
