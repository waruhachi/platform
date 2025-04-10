import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sendMessage, subscribeToMessages } from '../application.js';
import { useEffect } from 'react';
const queryKeys = {
    applicationMessages: (id) => ['apps', id],
};
const useSubscribeToMessages = (params) => {
    const queryClient = useQueryClient();
    const { applicationId, traceId } = params ?? {};
    useEffect(() => {
        if (!applicationId || !traceId)
            return;
        const eventSource = subscribeToMessages({
            applicationId,
            traceId,
        }, {
            onNewMessage: (data) => {
                queryClient.setQueryData(queryKeys.applicationMessages(applicationId), (oldData) => {
                    if (!oldData)
                        return { messages: [data] };
                    return {
                        ...oldData,
                        messages: [...oldData.messages, data],
                    };
                });
            },
        });
        return () => {
            eventSource.close();
        };
    }, [queryClient, applicationId, traceId]);
};
const useSendMessage = () => {
    const [messageResult, setMessageResult] = useState(undefined);
    useSubscribeToMessages(messageResult);
    return useMutation({
        mutationFn: async (message) => {
            return sendMessage(message);
        },
        onSuccess: (result) => {
            setMessageResult(result);
        },
    });
};
export const useBuildApp = () => {
    const queryClient = useQueryClient();
    const { mutate: sendMessage, error: sendMessageError, isPending: sendMessagePending, isSuccess: sendMessageSuccess, status: sendMessageStatus, } = useSendMessage();
    const messageQuery = useQuery({
        queryKey: queryKeys.applicationMessages('123'),
        queryFn: () => queryClient.getQueryData(queryKeys.applicationMessages('123')),
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
//# sourceMappingURL=use-message.js.map