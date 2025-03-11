import { z } from 'zod';
import * as schema from './common/schema';
import * as searchWeb from './handlers/searchWeb';
import * as getWebPage from './handlers/getWebPage';
import * as summarizeSearchResults from './handlers/summarizeSearchResults';


interface ToolHandler<argSchema extends z.ZodObject<any>> {
    name: string;
    description: string;
    handler: (options: z.infer<argSchema>) => any;
    inputSchema: argSchema;
}

export const handlers: ToolHandler<any>[] = [
    {
        name: 'searchWeb',
        description: ``,
        handler: searchWeb.handle,
        inputSchema: schema.webSearchOptionsSchema,
    },
    {
        name: 'getWebPage',
        description: ``,
        handler: getWebPage.handle,
        inputSchema: schema.webPageOptionsSchema,
    },
    {
        name: 'summarizeSearchResults',
        description: ``,
        handler: summarizeSearchResults.handle,
        inputSchema: schema.summarizeOptionsSchema,
    },
];