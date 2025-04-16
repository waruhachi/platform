import { useMutation, useQuery, useQueryClient, } from '@tanstack/react-query';
import { generateApp, generateAppSpec, getApp, listApps, } from './application.js';
import { useSafeSearchParams } from '../routes.js';
export const applicationQueryKeys = {
    app: (appId) => ['apps', appId],
    apps: ['apps'],
};
export const useApplication = (appId, options) => {
    return useQuery({
        queryKey: applicationQueryKeys.app(appId ?? ''),
        queryFn: () => getApp(appId),
        enabled: !!appId,
        ...options,
    });
};
export const useListApps = () => {
    return useQuery({
        queryKey: applicationQueryKeys.apps,
        queryFn: listApps,
    });
};
export const useGenerateAppSpecs = (options = {}) => {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSafeSearchParams('/app/create');
    return useMutation({
        mutationFn: (params) => {
            return generateAppSpec(params);
        },
        onSuccess: (data, params) => {
            setSearchParams({
                ...searchParams,
                appId: data.appId,
                step: 'generateApp',
            });
            void queryClient.invalidateQueries({
                queryKey: applicationQueryKeys.app(data.appId),
            });
            options.onSuccess?.(data, params);
        },
        onError: (error) => {
            options.onError?.(error);
        },
    });
};
export const useGenerateApp = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params) => {
            return generateApp(params);
        },
        onSuccess: (data) => {
            void queryClient.invalidateQueries({
                queryKey: applicationQueryKeys.app(data.appId),
            });
            options.onSuccess?.(data);
        },
    });
};
//# sourceMappingURL=use-application.js.map