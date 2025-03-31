import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { generateChatbot, generateChatbotSpec, getChatbot } from './chatbot.js';
import type {
  ChatbotGenerationParams,
  ChatBotSpecsGenerationParams,
} from './chatbot.js';
import { useCreateChatbotWizardStore } from './store.js';

const queryKeys = {
  chatbot: (chatbotId: string) => ['chatbot', chatbotId],
} as const;

export const useChatbot = (
  chatbotId: string | undefined,
  options?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getChatbot>>>>
) => {
  return useQuery({
    queryKey: queryKeys.chatbot(chatbotId ?? ''),
    queryFn: () => getChatbot(chatbotId!),
    enabled: !!chatbotId,
    ...options,
  });
};

export const useGenerateChatbotSpecs = () => {
  const queryClient = useQueryClient();
  const setCanGoBack = useCreateChatbotWizardStore(
    (state) => state.setCanGoBack
  );
  const setCurrentChatbotId = useCreateChatbotWizardStore(
    (state) => state.setCurrentChatbotId
  );

  return useMutation({
    mutationFn: (params: ChatBotSpecsGenerationParams) => {
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
    mutationFn: (params: ChatbotGenerationParams) => {
      return generateChatbot(params);
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chatbot(data.chatbotId),
      });
    },
  });
};
