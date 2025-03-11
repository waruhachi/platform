import { db } from "../db";
import { getWebPage, type WebPageOptions, type WebPage } from "../common/schema";
import { webPageOptionsTable, webPagesTable } from "../db/schema/application";
import { eq } from "drizzle-orm";

/**
 * Handles retrieval of web page content from a URL
 */
export const handle: typeof getWebPage = async (options: WebPageOptions): Promise<WebPage> => {
    // Validate URL format
    if (!isValidUrl(options.url)) {
        throw new Error("Invalid URL provided");
    }
    
    // Store the web page request in the database
    const insertedOptions = await db.insert(webPageOptionsTable)
        .values({
            url: options.url,
            translateToLanguage: options.translateToLanguage
        })
        .returning({ id: webPageOptionsTable.id });
    
    const requestId = insertedOptions[0].id;

    // Check if we already have this web page cached
    const existingPages = await db.select()
        .from(webPagesTable)
        .where(eq(webPagesTable.url, options.url))
        .limit(1);

    if (existingPages.length > 0) {
        // Use cached page if it exists
        const cachedPage = existingPages[0];
        return {
            url: cachedPage.url,
            title: cachedPage.title,
            content: cachedPage.content,
            dateAccessed: cachedPage.dateAccessed
        };
    } 

    // If not cached, fetch the web page content
    // In a real implementation, this would fetch from the actual URL
    const webPage: WebPage = {
        url: options.url,
        title: `Page for ${options.url}`,
        content: `This is the content of the web page at ${options.url}`,
        dateAccessed: new Date()
    };

    // Apply translation if requested
    if (options.translateToLanguage) {
        webPage.content = `[Translated to ${options.translateToLanguage}]: ${webPage.content}`;
    }
    
    // Store the fetched web page in the database
    await db.insert(webPagesTable)
        .values({
            requestId: requestId,
            url: webPage.url,
            title: webPage.title,
            content: webPage.content,
            dateAccessed: webPage.dateAccessed
        });

    return webPage;
};

/**
 * Helper function to validate URL format
 */
function isValidUrl(urlString: string): boolean {
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
}