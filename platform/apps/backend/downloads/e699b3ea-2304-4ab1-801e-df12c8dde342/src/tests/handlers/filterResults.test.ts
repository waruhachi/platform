
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { handle as filterResults } from "../../handlers/filterResults.ts";
import { expect, it, jest } from "bun:test";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { type FilterOptions } from "../../common/schema";
import { filterOptionsTable, searchQueriesTable, searchResultsTable } from "../../db/schema/application";

describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should filter results by date range", async () => {
      // Setup
      const filterOptions: FilterOptions = {
        dateRange: {
          from: new Date("2023-01-01"),
          to: new Date("2023-12-31")
        }
      };

      // Act
      await filterResults(filterOptions);

      // Assert
      const savedFilters = await db
        .select()
        .from(filterOptionsTable)
        .execute();

      expect(savedFilters).toHaveLength(1);
      expect(savedFilters[0].date_range_from).toEqual(new Date("2023-01-01"));
      expect(savedFilters[0].date_range_to).toEqual(new Date("2023-12-31"));
    });

    
    
    it("should filter results by file types", async () => {
      // Setup
      const filterOptions: FilterOptions = {
        fileTypes: ["pdf", "doc", "txt"]
      };

      // Act
      await filterResults(filterOptions);

      // Assert
      const savedFilters = await db
        .select()
        .from(filterOptionsTable)
        .execute();

      expect(savedFilters).toHaveLength(1);
      expect(savedFilters[0].file_types).toEqual(["pdf", "doc", "txt"]);
    });

    
    
    it("should filter results by domains", async () => {
      // Setup
      const filterOptions: FilterOptions = {
        domains: ["example.com", "test.org"]
      };

      // Act
      await filterResults(filterOptions);

      // Assert
      const savedFilters = await db
        .select()
        .from(filterOptionsTable)
        .execute();

      expect(savedFilters).toHaveLength(1);
      expect(savedFilters[0].domains).toEqual(["example.com", "test.org"]);
    });

    
    
    it("should filter results by languages", async () => {
      // Setup
      const filterOptions: FilterOptions = {
        languages: ["en", "fr", "de"]
      };

      // Act
      await filterResults(filterOptions);

      // Assert
      const savedFilters = await db
        .select()
        .from(filterOptionsTable)
        .execute();

      expect(savedFilters).toHaveLength(1);
      expect(savedFilters[0].languages).toEqual(["en", "fr", "de"]);
    });

    
    
    it("should filter results by relevance score", async () => {
      // Setup
      const filterOptions: FilterOptions = {
        relevanceScore: 75
      };

      // Act
      await filterResults(filterOptions);

      // Assert
      const savedFilters = await db
        .select()
        .from(filterOptionsTable)
        .execute();

      expect(savedFilters).toHaveLength(1);
      expect(savedFilters[0].relevance_score).toEqual(75);
    });

    
    
    it("should apply multiple filter criteria simultaneously", async () => {
      // Setup
      const filterOptions: FilterOptions = {
        dateRange: {
          from: new Date("2023-05-01"),
          to: new Date("2023-05-31")
        },
        fileTypes: ["pdf"],
        domains: ["academic.edu"],
        languages: ["en"],
        relevanceScore: 90
      };

      // Act
      await filterResults(filterOptions);

      // Assert
      const savedFilters = await db
        .select()
        .from(filterOptionsTable)
        .execute();

      expect(savedFilters).toHaveLength(1);
      expect(savedFilters[0].date_range_from).toEqual(new Date("2023-05-01"));
      expect(savedFilters[0].date_range_to).toEqual(new Date("2023-05-31"));
      expect(savedFilters[0].file_types).toEqual(["pdf"]);
      expect(savedFilters[0].domains).toEqual(["academic.edu"]);
      expect(savedFilters[0].languages).toEqual(["en"]);
      expect(savedFilters[0].relevance_score).toEqual(90);
    });

    
    
    it("should handle empty filter options", async () => {
      // Setup
      const filterOptions: FilterOptions = {};

      // Act
      await filterResults(filterOptions);

      // Assert
      const savedFilters = await db
        .select()
        .from(filterOptionsTable)
        .execute();

      expect(savedFilters).toHaveLength(1);
      expect(savedFilters[0].date_range_from).toBeNull();
      expect(savedFilters[0].date_range_to).toBeNull();
      expect(savedFilters[0].file_types).toBeNull();
      expect(savedFilters[0].domains).toBeNull();
      expect(savedFilters[0].languages).toBeNull();
      expect(savedFilters[0].relevance_score).toBeNull();
    });

    
    
    it("should handle partial date range (only 'from' date)", async () => {
      // Setup
      const filterOptions: FilterOptions = {
        dateRange: {
          from: new Date("2023-01-01")
        }
      };

      // Act
      await filterResults(filterOptions);

      // Assert
      const savedFilters = await db
        .select()
        .from(filterOptionsTable)
        .execute();

      expect(savedFilters).toHaveLength(1);
      expect(savedFilters[0].date_range_from).toEqual(new Date("2023-01-01"));
      expect(savedFilters[0].date_range_to).toBeNull();
    });

    
    
    it("should handle partial date range (only 'to' date)", async () => {
      // Setup
      const filterOptions: FilterOptions = {
        dateRange: {
          to: new Date("2023-12-31")
        }
      };

      // Act
      await filterResults(filterOptions);

      // Assert
      const savedFilters = await db
        .select()
        .from(filterOptionsTable)
        .execute();

      expect(savedFilters).toHaveLength(1);
      expect(savedFilters[0].date_range_from).toBeNull();
      expect(savedFilters[0].date_range_to).toEqual(new Date("2023-12-31"));
    });

    
});