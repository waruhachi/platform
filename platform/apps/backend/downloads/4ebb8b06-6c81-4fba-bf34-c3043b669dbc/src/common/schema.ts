import { z } from 'zod';

export const webSearchOptionsSchema = z.object({
  query: z.string(),
  resultCount: z.number().int().optional(),
  language: z.string().optional(),
  safeSearch: z.boolean().optional(),
});

export type WebSearchOptions = z.infer<typeof webSearchOptionsSchema>;

export const searchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
  datePublished: z.coerce.date().optional(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

export const webPageOptionsSchema = z.object({
  url: z.string(),
  translateToLanguage: z.string().optional(),
});

export type WebPageOptions = z.infer<typeof webPageOptionsSchema>;

export const webPageSchema = z.object({
  url: z.string(),
  title: z.string(),
  content: z.string(),
  dateAccessed: z.coerce.date(),
});

export type WebPage = z.infer<typeof webPageSchema>;

export const summarizeOptionsSchema = z.object({
  topic: z.string(),
  maxLength: z.number().int().optional(),
  sourceCount: z.number().int().optional(),
});

export type SummarizeOptions = z.infer<typeof summarizeOptionsSchema>;

export const searchSummarySchema = z.object({
  topic: z.string(),
  summary: z.string(),
  sources: z.array(z.string()),
  generatedAt: z.coerce.date(),
});

export type SearchSummary = z.infer<typeof searchSummarySchema>;

export declare function searchWeb(options: WebSearchOptions): Promise<SearchResult[]>;

export declare function getWebPage(options: WebPageOptions): Promise<WebPage>;

export declare function summarizeSearchResults(options: SummarizeOptions): Promise<SearchSummary>;