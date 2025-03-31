import { useMutation, useQuery, useQueryClient, } from '@tanstack/react-query';
import { generateChatbot, generateChatbotSpec, getChatbot } from './chatbot.js';
import { useCreateChatbotWizardStore } from './store.js';
const queryKeys = {
    chatbot: (chatbotId) => ['chatbot', chatbotId],
};
export const useChatbot = (chatbotId, options) => {
    return useQuery({
        queryKey: queryKeys.chatbot(chatbotId ?? ''),
        queryFn: () => getChatbot(chatbotId).then((res) => {
            console.log({ chatbotPoll: res });
            return res;
        }),
        enabled: !!chatbotId,
        ...options,
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