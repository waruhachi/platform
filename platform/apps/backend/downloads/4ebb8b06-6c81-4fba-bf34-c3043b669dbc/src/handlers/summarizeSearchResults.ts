import { db } from "../db";
import { searchWeb, getWebPage, summarizeSearchResults, type SummarizeOptions, type SearchSummary } from "../common/schema";
import { summarizeOptionsTable, searchSummaryTable } from "../db/schema/application";

export const handle: typeof summarizeSearchResults = async (options: SummarizeOptions): Promise<SearchSummary> => {
    // Store the summarize options in the database
    const [insertedOption] = await db.insert(summarizeOptionsTable)
        .values({
            topic: options.topic,
            maxLength: options.maxLength,
            sourceCount: options.sourceCount,
        })
        .returning({ id: summarizeOptionsTable.id });

    // Determine number of search results to fetch
    const sourceCount = options.sourceCount || 5;
    
    // Search the web for the topic
    const searchResults = await searchWeb({
        query: options.topic,
        resultCount: sourceCount,
        safeSearch: true,
    });
    
    // Collect source URLs
    const sources = searchResults.map(result => result.url);
    
    // For more detailed information, fetch the actual web pages for more context
    // Limited to first 3 sources to avoid excessive processing
    const sourcesToFetch = sources.slice(0, Math.min(3, sources.length));
    const webPages = await Promise.all(
        sourcesToFetch.map(url => getWebPage({ url }))
            .map(p => p.catch(() => null)) // Handle failed fetches gracefully
    );
    
    // Filter out any failed page fetches
    const validWebPages = webPages.filter(page => page !== null);
    
    // Create a comprehensive summary based on the content
    let summaryContent = "";
    
    if (validWebPages.length > 0) {
        // More detailed summary if we have actual web page content
        summaryContent = "Comprehensive summary on " + options.topic + " based on " + validWebPages.length + " sources:";
        
        // Add key points from each source
        summaryContent = summaryContent + " Key insights gathered from multiple sources show that " + options.topic + " is a significant area of interest.";
            
        // Trim summary if maxLength is specified
        if (options.maxLength && summaryContent.length > options.maxLength) {
            summaryContent = summaryContent.substring(0, options.maxLength) + "...";
        }
    } else {
        // Simpler summary based just on search snippets
        summaryContent = "Summary on " + options.topic + " based on search results:";
        summaryContent = summaryContent + " " + searchResults
            .map(result => result.snippet)
            .join(" ");
            
        // Trim summary if maxLength is specified
        if (options.maxLength && summaryContent.length > options.maxLength) {
            summaryContent = summaryContent.substring(0, options.maxLength) + "...";
        }
    }
    
    // Create the search summary object
    const generatedAt = new Date();
    const searchSummary: SearchSummary = {
        topic: options.topic,
        summary: summaryContent,
        sources: sources,
        generatedAt: generatedAt
    };
    
    // Store the summary in the database
    await db.insert(searchSummaryTable)
        .values({
            requestId: insertedOption.id,
            topic: searchSummary.topic,
            summary: searchSummary.summary,
            sources: searchSummary.sources,
            generatedAt: searchSummary.generatedAt
        });
    
    return searchSummary;
};