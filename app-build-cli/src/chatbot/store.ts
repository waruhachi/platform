import { create } from 'zustand';
import type { ChatBotConfig } from './steps/steps.js';
import type { StateCreator } from 'zustand';

type HistoryEntry = {
  question: string;
  answer: string;
};

type GenerationStage = 'specs' | 'generation' | 'iteration';

interface WizardState {
  config: ChatBotConfig;
  history: HistoryEntry[];
  chatbotMessageHistory: Record<GenerationStage, string[]>;

  // Actions
  setConfig: (config: Partial<ChatBotConfig>) => void;
  addToHistory: (question: string, answer: string) => void;
  addMessageToChatbotHistory: (stage: GenerationStage, message: string) => void;
}

export const useCreateChatbotWizardStore = create<WizardState>(((set) => ({
  config: {
    telegramBotToken: '',
    useStaging: false,
    runMode: 'telegram',
    prompt: '',
  },
  history: [],
  chatbotMessageHistory: {
    specs: [],
    generation: [],
    iteration: [],
  },

  addMessageToChatbotHistory: (stage: GenerationStage, message: string) =>
    set((state) => ({
      chatbotMessageHistory: {
        ...state.chatbotMessageHistory,
        [stage]: [...state.chatbotMessageHistory[stage], message],
      },
    })),

  setConfig: (configUpdate: Partial<ChatBotConfig>) =>
    set((state) => ({
      config: { ...state.config, ...configUpdate },
    })),

  addToHistory: (question: string, answer: string) =>
    set((state) => {
      const newHistory = state.history.filter((h) => h.question !== question);

      return {
        history: [...newHistory, { question, answer }],
      };
    }),
})) as StateCreator<WizardState>);
