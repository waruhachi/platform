import { useApp } from 'ink';
import { TelegramBotFlow } from './chatbot/create-chatbot.js';

export const App = () => {
  const app = useApp();
  return <TelegramBotFlow />;
};
