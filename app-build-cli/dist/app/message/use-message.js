import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sendMessage, subscribeToMessages } from '../application.js';
import { useEffect } from 'react';
const queryKeys = {
    fullstackAppsMessages: (id) => ['fullstack-apps', id],
};
const useSubscribeToMessages = (applicationId) => {
    const queryClient = useQueryClient();
    useEffect(() => {
        if (!applicationId)
            return;
        const eventSource = subscribeToMessages(applicationId, {
            onNewMessage: (data) => {
                queryClient.setQueryData(queryKeys.fullstackAppsMessages(applicationId), (oldData) => {
                    if (!oldData)
                        return { messages: [data] };
                    return {
                        ...oldData,
                        messages: [...oldData.messages, data],
                    };
                });
                console.log('New message:', data);
            },
        });
        return () => {
            eventSource.close();
        };
    }, [queryClient, applicationId]);
};
const useSendMessage = () => {
    const [applicationId, setApplicationId] = useState(undefined);
    useSubscribeToMessages(applicationId);
    return useMutation({
        mutationFn: async (message) => {
            return sendMessage(message);
        },
        onSuccess: (applicationId) => {
            setApplicationId(applicationId);
        },
    });
};
export const useBuildApp = () => {
    const queryClient = useQueryClient();
    const { mutate: sendMessage, error: sendMessageError, isPending: sendMessagePending, isSuccess: sendMessageSuccess, status: sendMessageStatus, } = useSendMessage();
    const messageQuery = useQuery({
        queryKey: queryKeys.fullstackAppsMessages('123'),
        queryFn: () => queryClient.getQueryData(queryKeys.fullstackAppsMessages('123')),
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