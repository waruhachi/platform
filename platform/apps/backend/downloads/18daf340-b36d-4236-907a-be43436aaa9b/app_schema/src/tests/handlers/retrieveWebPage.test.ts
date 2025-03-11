
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { expect, it } from "bun:test";
import { db } from "../../db";
import { webPageRequestsTable } from "../../db/schema/application";
import { type WebPageRequest } from "../../common/schema";

import { handle as retrieveWebPage } from "../../handlers/retrieveWebPage.ts";


describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should retrieve web page content with default options", async () => {
      const options: WebPageRequest = { 
        url: "https://example.com"
      };
      
      const content = await retrieveWebPage(options);
      
      expect(content).toBeTruthy();
      expect(typeof content).toBe("string");
    });

    
    
    it("should extract text when extractText option is true", async () => {
      const options: WebPageRequest = { 
        url: "https://example.com",
        extractText: true
      };
      
      const content = await retrieveWebPage(options);
      
      expect(content).toBeTruthy();
      expect(typeof content).toBe("string");
      // Text extraction should remove HTML tags
      expect(content).not.toContain("<html>");
      expect(content).not.toContain("<body>");
    });

    
    
    it("should include summary when includeSummary option is true", async () => {
      const options: WebPageRequest = { 
        url: "https://example.com",
        includeSummary: true
      };
      
      const content = await retrieveWebPage(options);
      
      expect(content).toBeTruthy();
      expect(typeof content).toBe("string");
      // Summary should be included in the response
      expect(content).toContain("Summary:");
    });

    
    
    it("should store web page request in database", async () => {
      const options: WebPageRequest = { 
        url: "https://example.com",
        extractText: true,
        includeSummary: false
      };
      
      await retrieveWebPage(options);
      
      const requests = await db.select().from(webPageRequestsTable).execute();
      
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe("https://example.com");
      expect(requests[0].extract_text).toBe(true);
      expect(requests[0].include_summary).toBe(false);
    });

    
    
    it("should throw an error when provided with an invalid URL", async () => {
      const options: WebPageRequest = { 
        url: "invalid-url"
      };
      
      await expect(retrieveWebPage(options)).rejects.toThrow();
    });

    
    
    it("should handle different URL protocols correctly", async () => {
      const httpOptions: WebPageRequest = { 
        url: "http://example.com" 
      };
      
      const httpsOptions: WebPageRequest = { 
        url: "https://example.com" 
      };
      
      const httpContent = await retrieveWebPage(httpOptions);
      const httpsContent = await retrieveWebPage(httpsOptions);
      
      expect(httpContent).toBeTruthy();
      expect(httpsContent).toBeTruthy();
    });

    
    
    it("should persist multiple web page requests separately", async () => {
      const firstOptions: WebPageRequest = { 
        url: "https://example.com/page1" 
      };
      
      const secondOptions: WebPageRequest = { 
        url: "https://example.com/page2",
        extractText: true
      };
      
      await retrieveWebPage(firstOptions);
      await retrieveWebPage(secondOptions);
      
      const requests = await db.select().from(webPageRequestsTable).execute();
      
      expect(requests).toHaveLength(2);
      expect(requests[0].url).toBe("https://example.com/page1");
      expect(requests[1].url).toBe("https://example.com/page2");
      expect(requests[1].extract_text).toBe(true);
    });

    
});