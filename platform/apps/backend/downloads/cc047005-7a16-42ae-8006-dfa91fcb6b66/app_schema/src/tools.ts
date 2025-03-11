import { z } from 'zod';
import * as schema from './common/schema';
import * as getMigraineHistory from './handlers/getMigraineHistory';
import * as logMigraine from './handlers/logMigraine';
import * as predictMigraine from './handlers/predictMigraine';
import * as logTrigger from './handlers/logTrigger';
import * as analyzeTriggers from './handlers/analyzeTriggers';


interface ToolHandler<argSchema extends z.ZodObject<any>> {
    name: string;
    description: string;
    handler: (options: z.infer<argSchema>) => any;
    inputSchema: argSchema;
}

export const handlers: ToolHandler<any>[] = [
    {
        name: 'getMigraineHistory',
        description: `Retrieve migraine history for a specified time period`,
        handler: getMigraineHistory.handle,
        inputSchema: schema.historyRequestSchema,
    },
    {
        name: 'logMigraine',
        description: `Record details about a migraine episode`,
        handler: logMigraine.handle,
        inputSchema: schema.logMigraineOptionsSchema,
    },
    {
        name: 'predictMigraine',
        description: `Predict likelihood of migraine based on triggers and patterns`,
        handler: predictMigraine.handle,
        inputSchema: schema.predictionRequestSchema,
    },
    {
        name: 'logTrigger',
        description: `Record potential migraine triggers`,
        handler: logTrigger.handle,
        inputSchema: schema.logTriggerOptionsSchema,
    },
    {
        name: 'analyzeTriggers',
        description: `Analyze correlation between triggers and migraine occurrences`,
        handler: analyzeTriggers.handle,
        inputSchema: schema.analysisRequestSchema,
    },
];