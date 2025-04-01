import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createSearchParams, MemoryRouter, Route, Routes, useNavigate, useSearchParams, } from 'react-router';
import queryString from 'query-string';
import { ChatbotsListScreen } from './chatbot/chatbots-list-screen.js';
import { CreateChatbotScreen } from './chatbot/create-chatbot-screen.js';
import { ChatbotHomeScreen } from './chatbot/chatbot-home-screen.js';
import { z, ZodObject, ZodType } from 'zod';
import { steps } from './chatbot/steps/steps.js';
import { useCallback, useMemo } from 'react';
import { ShortcutHints } from './components/ui/shortcut-hints.js';
const ROUTES_DEFINITIONS = [
    {
        path: '/',
        element: _jsx(ChatbotHomeScreen, {}),
    },
    {
        path: '/chatbot/create',
        element: _jsx(CreateChatbotScreen, {}),
        searchParams: {
            step: z
                .enum(Object.keys(steps))
                .default('runMode'),
            chatbotId: z.string().optional(),
        },
    },
    {
        path: '/chatbot/list',
        element: _jsx(ChatbotsListScreen, {}),
    },
];
export function useSafeNavigate() {
    const navigate = useNavigate();
    const safeNavigate = useCallback((path, params) => {
        void navigate({
            pathname: path,
            search: params
                ? createSearchParams(params).toString()
                : undefined,
        });
    }, [navigate]);
    const goBack = useCallback(() => {
        void navigate(-1);
    }, [navigate]);
    return { safeNavigate, goBack };
}
export function getRouteSearchParams(routePath) {
    const route = ROUTES_DEFINITIONS.find((routeInfo) => routeInfo.path === routePath && 'searchParams' in routeInfo);
    if (!route) {
        throw new Error('Invalid route or route does not have search params defined');
    }
    return route.searchParams;
}
function cleanupSearchParams(searchParams) {
    return Object.entries(searchParams).reduce((acc, [key, value]) => {
        if (value === undefined || value === '') {
            return acc;
        }
        return { ...acc, [key]: value };
    }, {});
}
export function useSafeSearchParams(route) {
    const [URLsearchParams, setURLSearchParams] = useSearchParams();
    const safeSearchParams = useMemo(() => {
        const routeDefinitionSearchParams = getRouteSearchParams(route);
        return z
            .object(routeDefinitionSearchParams)
            .parse(Object.fromEntries(URLsearchParams));
    }, [route, URLsearchParams]);
    const setSafeSearchParams = useCallback((searchParamsArg) => {
        let searchParamsObj;
        if (typeof searchParamsArg === 'function') {
            searchParamsObj = searchParamsArg(safeSearchParams);
        }
        else {
            searchParamsObj = searchParamsArg;
        }
        const cleanSearchParams = cleanupSearchParams(searchParamsObj);
        setURLSearchParams(queryString.stringify(cleanSearchParams));
    }, [safeSearchParams, setURLSearchParams]);
    return [safeSearchParams, setSafeSearchParams];
}
export function AppRouter() {
    return (_jsxs(MemoryRouter, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(ChatbotHomeScreen, {}) }), _jsx(Route, { path: "chatbot/create", element: _jsx(CreateChatbotScreen, {}) }), _jsx(Route, { path: "chatbot/list", element: _jsx(ChatbotsListScreen, {}) })] }), _jsx(ShortcutHints, {})] }));
}
//# sourceMappingURL=routes.js.map