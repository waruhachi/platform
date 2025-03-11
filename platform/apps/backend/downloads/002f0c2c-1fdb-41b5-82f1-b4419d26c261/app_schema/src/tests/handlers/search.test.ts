
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { expect, it } from "bun:test";
import { db } from "../../db";
import { searchQueriesTable, searchResultsTable } from "../../db/schema/application";
import { type SearchQuery } from "../../common/schema";
import { sql, desc } from "drizzle-orm";

import { handle as search } from "../../handlers/search.ts";


describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should return search results for a basic query", async () => {
      const input: SearchQuery = { query: "javascript programming" };
      const results = await search(input);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Verify result structure
      const firstResult = results[0];
      expect(firstResult).toHaveProperty("title");
      expect(firstResult).toHaveProperty("url");
      expect(firstResult).toHaveProperty("snippet");
      expect(typeof firstResult.title).toBe("string");
      expect(typeof firstResult.url).toBe("string");
      expect(typeof firstResult.snippet).toBe("string");
    });

    
    
    it("should respect maxResults parameter", async () => {
      const maxResults = 3;
      const input: SearchQuery = { 
        query: "typescript tutorial", 
        maxResults 
      };
      const results = await search(input);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(maxResults);
    });

    
    
    it("should store search query in database", async () => {
      const input: SearchQuery = { 
        query: "node.js express", 
        safeSearch: true 
      };
      
      await search(input);
      
      const storedQueries = await db
        .select()
        .from(searchQueriesTable)
        .where(sql`${searchQueriesTable.query} = ${input.query}`)
        .execute();
      
      expect(storedQueries).toHaveLength(1);
      expect(storedQueries[0].query).toBe("node.js express");
      expect(storedQueries[0].safe_search).toBe(true);
    });

    
    
    it("should store search results in database", async () => {
      const input: SearchQuery = { query: "react hooks" };
      
      const results = await search(input);
      
      // Get the latest search query
      const searchQuery = await db
        .select()
        .from(searchQueriesTable)
        .orderBy(desc(searchQueriesTable.id))
        .limit(1)
        .execute();
      
      if (!searchQuery || searchQuery.length === 0) {
        throw new Error("No search query found");
      }
      
      // Check if results are stored
      const storedResults = await db
        .select()
        .from(searchResultsTable)
        .where(sql`${searchResultsTable.search_query_id} = ${searchQuery[0].id}`)
        .execute();
      
      expect(storedResults.length).toBe(results.length);
      
      // Check if stored results match returned results
      for (let i = 0; i < results.length; i++) {
        expect(storedResults).toContainEqual(
          expect.objectContaining({
            title: results[i].title,
            url: results[i].url,
            snippet: results[i].snippet
          })
        );
      }
    });

    
    
    it("should use default values when optional parameters are not provided", async () => {
      const input: SearchQuery = { query: "typescript compiler" };
      
      await search(input);
      
      const storedQuery = await db
        .select()
        .from(searchQueriesTable)
        .orderBy(desc(searchQueriesTable.id))
        .limit(1)
        .execute();
      
      expect(storedQuery[0].max_results).toBe(10);
      expect(storedQuery[0].include_images).toBe(false);
      expect(storedQuery[0].safe_search).toBe(true);
    });

    
    
    it("should handle all optional parameters correctly", async () => {
      const input: SearchQuery = {
        query: "graphql api",
        maxResults: 5,
        includeImages: true,
        safeSearch: false
      };
      
      await search(input);
      
      const storedQuery = await db
        .select()
        .from(searchQueriesTable)
        .orderBy(desc(searchQueriesTable.id))
        .limit(1)
        .execute();
      
      expect(storedQuery[0].query).toBe(input.query);
      expect(storedQuery[0].max_results).toBe(5);
      expect(storedQuery[0].include_images).toBe(true);
      expect(storedQuery[0].safe_search).toBe(false);
    });

    
    
    it("should return distinct results for different queries", async () => {
      const query1: SearchQuery = { query: "python django" };
      const query2: SearchQuery = { query: "ruby rails" };
      
      const results1 = await search(query1);
      const results2 = await search(query2);
      
      // Ensure we have results to compare
      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
      
      // Check if results are different based on titles
      const titles1 = results1.map(r => r.title);
      const titles2 = results2.map(r => r.title);
      
      // Check that at least some titles are different
      let hasDifference = false;
      for (const title of titles2) {
        if (!titles1.includes(title)) {
          hasDifference = true;
          break;
        }
      }
      
      expect(hasDifference).toBe(true);
    });

    
    
    it("should return an empty array for invalid queries", async () => {
      const input: SearchQuery = { query: "" };
      
      const results = await search(input);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    
});