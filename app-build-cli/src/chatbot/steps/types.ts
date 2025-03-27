import { type ChatbotGenerationResult } from '../chatbot.js';

export type ChatBotConfig = {
  telegramBotToken: string;
  useStaging: boolean;
  runMode: 'telegram' | 'http-server';
  prompt: string;
};

export type StepType =
  | 'runMode'
  | 'token'
  | 'environment'
  | 'generateChatbotSpecs'
  | 'generateChatbot'
  | 'successGeneration';

export type StepProps = {
  config: ChatBotConfig;
  setConfig: (
    config: ChatBotConfig | ((prev: ChatBotConfig) => ChatBotConfig)
  ) => void;
  setStep: (step: StepType) => void;
  steps: Record<string, any>;
  step: StepType;
};

export type GenerateStepProps = {
  config: ChatBotConfig;
  chatbot: ChatbotGenerationResult | null;
  onSuccess: (result: ChatbotGenerationResult, prompt: string) => void;
};
