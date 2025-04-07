import { useMutation, useQuery, useQueryClient, } from '@tanstack/react-query';
import { generateChatbot, generateChatbotSpec, getChatbot, listChatBots, } from './chatbot.js';
import { useSafeSearchParams } from '../routes.js';
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
        queryFn: listChatBots,
    });
};
export const useGenerateChatbotSpecs = (options = {}) => {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSafeSearchParams('/chatbot/create');
    return useMutation({
        mutationFn: (params) => {
            return generateChatbotSpec(params);
        },
        onSuccess: (data, params) => {
            setSearchParams({ ...searchParams, chatbotId: data.chatbotId });
            void queryClient.invalidateQueries({
                queryKey: queryKeys.chatbot(data.chatbotId),
            });
            options.onSuccess?.(data, params);
        },
        onError: (error) => {
            options.onError?.(error);
        },
    });
};
export const useGenerateChatbot = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params) => {
            return generateChatbot(params);
        },
        onSuccess: (data) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.chatbot(data.chatbotId),
            });
            options.onSuccess?.(data);
        },
    });
};
//# sourceMappingURL=use-chatbot.js.map