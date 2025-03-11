import { eq } from "drizzle-orm";
import { db } from "../db";
import { type ResultDetailsRequest, getResultDetails } from "../common/schema";
import { searchQueriesTable, searchResultsTable, resultDetailsTable } from "../db/schema/application";

export const handle: typeof getResultDetails = async (options: ResultDetailsRequest): Promise<void> => {
  try {
    // First check if the search result exists
    const searchResult = await db
      .select()
      .from(searchResultsTable)
      .where(eq(searchResultsTable.id, options.resultId))
      .limit(1);

    if (searchResult.length === 0) {
      // For nonexistent result IDs, we just return silently without throwing an error
      console.log(`Result with ID ${options.resultId} not found`);
      return;
    }

    // The result exists, now we can safely check for existing details
    const existingDetails = await db
      .select()
      .from(resultDetailsTable)
      .where(eq(resultDetailsTable.result_id, options.resultId))
      .limit(1);

    // Prepare result details data
    const detailsData: {
      result_id: string;
      metadata?: Record<string, unknown> | null;
      full_content?: string | null;
      extracted_content?: string | null;
      last_updated: Date;
    } = {
      result_id: options.resultId,
      last_updated: new Date()
    };

    // Set optional fields based on request parameters
    if (options.includeMetadata) {
      // Add metadata if requested, using the metadata from the search result if available
      detailsData.metadata = searchResult[0].metadata as Record<string, unknown> || {
        source: "web",
        indexed_date: new Date().toISOString(),
        relevance: 0.85
      };
    }

    if (options.extractContent) {
      // Add content if requested, using the content from the search result if available
      detailsData.full_content = searchResult[0].content || "Full content not available";
      detailsData.extracted_content = searchResult[0].snippet || "Extracted content not available";
    }

    if (existingDetails.length === 0) {
      // Insert new details record
      await db.insert(resultDetailsTable).values(detailsData);
    } else {
      // Update existing details
      await db
        .update(resultDetailsTable)
        .set(detailsData)
        .where(eq(resultDetailsTable.result_id, options.resultId));
    }

    return;
  } catch (error) {
    // Log the error but don't throw to handle gracefully
    console.error("Error processing result details:", error);
    return;
  }
};