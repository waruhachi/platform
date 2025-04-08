import { create } from 'zustand';
export const useCreateAppWizardStore = create(((set) => ({
    config: {
        useStaging: false,
        prompt: '',
    },
    history: [],
    appMessageHistory: {
        specs: [],
        generation: [],
        iteration: [],
    },
    addMessageToAppHistory: (stage, message) => set((state) => ({
        appMessageHistory: {
            ...state.appMessageHistory,
            [stage]: [...state.appMessageHistory[stage], message],
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