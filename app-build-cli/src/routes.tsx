import {
  createSearchParams,
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
  type URLSearchParamsInit,
} from 'react-router';
import queryString from 'query-string';

import { ChatbotsListScreen } from './chatbot/chatbots-list-screen.js';
import { CreateChatbotScreen } from './chatbot/create-chatbot-screen.js';
import { ChatbotHomeScreen } from './chatbot/chatbot-home-screen.js';

import { z, ZodObject, ZodType } from 'zod';
import { steps, type StepType } from './chatbot/steps/steps.js';
import { useCallback, useMemo } from 'react';
import { ShortcutHints } from './components/ui/shortcut-hints.js';

type RouterDefinition = typeof ROUTES_DEFINITIONS;
type RoutePath = RouterDefinition[number]['path'];

type RouteType = {
  path: string;
  element: React.ReactNode;
  searchParams?: Record<string, ZodType>;
};

type RouteDefinition<T extends RoutePath> = Extract<
  RouterDefinition[number],
  { path: T }
>;

type RouteWithSearchParams<T extends RoutePath> = Extract<
  RouteDefinition<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { searchParams: any }
>;

type SearchParamsObject<T extends RoutePath> = z.infer<
  ZodObject<RouteWithSearchParams<T>['searchParams']>
>;

const ROUTES_DEFINITIONS = [
  {
    path: '/' as const,
    element: <ChatbotHomeScreen />,
  },
  {
    path: '/chatbot/create' as const,
    element: <CreateChatbotScreen />,
    searchParams: {
      step: z
        .enum(Object.keys(steps) as [StepType, ...StepType[]])
        .default('runMode'),
      chatbotId: z.string().optional(),
    },
  },
  {
    path: '/chatbot/list' as const,
    element: <ChatbotsListScreen />,
  },
] satisfies Array<RouteType>;

export function useSafeNavigate() {
  const navigate = useNavigate();

  const safeNavigate = useCallback(
    <T extends RoutePath>(path: T, params?: SearchParamsObject<T>) => {
      void navigate({
        pathname: path,
        search: params
          ? createSearchParams(params as URLSearchParamsInit).toString()
          : undefined,
      });
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    void navigate(-1);
  }, [navigate]);

  return { safeNavigate, goBack };
}

export function getRouteSearchParams<T extends RoutePath>(
  routePath: T
): RouteWithSearchParams<T>['searchParams'] {
  const route = ROUTES_DEFINITIONS.find(
    (routeInfo): routeInfo is RouteWithSearchParams<T> =>
      routeInfo.path === routePath && 'searchParams' in routeInfo
  );

  if (!route) {
    throw new Error(
      'Invalid route or route does not have search params defined'
    );
  }

  return route.searchParams;
}

function cleanupSearchParams(searchParams: Record<string, unknown>) {
  return Object.entries(searchParams).reduce((acc, [key, value]) => {
    if (value === undefined || value === '') {
      return acc;
    }

    return { ...acc, [key]: value };
  }, {});
}

export function useSafeSearchParams<T extends RoutePath>(route: T) {
  const [URLsearchParams, setURLSearchParams] = useSearchParams();

  const safeSearchParams = useMemo(() => {
    const routeDefinitionSearchParams = getRouteSearchParams(route);

    return z
      .object(routeDefinitionSearchParams)
      .parse(Object.fromEntries(URLsearchParams));
  }, [route, URLsearchParams]);

  const setSafeSearchParams = useCallback(
    (
      searchParamsArg:
        | SearchParamsObject<T>
        | ((currentParams: SearchParamsObject<T>) => SearchParamsObject<T>)
    ) => {
      let searchParamsObj: SearchParamsObject<T>;
      if (typeof searchParamsArg === 'function') {
        searchParamsObj = searchParamsArg(safeSearchParams);
      } else {
        searchParamsObj = searchParamsArg;
      }

      const cleanSearchParams = cleanupSearchParams(searchParamsObj);
      setURLSearchParams(queryString.stringify(cleanSearchParams));
    },
    [safeSearchParams, setURLSearchParams]
  );

  return [safeSearchParams, setSafeSearchParams] as const;
}

export function AppRouter() {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<ChatbotHomeScreen />} />
        <Route path="chatbot/create" element={<CreateChatbotScreen />} />
        <Route path="chatbot/list" element={<ChatbotsListScreen />} />
      </Routes>
      <ShortcutHints />
    </MemoryRouter>
  );
}
