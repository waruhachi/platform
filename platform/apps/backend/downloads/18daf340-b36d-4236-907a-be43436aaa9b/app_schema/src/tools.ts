import { z } from 'zod';
import * as schema from './common/schema';
import * as search from './handlers/search';
import * as retrieveWebPage from './handlers/retrieveWebPage';
import * as refineSearch from './handlers/refineSearch';
import * as web_search from './handlers/web_search';


interface ToolHandler<argSchema extends z.ZodObject<any>> {
    name: string;
    description: string;
    handler: (options: z.infer<argSchema>) => any;
    inputSchema: argSchema;
}

export const handlers: ToolHandler<any>[] = [
    {
        name: 'search',
        description: `Perform a web search using the user's query`,
        handler: search.handle,
        inputSchema: schema.searchQuerySchema,
    },
    {
        name: 'retrieveWebPage',
        description: `Retrieve and display content from a specific URL`,
        handler: retrieveWebPage.handle,
        inputSchema: schema.webPageRequestSchema,
    },
    {
        name: 'refineSearch',
        description: `Refine search results based on additional criteria`,
        handler: refineSearch.handle,
        inputSchema: schema.refineSearchOptionsSchema,
    },
    {
        name: 'web_search',
        description: `search the web for information`,
        handler: web_search.handle,
        inputSchema: web_search.webSearchParamsSchema,
    },
];