import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sendMessage, subscribeToMessages } from '../application.js';
import { useEffect } from 'react';

type ChoiceElement = {
  type: 'choice';
  questionId: string;
  options: {
    value: string;
    label: string;
  };
};

type ActionElement = {
  type: 'action';
  id: string;
  label: string;
};

type MessagePart =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'code';
      language: string;
      content: string;
    }
  | {
      type: 'interactive';
      elements: (ChoiceElement | ActionElement)[];
    };

type Message = {
  type: 'message';
  parts: MessagePart[];
  applicationId: string;
  status: 'streaming' | 'success' | 'error';
  traceId: string;
};

const queryKeys = {
  applicationMessages: (id: string) => ['apps', id],
};

const useSubscribeToMessages = (
  params:
    | {
        applicationId: string;
        traceId: string;
      }
    | undefined
) => {
  const queryClient = useQueryClient();
  const { applicationId, traceId } = params ?? {};

  useEffect(() => {
    if (!applicationId || !traceId) return;

    const eventSource = subscribeToMessages(
      {
        applicationId,
        traceId,
      },
      {
        onNewMessage: (data) => {
          queryClient.setQueryData(
            queryKeys.applicationMessages(applicationId),
            (oldData: any) => {
              if (!oldData) return { messages: [data] };

              return {
                ...oldData,
                messages: [...oldData.messages, data],
              };
            }
          );
        },
      }
    );

    return () => {
      eventSource.close();
    };
  }, [queryClient, applicationId, traceId]);
};

const useSendMessage = () => {
  const [messageResult, setMessageResult] = useState<
    | {
        applicationId: string;
        traceId: string;
      }
    | undefined
  >(undefined);
  useSubscribeToMessages(messageResult);

  return useMutation({
    mutationFn: async (message: string) => {
      return sendMessage(message);
    },
    onSuccess: (result) => {
      setMessageResult(result);
    },
  });
};

export const useBuildApp = () => {
  const queryClient = useQueryClient();
  const {
    mutate: sendMessage,
    error: sendMessageError,
    isPending: sendMessagePending,
    isSuccess: sendMessageSuccess,
    status: sendMessageStatus,
  } = useSendMessage();

  const messageQuery = useQuery({
    queryKey: queryKeys.applicationMessages('123'),
    queryFn: () =>
      queryClient.getQueryData<Message[]>(queryKeys.applicationMessages('123')),
    // this only reads the cached data
    enabled: false,
  });

  return {
    startBuilding: sendMessage,
    data: messageQuery.data,
    error: sendMessageError,
    isPending: sendMessagePending,
    isSuccess: sendMessageSuccess,
    status: sendMessageStatus,
  };
};
