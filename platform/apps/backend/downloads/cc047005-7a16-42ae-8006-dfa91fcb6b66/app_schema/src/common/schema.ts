import { z } from 'zod';

export const utcDateTimeSchema = z.coerce.date();

export const migraineEventSchema = z.object({
  startTime: utcDateTimeSchema,
  endTime: utcDateTimeSchema.optional(),
  intensity: z.number().int().min(1).max(10),
  symptoms: z.array(z.string()),
  medications: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type MigraineEvent = z.infer<typeof migraineEventSchema>;

export const triggerDataSchema = z.object({
  timestamp: utcDateTimeSchema,
  weatherChange: z.boolean().optional(),
  barometricPressure: z.number().optional(),
  sleepQuality: z.number().int().min(1).max(10).optional(),
  sleepDuration: z.string().optional(), // duration as ISO string
  stressLevel: z.number().int().min(1).max(10).optional(),
  food: z.array(z.string()).optional(),
  hydrationLevel: z.number().int().min(1).max(10).optional(),
  hormonalFactors: z.boolean().optional(),
  physicalActivity: z.string().optional(),
  screenTime: z.string().optional(), // duration as ISO string
  notes: z.string().optional(),
});

export type TriggerData = z.infer<typeof triggerDataSchema>;

export const logMigraineOptionsSchema = z.object({
  event: migraineEventSchema,
  triggers: triggerDataSchema.optional(),
});

export type LogMigraineOptions = z.infer<typeof logMigraineOptionsSchema>;

export const logTriggerOptionsSchema = z.object({
  data: triggerDataSchema,
});

export type LogTriggerOptions = z.infer<typeof logTriggerOptionsSchema>;

export const predictionRequestSchema = z.object({
  timeframe: z.string(), // duration as ISO string
  considerFactors: z.array(z.string()).optional(),
});

export type PredictionRequest = z.infer<typeof predictionRequestSchema>;

export const historyRequestSchema = z.object({
  startDate: utcDateTimeSchema,
  endDate: utcDateTimeSchema,
  includeTriggersData: z.boolean().optional(),
});

export type HistoryRequest = z.infer<typeof historyRequestSchema>;

export const analysisRequestSchema = z.object({
  startDate: utcDateTimeSchema,
  endDate: utcDateTimeSchema,
  triggerType: z.string().optional(),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

export declare function logMigraine(options: LogMigraineOptions): Promise<void>;

export declare function logTrigger(options: LogTriggerOptions): Promise<void>;

export declare function predictMigraine(options: PredictionRequest): Promise<string>;

export declare function getMigraineHistory(options: HistoryRequest): Promise<MigraineEvent[]>;

export declare function analyzeTriggers(options: AnalysisRequest): Promise<string>;