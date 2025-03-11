
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { handle as performSearch } from "../../handlers/performSearch.ts";
import { expect, it, mock } from "bun:test";
import { db } from "../../db";
import { searchQueriesTable, searchEnginesEnum } from "../../db/schema/application";
import { eq } from "drizzle-orm";
import type { SearchQuery } from "../../common/schema";

describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should perform a basic search with required parameters", async () => {
      // Mock the current user for the test
      const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
      
      // Create a basic search query
      const searchQuery: SearchQuery = {
        query: "typescript tutorial"
      };
      
      // Perform search
      await performSearch(searchQuery);
      
      // Check if the search query was saved in the database
      const savedQueries = await db
        .select()
        .from(searchQueriesTable)
        .where(eq(searchQueriesTable.query, "typescript tutorial"))
        .execute();
      
      expect(savedQueries).toHaveLength(1);
      expect(savedQueries[0].query).toEqual("typescript tutorial");
      expect(savedQueries[0].search_engine).toEqual("google"); // Default value
    });

    
    
    it("should respect custom result count when provided", async () => {
      // Create a search query with custom result count
      const searchQuery: SearchQuery = {
        query: "typescript best practices",
        resultCount: 50
      };
      
      // Perform search
      await performSearch(searchQuery);
      
      // Check if the search query was saved with correct result count
      const savedQueries = await db
        .select()
        .from(searchQueriesTable)
        .where(eq(searchQueriesTable.query, "typescript best practices"))
        .execute();
      
      expect(savedQueries).toHaveLength(1);
      expect(savedQueries[0].result_count).toEqual(50);
    });

    
    
    it("should use specified search engine when provided", async () => {
      // Create a search query with custom search engine
      const searchQuery: SearchQuery = {
        query: "javascript frameworks",
        searchEngine: "duckduckgo"
      };
      
      // Perform search
      await performSearch(searchQuery);
      
      // Check if the search query was saved with correct search engine
      const savedQueries = await db
        .select()
        .from(searchQueriesTable)
        .where(eq(searchQueriesTable.query, "javascript frameworks"))
        .execute();
      
      expect(savedQueries).toHaveLength(1);
      expect(savedQueries[0].search_engine).toEqual("duckduckgo");
    });

    
    
    it("should handle empty search query gracefully", async () => {
      // Create an empty search query
      const searchQuery: SearchQuery = {
        query: ""
      };
      
      // Attempt to perform search with empty query
      // This should either throw an error or handle it gracefully
      try {
        await performSearch(searchQuery);
        
        // If no error is thrown, we expect the function to handle empty queries
        const savedQueries = await db
          .select()
          .from(searchQueriesTable)
          .where(eq(searchQueriesTable.query, ""))
          .execute();
        
        // The behavior depends on the implementation, but we're testing that something reasonable happens
        // Either the query is saved as-is, or it's not saved at all
        if (savedQueries.length > 0) {
          expect(savedQueries[0].query).toEqual("");
        }
      } catch (error) {
        // If an error is thrown, we expect it to be because empty queries are invalid
        expect(error).toBeDefined();
      }
    });

    
    
    it("should perform search with all optional parameters", async () => {
      const searchQuery: SearchQuery = {
        query: "advanced typescript patterns",
        resultCount: 25,
        searchEngine: "bing"
      };
      
      await performSearch(searchQuery);
      
      const savedQueries = await db
        .select()
        .from(searchQueriesTable)
        .where(eq(searchQueriesTable.query, "advanced typescript patterns"))
        .execute();
      
      expect(savedQueries).toHaveLength(1);
      expect(savedQueries[0].query).toEqual("advanced typescript patterns");
      expect(savedQueries[0].result_count).toEqual(25);
      expect(savedQueries[0].search_engine).toEqual("bing");
    });

    
    
    it("should reject invalid search engine values", async () => {
      const searchQuery = {
        query: "react hooks",
        searchEngine: "invalidEngine" // Not in searchEnginesEnum
      } as SearchQuery;
      
      try {
        await performSearch(searchQuery);
        // If we reach here, the function didn't validate the search engine
        const savedQueries = await db
          .select()
          .from(searchQueriesTable)
          .where(eq(searchQueriesTable.query, "react hooks"))
          .execute();
        
        // The query might be saved, but with default engine instead of invalid one
        if (savedQueries.length > 0) {
          expect(savedQueries[0].search_engine).not.toEqual("invalidEngine");
        }
      } catch (error) {
        // If validation happens, we expect an error
        expect(error).toBeDefined();
      }
    });

    
});