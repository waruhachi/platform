import { z } from 'zod';

export const searchQuerySchema = z.object({
  query: z.string(),
  maxResults: z.number().int().optional(),
  includeImages: z.boolean().optional(),
  safeSearch: z.boolean().optional(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const webPageRequestSchema = z.object({
  url: z.string(),
  extractText: z.boolean().optional(),
  includeSummary: z.boolean().optional(),
});

export type WebPageRequest = z.infer<typeof webPageRequestSchema>;

export const dateRangeFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type DateRangeFilter = z.infer<typeof dateRangeFilterSchema>;

export const refineSearchOptionsSchema = z.object({
  originalQuery: z.string(),
  additionalTerms: z.array(z.string()),
  exclude: z.array(z.string()).optional(),
  dateRange: dateRangeFilterSchema.optional(),
});

export type RefineSearchOptions = z.infer<typeof refineSearchOptionsSchema>;

export const searchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
  lastUpdated: z.coerce.date().optional(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

export declare function search(options: SearchQuery): Promise<SearchResult[]>;

export declare function retrieveWebPage(options: WebPageRequest): Promise<string>;

export declare function refineSearch(options: RefineSearchOptions): Promise<SearchResult[]>;