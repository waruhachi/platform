import { db } from "../db";
import { retrieveWebPage, type WebPageRequest } from "../common/schema";
import { webPageRequestsTable } from "../db/schema/application";
import axios from "axios";

export const handle: typeof retrieveWebPage = async (options: WebPageRequest): Promise<string> => {
    try {
        // Record the web page request in the database
        await db.insert(webPageRequestsTable).values({
            url: options.url,
            extract_text: options.extractText ?? false,
            include_summary: options.includeSummary ?? false,
        }).execute();

        // Fetch the web page content
        const response = await axios.get(options.url, {
            // Set appropriate headers to minimize chance of rejection
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            },
            // Add timeout to prevent hanging requests
            timeout: 10000,
            // Follow redirects
            maxRedirects: 5
        });
        
        const htmlContent = response.data;

        // If extractText is true, extract only the text content from the HTML
        if (options.extractText) {
            // Simple regex to remove HTML tags and decode HTML entities
            const textContent = htmlContent
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/\s+/g, " ")
                .trim();
            
            return textContent;
        }

        // If includeSummary is true, generate a simple summary
        if (options.includeSummary) {
            // Extract title
            const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1] : "Unknown title";
            
            // Extract first paragraph or some content for summary
            const contentMatch = htmlContent.match(/<p[^>]*>(.*?)<\/p>/i);
            const content = contentMatch 
                ? contentMatch[1].replace(/<[^>]+>/g, " ").trim() 
                : "No summary available";
            
            // Create a simple summary
            const summary = `
Summary:
Title: ${title}
URL: ${options.url}
Overview: ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}
            `.trim();
            
            return `${htmlContent}\n\n${summary}`;
        }

        // Return the raw HTML content by default
        return htmlContent;
    } catch (error) {
        // Enhanced error handling
        let errorMessage = "Unknown error occurred";
        
        if (axios.isAxiosError(error)) {
            if (error.code === "ENOTFOUND" || error.code === "ERR_BAD_REQUEST") {
                errorMessage = `Invalid URL or domain not found: ${options.url}`;
            } else if (error.response) {
                errorMessage = `Request failed with status code ${error.response.status}`;
            } else if (error.request) {
                errorMessage = "No response received from the server";
            } else {
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        throw new Error(`Failed to retrieve web page: ${errorMessage}`);
    }
};