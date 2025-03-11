import { db } from "../db";
import { searchWeb, type WebSearchOptions, type SearchResult } from "../common/schema";
import { webSearchOptionsTable, searchResultsTable } from "../db/schema/application";

export const handle: typeof searchWeb = async (options: WebSearchOptions): Promise<SearchResult[]> => {
    // Store the search options in the database
    const [insertedOption] = await db.insert(webSearchOptionsTable)
        .values({
            query: options.query,
            resultCount: options.resultCount,
            language: options.language,
            safeSearch: options.safeSearch
        })
        .returning({ id: webSearchOptionsTable.id });

    // In a real implementation, here we would call an external search API
    // This is a mock implementation for demonstration purposes
    const mockResults: SearchResult[] = [
        {
            title: `Result 1 for "${options.query}"`,
            url: `https://example.com/result1?q=${encodeURIComponent(options.query)}`,
            snippet: `This is a sample snippet for result 1 related to ${options.query}`,
            datePublished: new Date()
        },
        {
            title: `Result 2 for "${options.query}"`,
            url: `https://example.com/result2?q=${encodeURIComponent(options.query)}`,
            snippet: `This is a sample snippet for result 2 related to ${options.query}`,
            datePublished: new Date(Date.now() - 86400000) // Yesterday
        }
    ];

    // Limit results if resultCount is specified
    const resultsToReturn = options.resultCount 
        ? mockResults.slice(0, options.resultCount) 
        : mockResults;

    // Store search results in the database
    await db.insert(searchResultsTable)
        .values(
            resultsToReturn.map(result => ({
                searchId: insertedOption.id,
                title: result.title,
                url: result.url,
                snippet: result.snippet,
                datePublished: result.datePublished
            }))
        );

    return resultsToReturn;
};