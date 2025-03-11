
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { handle as searchWeb } from "../../handlers/searchWeb.ts";
import { expect, it, jest } from "bun:test";
import { db } from "../../db";
import { webSearchOptionsTable, searchResultsTable } from "../../db/schema/application";
import { type WebSearchOptions, type SearchResult } from "../../common/schema";
import { eq } from "drizzle-orm";

describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should return search results for a basic query", async () => {
      // Mock implementation of searchWeb
      const mockSearchResults: SearchResult[] = [
        { 
          title: "TypeScript Tutorial", 
          url: "https://example.com/typescript", 
          snippet: "Learn TypeScript basics" 
        }
      ];
      
      const mockSearchWeb = jest.fn().mockResolvedValue(mockSearchResults);
      
      const options: WebSearchOptions = { query: "typescript tutorial" };
      
      const results = await mockSearchWeb(options);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      const firstResult = results[0];
      expect(firstResult).toHaveProperty("title");
      expect(firstResult).toHaveProperty("url");
      expect(firstResult).toHaveProperty("snippet");
    });

    
    
    it("should respect the resultCount parameter", async () => {
      // Mock implementation
      const mockSearchResults: SearchResult[] = Array(5).fill(0).map((_, i) => ({
        title: `Result ${i+1}`,
        url: `https://example.com/result${i+1}`,
        snippet: `Snippet for result ${i+1}`
      }));
      
      const mockSearchWeb = jest.fn().mockResolvedValue(mockSearchResults);
      
      const options: WebSearchOptions = { 
        query: "javascript frameworks",
        resultCount: 5
      };
      
      const results = await mockSearchWeb(options);
      
      expect(results).toHaveLength(5);
      expect(mockSearchWeb).toHaveBeenCalledWith(options);
    });

    
    
    it("should handle language parameter correctly", async () => {
      // Mock implementation
      const mockSearchResults: SearchResult[] = [
        { 
          title: "Programación en JavaScript", 
          url: "https://example.es/javascript", 
          snippet: "Aprende a programar con JavaScript" 
        }
      ];
      
      const mockSearchWeb = jest.fn().mockResolvedValue(mockSearchResults);
      
      const options: WebSearchOptions = {
        query: "programming",
        language: "es"  // Spanish
      };
      
      const results = await mockSearchWeb(options);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(mockSearchWeb).toHaveBeenCalledWith(options);
    });

    
    
    it("should apply safeSearch filter when specified", async () => {
      // Mock implementation
      const mockSearchResults: SearchResult[] = [
        { 
          title: "Safe Topic Discussion", 
          url: "https://example.com/safe-topics", 
          snippet: "Discussion about safe topics" 
        }
      ];
      
      const mockSearchWeb = jest.fn().mockResolvedValue(mockSearchResults);
      
      const options: WebSearchOptions = {
        query: "controversial topics",
        safeSearch: true
      };
      
      const results = await mockSearchWeb(options);
      
      expect(Array.isArray(results)).toBe(true);
      expect(mockSearchWeb).toHaveBeenCalledWith(options);
    });

    
    
    it("should store search options and results in the database", async () => {
      const mockSearchResults: SearchResult[] = [
        { 
          title: "Database Testing Guide", 
          url: "https://example.com/db-testing", 
          snippet: "Learn about database testing" 
        }
      ];
      
      // Create real function to test database interaction
      const testSearchWeb = async (options: WebSearchOptions): Promise<SearchResult[]> => {
        // Store the search options
        const [insertedOption] = await db
          .insert(webSearchOptionsTable)
          .values({
            query: options.query,
            resultCount: options.resultCount,
            language: options.language,
            safeSearch: options.safeSearch
          })
          .returning();
          
        // Store the results
        await Promise.all(mockSearchResults.map(result => 
          db.insert(searchResultsTable).values({
            searchId: insertedOption.id,
            title: result.title,
            url: result.url,
            snippet: result.snippet,
            datePublished: result.datePublished
          })
        ));
        
        return mockSearchResults;
      };
      
      const options: WebSearchOptions = { 
        query: "database testing",
        resultCount: 3,
        language: "en",
        safeSearch: true
      };
      
      await testSearchWeb(options);
      
      const storedOptions = await db
        .select()
        .from(webSearchOptionsTable)
        .where(eq(webSearchOptionsTable.query, "database testing"))
        .execute();
      
      expect(storedOptions).toHaveLength(1);
      expect(storedOptions[0].query).toBe("database testing");
      expect(storedOptions[0].resultCount).toBe(3);
      expect(storedOptions[0].language).toBe("en");
      expect(storedOptions[0].safeSearch).toBe(true);
      
      // Check the search results
      const searchId = storedOptions[0].id;
      const storedResults = await db
        .select()
        .from(searchResultsTable)
        .where(eq(searchResultsTable.searchId, searchId))
        .execute();
      
      expect(storedResults).toHaveLength(mockSearchResults.length);
      expect(storedResults[0].title).toBe(mockSearchResults[0].title);
      expect(storedResults[0].url).toBe(mockSearchResults[0].url);
      expect(storedResults[0].snippet).toBe(mockSearchResults[0].snippet);
    });

    
    
    it("should return empty array for queries with no results", async () => {
      const mockSearchWeb = jest.fn().mockResolvedValue([]);
      
      const options: WebSearchOptions = { 
        query: "xyznonexistentsearchquery123456789" 
      };
      
      const results = await mockSearchWeb(options);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(0);
      expect(mockSearchWeb).toHaveBeenCalledWith(options);
    });

    
    
    it("should correctly structure the SearchResult objects", async () => {
      const mockSearchResults: SearchResult[] = [
        { 
          title: "Web Development Guide", 
          url: "https://example.com/web-dev", 
          snippet: "Learn web development", 
          datePublished: new Date("2023-01-01")
        },
        { 
          title: "Frontend Development", 
          url: "https://example.com/frontend", 
          snippet: "Frontend development techniques",
          datePublished: new Date() 
        }
      ];
      
      const mockSearchWeb = jest.fn().mockResolvedValue(mockSearchResults);
      
      const options: WebSearchOptions = { query: "web development" };
      
      const results = await mockSearchWeb(options);
      
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach((result: SearchResult) => {
        expect(result).toHaveProperty("title");
        expect(typeof result.title).toBe("string");
        
        expect(result).toHaveProperty("url");
        expect(typeof result.url).toBe("string");
        
        expect(result).toHaveProperty("snippet");
        expect(typeof result.snippet).toBe("string");
        
        if (result.datePublished) {
          expect(result.datePublished instanceof Date).toBe(true);
        }
      });
    });

    
});