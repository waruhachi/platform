import { z } from 'zod';
import * as schema from './common/schema';
import * as saveResult from './handlers/saveResult';
import * as performSearch from './handlers/performSearch';
import * as getResultDetails from './handlers/getResultDetails';
import * as filterResults from './handlers/filterResults';


interface ToolHandler<argSchema extends z.ZodObject<any>> {
    name: string;
    description: string;
    handler: (options: z.infer<argSchema>) => any;
    inputSchema: argSchema;
}

export const handlers: ToolHandler<any>[] = [
    {
        name: 'saveResult',
        description: ``,
        handler: saveResult.handle,
        inputSchema: schema.saveResultRequestSchema,
    },
    {
        name: 'performSearch',
        description: ``,
        handler: performSearch.handle,
        inputSchema: schema.searchQuerySchema,
    },
    {
        name: 'getResultDetails',
        description: ``,
        handler: getResultDetails.handle,
        inputSchema: schema.resultDetailsRequestSchema,
    },
    {
        name: 'filterResults',
        description: ``,
        handler: filterResults.handle,
        inputSchema: schema.filterOptionsSchema,
    },
];