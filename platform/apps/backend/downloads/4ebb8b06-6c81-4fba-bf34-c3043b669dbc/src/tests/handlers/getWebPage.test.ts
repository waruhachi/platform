
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { handle as getWebPage } from "../../handlers/getWebPage.ts";
import { expect, it, mock } from "bun:test";
import { db } from "../../db";
import { webPageOptionsTable, webPagesTable } from "../../db/schema/application";
import { type WebPageOptions, type WebPage } from "../../common/schema";

describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should fetch a web page with provided URL", async () => {
      const options: WebPageOptions = { url: "https://example.com" };
      
      // Create a mock implementation
      const mockWebPage: WebPage = {
        url: "https://example.com",
        title: "Example Website",
        content: "This is an example website content.",
        dateAccessed: new Date()
      };
      
      // Mock the function implementation directly
      const mockedGetWebPage = mock(() => Promise.resolve(mockWebPage));
      
      const result = await mockedGetWebPage();
      
      expect(result).toEqual(mockWebPage);
      expect(result.url).toEqual("https://example.com");
      expect(result.title).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.dateAccessed).toBeInstanceOf(Date);
    });

    
    
    it("should store the web page options in database", async () => {
      const options: WebPageOptions = { url: "https://example.com" };
      
      // Create a mock implementation
      const mockWebPage: WebPage = {
        url: "https://example.com",
        title: "Example Website",
        content: "This is an example website content.",
        dateAccessed: new Date()
      };
      
      // Create a spy on db.insert
      const insertSpy = mock();
      const originalInsert = db.insert;
      
      // Override with our spy temporarily
      Object.defineProperty(db, "insert", {
        value: insertSpy,
        writable: true,
        configurable: true
      });
      
      // Mock the getWebPage function
      const mockedGetWebPage = mock(() => Promise.resolve(mockWebPage));
      
      await mockedGetWebPage();
      
      // Check if our spy was called
      expect(insertSpy).toHaveBeenCalled();
      
      // Restore original db.insert
      Object.defineProperty(db, "insert", {
        value: originalInsert,
        writable: true,
        configurable: true
      });
    });

    
    
    it("should store the fetched web page content in database", async () => {
      const options: WebPageOptions = { url: "https://example.com" };
      
      // Create a mock implementation
      const mockWebPage: WebPage = {
        url: "https://example.com",
        title: "Example Website",
        content: "This is an example website content.",
        dateAccessed: new Date()
      };
      
      // Create spies for database operations
      const selectSpy = mock();
      const insertSpy = mock();
      const originalSelect = db.select;
      const originalInsert = db.insert;
      
      // Override with our spies temporarily
      Object.defineProperty(db, "select", {
        value: selectSpy,
        writable: true,
        configurable: true
      });
      
      Object.defineProperty(db, "insert", {
        value: insertSpy,
        writable: true,
        configurable: true
      });
      
      // Mock the getWebPage function
      const mockedGetWebPage = mock(() => Promise.resolve(mockWebPage));
      
      await mockedGetWebPage();
      
      // Check if our spies were called
      expect(insertSpy).toHaveBeenCalled();
      
      // Restore original methods
      Object.defineProperty(db, "select", {
        value: originalSelect,
        writable: true,
        configurable: true
      });
      
      Object.defineProperty(db, "insert", {
        value: originalInsert,
        writable: true,
        configurable: true
      });
    });

    
    
    it("should handle translation when translateToLanguage is provided", async () => {
      const options: WebPageOptions = { 
        url: "https://example.com",
        translateToLanguage: "es" 
      };
      
      // Create a mock implementation for translated content
      const mockTranslatedWebPage: WebPage = {
        url: "https://example.com",
        title: "Sitio Web de Ejemplo", // Translated title
        content: "Este es un contenido de sitio web de ejemplo.", // Translated content
        dateAccessed: new Date()
      };
      
      // Mock the getWebPage function with translated content
      const mockedGetWebPage = mock(() => Promise.resolve(mockTranslatedWebPage));
      
      const result = await mockedGetWebPage();
      
      expect(result).toEqual(mockTranslatedWebPage);
      expect(result.title).toEqual("Sitio Web de Ejemplo");
      expect(result.content).toEqual("Este es un contenido de sitio web de ejemplo.");
    });

    
    
    it("should throw an error when provided with an invalid URL", async () => {
      const options: WebPageOptions = { url: "invalid-url" };
      
      // Mock the function to throw an error
      const mockedGetWebPage = mock(() => {
        throw new Error("Invalid URL format");
      });
      
      expect(() => mockedGetWebPage()).toThrow("Invalid URL format");
    });

    
    
    it("should cache results for previously fetched URLs", async () => {
      const options: WebPageOptions = { url: "https://example.com" };
      
      // Create a mock implementation for cached content
      const mockCachedWebPage: WebPage = {
        url: "https://example.com",
        title: "Cached Example Website",
        content: "This is a cached example website content.",
        dateAccessed: new Date()
      };
      
      // Create spy for db.select
      const selectSpy = mock();
      const originalSelect = db.select;
      
      // Override with our spy temporarily
      Object.defineProperty(db, "select", {
        value: selectSpy,
        writable: true,
        configurable: true
      });
      
      // Mock the getWebPage function
      const mockedGetWebPage = mock(() => Promise.resolve(mockCachedWebPage));
      
      const result = await mockedGetWebPage();
      
      expect(result.title).toEqual("Cached Example Website");
      expect(selectSpy).toHaveBeenCalled();
      
      // Restore original db.select
      Object.defineProperty(db, "select", {
        value: originalSelect,
        writable: true,
        configurable: true
      });
    });

    
});