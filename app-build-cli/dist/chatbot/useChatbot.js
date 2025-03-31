import { useMutation, useQuery, useQueryClient, } from '@tanstack/react-query';
import { generateChatbot, generateChatbotSpec, getChatbot, listChatBots, } from './chatbot.js';
import { useCreateChatbotWizardStore } from './store.js';
const queryKeys = {
    chatbot: (chatbotId) => ['chatbots', chatbotId],
    chatbots: ['chatbots'],
};
export const useChatbot = (chatbotId, options) => {
    return useQuery({
        queryKey: queryKeys.chatbot(chatbotId ?? ''),
        queryFn: () => getChatbot(chatbotId),
        enabled: !!chatbotId,
        ...options,
    });
};
export const useListChatBots = () => {
    return useQuery({
        queryKey: queryKeys.chatbots,
        queryFn: () => listChatBots(),
    });
};
export const useGenerateChatbotSpecs = () => {
    const queryClient = useQueryClient();
    const setCanGoBack = useCreateChatbotWizardStore((state) => state.setCanGoBack);
    const setCurrentChatbotId = useCreateChatbotWizardStore((state) => state.setCurrentChatbotId);
    return useMutation({
        mutationFn: (params) => {
            // Disable going back to the previous step
            setCanGoBack(false);
            return generateChatbotSpec(params);
        },
        onSuccess: (data) => {
            setCurrentChatbotId(data.chatbotId);
            void queryClient.invalidateQueries({
                queryKey: queryKeys.chatbot(data.chatbotId),
            });
        },
    });
};
export const useGenerateChatbot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params) => {
            return generateChatbot(params);
        },
        onSuccess: (data) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.chatbot(data.chatbotId),
            });
        },
    });
};
//# sourceMappingURL=useChatbot.js.map