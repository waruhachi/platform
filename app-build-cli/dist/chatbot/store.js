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
    addToHistory: (question, answer) => set((state) => {
        const newHistory = state.history.filter((h) => h.question !== question);
        return {
            history: [
                ...newHistory,
                { question, answer, previousStep: state.step },
            ],
        };
    }),
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
const useNavigationStore = create(((set) => ({
    history: [undefined],
    navigate: (newState) => set((state) => {
        return {
            history: [...state.history, newState],
        };
    }),
    goBack: () => set((state) => {
        const newHistory = state.history.slice(0, -1);
        return {
            history: newHistory,
        };
    }),
})));
export function useNavigation() {
    const history = useNavigationStore((s) => s.history);
    const navigate = useNavigationStore((s) => s.navigate);
    const goBack = useNavigationStore((s) => s.goBack);
    const currentNavigationState = useNavigationStore((s) => s.history.at(-1));
    return { history, navigate, goBack, currentNavigationState };
}
//# sourceMappingURL=store.js.map