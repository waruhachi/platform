import { create } from 'zustand';
export const useCreateChatbotWizardStore = create(((set) => ({
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
    addMessageToChatbotHistory: (stage, message) => set((state) => ({
        chatbotMessageHistory: {
            ...state.chatbotMessageHistory,
            [stage]: [...state.chatbotMessageHistory[stage], message],
        },
    })),
    setStep: (step) => set({ step }),
    setConfig: (configUpdate) => set((state) => ({
        config: { ...state.config, ...configUpdate },
    })),
    addToHistory: (question, answer) => set((state) => ({
        history: [
            ...state.history,
            { question, answer, previousStep: state.step },
        ],
    })),
    setCanGoBack: (canGoBack) => set({ canGoBack: canGoBack }),
    setCurrentChatbotId: (chatbotId) => set({ currentChatbotId: chatbotId }),
    goBack: () => set((state) => {
        const lastEntry = state.history[state.history.length - 1];
        if (!lastEntry)
            return state;
        return {
            step: lastEntry.previousStep,
            history: state.history.slice(0, -1),
        };
    }),
})));
//# sourceMappingURL=store.js.map