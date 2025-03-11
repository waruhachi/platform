
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { searchQueriesTable, searchRefinementsTable, searchResultsTable, refinementResultsTable } from "../../db/schema/application";
import { type RefineSearchOptions } from "../../common/schema";


import { handle as refineSearch } from "../../handlers/refineSearch.ts";


describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should refine search results based on additional terms", async () => {
      // Setup test data
      const options: RefineSearchOptions = {
        originalQuery: "javascript",
        additionalTerms: ["tutorial", "beginner"],
      };

      const results = await refineSearch(options);
      
      expect(results).toBeArray();
      expect(results.length).toBeGreaterThan(0);
      
      // Each result should match the SearchResult type
      results.forEach(result => {
        expect(result).toHaveProperty("title");
        expect(result).toHaveProperty("url");
        expect(result).toHaveProperty("snippet");
      });
      
      // Check that refinement was stored in database
      const storedRefinements = await db.select().from(searchRefinementsTable).execute();
      expect(storedRefinements).toHaveLength(1);
      expect(storedRefinements[0].additional_terms).toContain("tutorial");
      expect(storedRefinements[0].additional_terms).toContain("beginner");
    });

    
    
    it("should exclude specified terms from search results", async () => {
      const options: RefineSearchOptions = {
        originalQuery: "python",
        additionalTerms: ["web framework"],
        exclude: ["django", "flask"]
      };

      const results = await refineSearch(options);
      
      expect(results).toBeArray();
      
      // Verify none of the results contain excluded terms in their snippets
      results.forEach(result => {
        expect(result.snippet.toLowerCase()).not.toContain("django");
        expect(result.snippet.toLowerCase()).not.toContain("flask");
      });
      
      // Check that exclusion terms were stored
      const storedRefinements = await db.select().from(searchRefinementsTable).execute();
      expect(storedRefinements[0].exclude_terms).toContain("django");
      expect(storedRefinements[0].exclude_terms).toContain("flask");
    });

    
    
    it("should filter results by date range when provided", async () => {
      const startDate = new Date("2023-01-01");
      const endDate = new Date("2023-12-31");
      
      const options: RefineSearchOptions = {
        originalQuery: "machine learning",
        additionalTerms: ["research papers"],
        dateRange: {
          startDate,
          endDate
        }
      };

      const results = await refineSearch(options);
      
      expect(results).toBeArray();
      
      // Check results fall within date range if they have lastUpdated
      results.forEach(result => {
        if (result.lastUpdated) {
          expect(result.lastUpdated >= startDate).toBeTrue();
          expect(result.lastUpdated <= endDate).toBeTrue();
        }
      });
      
      // Check date range was stored in database
      const storedRefinements = await db.select().from(searchRefinementsTable).execute();
      
      // Using string comparison to avoid Date type issues
      if (storedRefinements[0].start_date) {
        const dbStartDate = new Date(storedRefinements[0].start_date.toString());
        expect(dbStartDate.getFullYear()).toEqual(startDate.getFullYear());
        expect(dbStartDate.getMonth()).toEqual(startDate.getMonth());
        expect(dbStartDate.getDate()).toEqual(startDate.getDate());
      }
      
      if (storedRefinements[0].end_date) {
        const dbEndDate = new Date(storedRefinements[0].end_date.toString());
        expect(dbEndDate.getFullYear()).toEqual(endDate.getFullYear());
        expect(dbEndDate.getMonth()).toEqual(endDate.getMonth());
        expect(dbEndDate.getDate()).toEqual(endDate.getDate());
      }
    });

    
    
    it("should link refinement to original query", async () => {
      // First create an original query to reference
      await db.insert(searchQueriesTable).values({
        query: "original query",
        max_results: 10,
        include_images: false,
        safe_search: true
      }).execute();
      
      const originalQueries = await db.select().from(searchQueriesTable).execute();
      const originalQueryId = originalQueries[0].id;
      
      // Now refine the search
      const options: RefineSearchOptions = {
        originalQuery: "original query",
        additionalTerms: ["more specific"]
      };

      await refineSearch(options);
      
      // Check refinement links to original query
      const refinements = await db.select().from(searchRefinementsTable).execute();
      expect(refinements[0].original_query_id).toEqual(originalQueryId);
    });

    
    
    it("should save search results and link them to refinements", async () => {
      const options: RefineSearchOptions = {
        originalQuery: "node.js",
        additionalTerms: ["async", "promises"]
      };

      const results = await refineSearch(options);
      
      // Check results were stored in the database
      const savedResults = await db.select().from(searchResultsTable).execute();
      expect(savedResults.length).toEqual(results.length);
      
      // Get refinement ID
      const refinements = await db.select().from(searchRefinementsTable).execute();
      const refinementId = refinements[0].id;
      
      // Check many-to-many relationships were created
      const relationships = await db.select()
        .from(refinementResultsTable)
        .where(eq(refinementResultsTable.refinement_id, refinementId))
        .execute();
      
      expect(relationships.length).toEqual(results.length);
    });

    
});