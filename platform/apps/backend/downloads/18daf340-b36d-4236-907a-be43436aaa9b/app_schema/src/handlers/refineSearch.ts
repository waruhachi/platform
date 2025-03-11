import { db } from "../db";
import { eq } from "drizzle-orm";
import type { RefineSearchOptions, SearchResult } from "../common/schema";
import { refineSearch } from "../common/schema";
import { searchQueriesTable, searchRefinementsTable, searchResultsTable } from "../db/schema/application";

export const handle: typeof refineSearch = async (options: RefineSearchOptions): Promise<SearchResult[]> => {
    // First, create a record of the original query in searchQueriesTable if it doesn't exist
    const [existingQuery] = await db
        .select()
        .from(searchQueriesTable)
        .where(eq(searchQueriesTable.query, options.originalQuery))
        .limit(1);

    let queryId: number;

    if (!existingQuery) {
        // Insert the original query
        const [insertedQuery] = await db
            .insert(searchQueriesTable)
            .values({
                query: options.originalQuery,
                max_results: 10, // default value
                include_images: false, // default value
                safe_search: true, // default value
            })
            .returning({ id: searchQueriesTable.id });

        queryId = insertedQuery.id;
    } else {
        queryId = existingQuery.id;
    }

    // Convert Date objects to strings for the database
    const startDateString = options.dateRange?.startDate ? 
        options.dateRange.startDate.toISOString().split('T')[0] : null;
    const endDateString = options.dateRange?.endDate ? 
        options.dateRange.endDate.toISOString().split('T')[0] : null;

    // Store the refinement details
    const [insertedRefinement] = await db
        .insert(searchRefinementsTable)
        .values({
            user_id: null,
            original_query_id: queryId,
            additional_terms: options.additionalTerms,
            exclude_terms: options.exclude || [],
            start_date: startDateString,
            end_date: endDateString,
        })
        .returning({ id: searchRefinementsTable.id });

    // Build the refined search query
    let refinedQuery = options.originalQuery;

    // Add additional terms
    if (options.additionalTerms.length > 0) {
        refinedQuery += " " + options.additionalTerms.join(" ");
    }

    // Add exclusions
    if (options.exclude && options.exclude.length > 0) {
        refinedQuery += " -" + options.exclude.join(" -");
    }

    // Execute the search with the refined query
    // For this implementation, we'll simulate results
    const simulatedResults: SearchResult[] = [
        {
            title: `Refined Result for: ${refinedQuery}`,
            url: `https://example.com/result1`,
            snippet: `This is a search result for the refined query: ${refinedQuery}`,
            lastUpdated: new Date(),
        },
        {
            title: `Another Result for: ${refinedQuery}`,
            url: `https://example.com/result2`,
            snippet: `Another search result matching your refined search terms`,
            lastUpdated: new Date(Date.now() - 86400000), // 1 day ago
        }
    ];

    // Store search results in the database
    const resultIds = await Promise.all(
        simulatedResults.map(async (result) => {
            const lastUpdatedString = result.lastUpdated ? 
                result.lastUpdated.toISOString() : null;
                
            const [insertedResult] = await db
                .insert(searchResultsTable)
                .values({
                    search_query_id: queryId,
                    title: result.title,
                    url: result.url,
                    snippet: result.snippet,
                    last_updated: result.lastUpdated,
                })
                .returning({ id: searchResultsTable.id });

            return insertedResult.id;
        })
    );

    // Apply date range filter if specified
    let filteredResults = [...simulatedResults];
    if (options.dateRange) {
        const startDate = options.dateRange.startDate;
        const endDate = options.dateRange.endDate;
        
        filteredResults = filteredResults.filter(result => {
            if (!result.lastUpdated) return true;

            const isAfterStartDate = !startDate || 
                result.lastUpdated >= startDate;
            
            const isBeforeEndDate = !endDate || 
                result.lastUpdated <= endDate;

            return isAfterStartDate && isBeforeEndDate;
        });
    }

    return filteredResults;
};