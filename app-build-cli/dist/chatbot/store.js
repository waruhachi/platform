import { create } from 'zustand';
export const useCreateChatbotWizardStore = create(((set) => ({
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
    addMessageToChatbotHistory: (stage, message) => set((state) => ({
        chatbotMessageHistory: {
            ...state.chatbotMessageHistory,
            [stage]: [...state.chatbotMessageHistory[stage], message],
        },
    })),
    setConfig: (configUpdate) => set((state) => ({
        config: { ...state.config, ...configUpdate },
    })),
    addToHistory: (question, answer) => set((state) => {
        const newHistory = state.history.filter((h) => h.question !== question);
        return {
            history: [...newHistory, { question, answer }],
        };
    }),
})));
//# sourceMappingURL=store.js.map