import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createSearchParams, MemoryRouter, Route, Routes, useNavigate, useParams, useSearchParams, } from 'react-router';
import queryString from 'query-string';
import { AppHomeScreen } from './app/app-home-screen.js';
import { CreateAppScreen } from './app/create-app-screen.js';
import { AppsListScreen } from './app/apps-list-screen.js';
import { AppDetails } from './app/app-details.js';
import { z, ZodObject, ZodType } from 'zod';
import { steps as appSteps, } from './app/steps/steps.js';
import { useCallback, useMemo } from 'react';
import { ShortcutHints } from './components/ui/shortcut-hints.js';
import { Banner } from './components/ui/banner.js';
const ROUTES_DEFINITIONS = [
    {
        path: '/',
        element: _jsx(AppHomeScreen, {}),
    },
    {
        path: '/app/create',
        element: _jsx(CreateAppScreen, {}),
        searchParams: {
            step: z
                .enum(Object.keys(appSteps))
                .default('environment'),
            appId: z.string().optional(),
        },
    },
    {
        path: '/apps',
        element: _jsx(AppsListScreen, {}),
    },
    {
        path: '/apps/:appId',
        element: _jsx(AppDetails, {}),
    },
];
export function useSafeNavigate() {
    const navigate = useNavigate();
    const safeNavigate = useCallback(({ path, params, searchParams, }) => {
        const pathWithParams = path.replace(/:(\w+)/g, 
        // @ts-expect-error - not worth it to fix
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (match, param) => params?.[param] ?? match);
        void navigate({
            pathname: pathWithParams,
            search: searchParams
                ? createSearchParams(searchParams).toString()
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
// just for type inference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useRouteParams(_route) {
    return useParams();
}
export function AppRouter() {
    return (_jsxs(MemoryRouter, { children: [_jsx(Banner, {}), _jsx(Routes, { children: ROUTES_DEFINITIONS.map((route) => (_jsx(Route, { path: route.path, element: route.element }, route.path))) }), _jsx(ShortcutHints, {})] }));
}
//# sourceMappingURL=routes.js.map