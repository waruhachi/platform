import { eq } from "drizzle-orm";
import { db } from "../db";
import { type SearchQuery, performSearch } from "../common/schema";
import { searchQueriesTable, searchResultsTable, usersTable } from "../db/schema/application";

export const handle: typeof performSearch = async (options: SearchQuery): Promise<void> => {
    try {
        if (!options.query || options.query.trim() === "") {
            return; // Early return for empty queries
        }

        // For demonstration purposes, we'll use a consistent user ID
        // In a real application, this would come from authentication context
        const defaultUsername = "default_search_user";
        
        // Check if our default user exists, create if not
        let user = await db.select()
            .from(usersTable)
            .where(eq(usersTable.username, defaultUsername))
            .limit(1);
        
        let userId: string;
        
        if (user.length === 0) {
            // Create a default user if none exists
            const insertedUser = await db.insert(usersTable)
                .values({
                    username: defaultUsername,
                })
                .returning({ id: usersTable.id });
            
            userId = insertedUser[0].id;
        } else {
            userId = user[0].id;
        }

        // Validate search engine if provided
        const validEngines = ["google", "bing", "duckduckgo", "custom"];
        const searchEngine = options.searchEngine 
            ? validEngines.includes(options.searchEngine) ? options.searchEngine : "google" 
            : "google";

        // Insert the search query into the database
        const insertedQuery = await db.insert(searchQueriesTable)
            .values({
                user_id: userId,
                query: options.query,
                result_count: options.resultCount || 10,
                search_engine: searchEngine as any
            })
            .returning({ id: searchQueriesTable.id });

        const searchQueryId = insertedQuery[0].id;

        // Generate number of results based on resultCount or default to 3
        const numberOfResults = options.resultCount ? 
            Math.min(options.resultCount, 10) : // Cap at 10 results
            3; // Default to 3 results
        
        // Generate mock search results based on the query
        const mockResults = Array.from({ length: numberOfResults }, (_, index) => ({
            url: `https://example.com/result${index + 1}?q=${encodeURIComponent(options.query)}`,
            title: `Result ${index + 1} for ${options.query}`,
            snippet: `This is a snippet for result ${index + 1} matching ${options.query}...`,
            position: index + 1,
            metadata: { source: searchEngine }
        }));

        // Store mock results in the database
        for (const result of mockResults) {
            await db.insert(searchResultsTable).values({
                search_query_id: searchQueryId,
                url: result.url,
                title: result.title,
                snippet: result.snippet,
                position: result.position,
                metadata: result.metadata
            });
        }

        // Update user's last active timestamp
        await db.update(usersTable)
            .set({ last_active: new Date() })
            .where(eq(usersTable.id, userId));
            
    } catch (error) {
        console.error("Error performing search:", error);
        throw new Error(`Failed to perform search: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};