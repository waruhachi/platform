import { z } from 'zod';

// SearchQuery model schema
export const searchQuerySchema = z.object({
  query: z.string(),
  resultCount: z.number().int().optional(),
  searchEngine: z.string().optional(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// FilterOptions model schema
export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const filterOptionsSchema = z.object({
  dateRange: dateRangeSchema.optional(),
  fileTypes: z.array(z.string()).optional(),
  domains: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  relevanceScore: z.number().int().optional(),
});

export type FilterOptions = z.infer<typeof filterOptionsSchema>;

// SaveResultRequest model schema
export const saveResultRequestSchema = z.object({
  resultId: z.string(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export type SaveResultRequest = z.infer<typeof saveResultRequestSchema>;

// ResultDetailsRequest model schema
export const resultDetailsRequestSchema = z.object({
  resultId: z.string(),
  includeMetadata: z.boolean().optional(),
  extractContent: z.boolean().optional(),
});

export type ResultDetailsRequest = z.infer<typeof resultDetailsRequestSchema>;

// WebSearchBot interface function declarations
export declare function performSearch(options: SearchQuery): Promise<void>;
export declare function filterResults(options: FilterOptions): Promise<void>;
export declare function saveResult(options: SaveResultRequest): Promise<void>;
export declare function getResultDetails(options: ResultDetailsRequest): Promise<void>;