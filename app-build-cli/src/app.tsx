import { useEffect } from 'react';
import { TelegramBotFlow } from './chatbot/create-chatbot.js';

// refresh the app every 100ms
const useKeepAlive = () =>
  useEffect(() => {
    setInterval(() => {}, 100);
  }, []);

export const App = () => {
  useKeepAlive();
  return <TelegramBotFlow />;
};
