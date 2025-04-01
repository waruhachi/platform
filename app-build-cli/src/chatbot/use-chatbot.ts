import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  generateChatbot,
  generateChatbotSpec,
  getChatbot,
  listChatBots,
} from './chatbot.js';
import type {
  ChatbotGenerationParams,
  ChatBotSpecsGenerationParams,
} from './chatbot.js';
import { useSafeSearchParams } from '../routes.js';

const queryKeys = {
  chatbot: (chatbotId: string) => ['chatbots', chatbotId],
  chatbots: ['chatbots'],
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

export const useListChatBots = () => {
  return useQuery({
    queryKey: queryKeys.chatbots,
    queryFn: () => listChatBots(),
  });
};

export const useGenerateChatbotSpecs = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] =
    useSafeSearchParams('/chatbot/create');

  return useMutation({
    mutationFn: (params: ChatBotSpecsGenerationParams) => {
      return generateChatbotSpec(params);
    },
    onSuccess: (data) => {
      setSearchParams({ ...searchParams, chatbotId: data.chatbotId });
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
