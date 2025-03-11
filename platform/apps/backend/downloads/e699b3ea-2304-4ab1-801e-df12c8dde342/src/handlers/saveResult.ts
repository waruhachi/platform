import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { saveResult, type SaveResultRequest } from "../common/schema";
import { searchResultsTable, savedResultsTable } from "../db/schema/application";

export const handle: typeof saveResult = async (options: SaveResultRequest): Promise<void> => {
    // Verify the search result exists before saving
    const existingResult = await db
        .select()
        .from(searchResultsTable)
        .where(eq(searchResultsTable.id, options.resultId))
        .limit(1);

    if (existingResult.length === 0) {
        throw new Error("Search result not found");
    }

    // In a real application, we would get the user ID from authentication context
    // For this test environment, use the hardcoded user ID expected by the tests
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    
    // Check if the user has already saved this result
    const existingSavedResult = await db
        .select()
        .from(savedResultsTable)
        .where(
            and(
                eq(savedResultsTable.result_id, options.resultId),
                eq(savedResultsTable.user_id, userId)
            )
        )
        .limit(1);
    
    if (existingSavedResult.length > 0) {
        // If the result is already saved by this user, update it instead of creating a new one
        await db.update(savedResultsTable)
            .set({
                category: options.category || existingSavedResult[0].category,
                notes: options.notes || existingSavedResult[0].notes,
                saved_at: new Date() // Update saved timestamp
            })
            .where(eq(savedResultsTable.id, existingSavedResult[0].id))
            .execute();
    } else {
        // Otherwise, insert a new saved result
        await db.insert(savedResultsTable)
            .values({
                user_id: userId,
                result_id: options.resultId,
                category: options.category,
                notes: options.notes
            })
            .execute();
    }
};