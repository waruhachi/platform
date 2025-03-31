import { create } from 'zustand';
import type { ChatBotConfig, StepType } from './steps/steps.js';
import type { StateCreator } from 'zustand';

type HistoryEntry = {
  question: string;
  answer: string;
  previousStep: StepType;
};

type GenerationStage = 'specs' | 'generation' | 'iteration';

interface WizardState {
  step: StepType;
  config: ChatBotConfig;
  history: HistoryEntry[];
  canGoBack: boolean;
  currentChatbotId: string | undefined;
  chatbotMessageHistory: Record<GenerationStage, string[]>;

  // Actions
  setStep: (step: StepType) => void;
  setConfig: (config: Partial<ChatBotConfig>) => void;
  addToHistory: (question: string, answer: string) => void;
  goBack: () => void;
  setCanGoBack: (canGoBack: boolean) => void;
  setCurrentChatbotId: (chatbotId: string) => void;
  addMessageToChatbotHistory: (stage: GenerationStage, message: string) => void;
}

export const useCreateChatbotWizardStore = create<WizardState>(((set) => ({
  step: 'runMode',
  config: {
    telegramBotToken: '',
    useStaging: false,
    runMode: 'telegram',
    prompt: '',
  },
  history: [],
  canGoBack: true,
  currentChatbotId: undefined,
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

  setStep: (step: StepType) => set({ step }),

  setConfig: (configUpdate: Partial<ChatBotConfig>) =>
    set((state) => ({
      config: { ...state.config, ...configUpdate },
    })),

  addToHistory: (question: string, answer: string) =>
    set((state) => ({
      history: [
        ...state.history,
        { question, answer, previousStep: state.step },
      ],
    })),

  setCanGoBack: (canGoBack: boolean) => set({ canGoBack: canGoBack }),
  setCurrentChatbotId: (chatbotId: string) =>
    set({ currentChatbotId: chatbotId }),

  goBack: () =>
    set((state) => {
      const lastEntry = state.history[state.history.length - 1];
      if (!lastEntry) return state;

      return {
        step: lastEntry.previousStep,
        history: state.history.slice(0, -1),
      };
    }),
})) as StateCreator<WizardState>);
