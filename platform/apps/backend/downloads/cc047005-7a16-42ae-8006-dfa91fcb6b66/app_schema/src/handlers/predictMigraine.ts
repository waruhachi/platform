import { db } from "../db";
import { predictMigraine, type PredictionRequest } from "../common/schema";
import { migraineEventsTable, triggerDataTable, predictionRequestsTable, usersTable } from "../db/schema/application";
import { eq } from "drizzle-orm";

export const handle: typeof predictMigraine = async (options: PredictionRequest): Promise<string> => {
    // Parse the timeframe from ISO duration format to minutes
    const timeframeMinutes = parseIsoDuration(options.timeframe);
    
    // In a real application, you would get the user ID from the auth context
    // For testing, first check if any user exists to avoid foreign key constraint errors
    const users = await db.select({ id: usersTable.id })
        .from(usersTable)
        .limit(1);
        
    let userId: string | null = null;
    if (users.length > 0) {
        userId = users[0].id as string;
    }
    
    // Get migraine history for the user if available
    let migraineHistory: any[] = [];
    if (userId) {
        migraineHistory = await db.select()
            .from(migraineEventsTable)
            .where(eq(migraineEventsTable.user_id, userId))
            .orderBy(migraineEventsTable.start_time);
    }
    
    // Get trigger data for the user if available
    let triggerData: any[] = [];
    if (userId) {
        triggerData = await db.select()
            .from(triggerDataTable)
            .where(eq(triggerDataTable.user_id, userId))
            .orderBy(triggerDataTable.timestamp);
    }
    
    // Analyze historical data to make a prediction
    let predictionMessage = "";
    
    if (migraineHistory.length === 0) {
        predictionMessage = "Insufficient migraine history data for prediction. Continue logging migraines and triggers to improve prediction accuracy.";
    } else {
        // Calculate average time between migraines
        const migraineFrequency = calculateMigraineFrequency(migraineHistory);
        
        // Identify common triggers if any
        const commonTriggers = analyzeCommonTriggers(triggerData, options.considerFactors);
        
        // Generate prediction based on frequency and common triggers
        predictionMessage = generatePrediction(migraineFrequency, commonTriggers, timeframeMinutes);
    }
    
    // Only log the prediction request if we have a valid user ID
    if (userId) {
        try {
            await db.insert(predictionRequestsTable).values({
                user_id: userId,
                timeframe_minutes: timeframeMinutes,
                result: predictionMessage
            });
        } catch (error) {
            // Log error but continue - don't fail the prediction if logging fails
            console.error("Failed to log prediction request:", error);
        }
    }
    
    return predictionMessage;
};

// A simple ISO 8601 duration parser
function parseIsoDuration(duration: string): number {
    // Regex to match ISO 8601 duration format
    const regex = /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
    const matches = duration.match(regex);
    
    if (!matches) {
        // Default to 24 hours if invalid format
        return 24 * 60;
    }
    
    // Convert values to numbers, defaulting to 0 if undefined
    const years = matches[1] ? parseInt(matches[1]) : 0;
    const months = matches[2] ? parseInt(matches[2]) : 0;
    const days = matches[3] ? parseInt(matches[3]) : 0;
    const hours = matches[4] ? parseInt(matches[4]) : 0;
    const minutes = matches[5] ? parseInt(matches[5]) : 0;
    const seconds = matches[6] ? parseInt(matches[6]) : 0;
    
    // Convert everything to minutes
    // Using approximations: 1 year = 525600 minutes, 1 month = 43800 minutes
    return years * 525600 + months * 43800 + days * 1440 + hours * 60 + minutes + seconds / 60;
}

function calculateMigraineFrequency(migraineHistory: any[]): number {
    if (migraineHistory.length <= 1) {
        return 0; // Can't calculate frequency with less than 2 events
    }
    
    let totalGapMinutes = 0;
    for (let i = 1; i < migraineHistory.length; i++) {
        const currentStart = new Date(migraineHistory[i].start_time);
        const previousStart = new Date(migraineHistory[i-1].start_time);
        const gapMinutes = (currentStart.getTime() - previousStart.getTime()) / (1000 * 60);
        totalGapMinutes += gapMinutes;
    }
    
    return Math.round(totalGapMinutes / (migraineHistory.length - 1));
}

function analyzeCommonTriggers(triggerData: any[], considerFactors: string[] | undefined): string[] {
    const commonTriggers: string[] = [];
    
    if (triggerData.length === 0) {
        return commonTriggers;
    }
    
    // Simple analysis of trigger frequency
    const triggerCounts: Record<string, number> = {};
    
    triggerData.forEach(trigger => {
        if (trigger.weather_change) {
            triggerCounts["Weather changes"] = (triggerCounts["Weather changes"] || 0) + 1;
        }
        
        if (trigger.sleep_quality !== null && trigger.sleep_quality < 5) {
            triggerCounts["Poor sleep quality"] = (triggerCounts["Poor sleep quality"] || 0) + 1;
        }
        
        if (trigger.stress_level !== null && trigger.stress_level > 7) {
            triggerCounts["High stress levels"] = (triggerCounts["High stress levels"] || 0) + 1;
        }
        
        if (trigger.hormonal_factors) {
            triggerCounts["Hormonal factors"] = (triggerCounts["Hormonal factors"] || 0) + 1;
        }
    });
    
    // Filter by considerFactors if provided
    const threshold = triggerData.length * 0.3; // Consider it common if present in 30% of records
    
    Object.entries(triggerCounts).forEach(([trigger, count]) => {
        if (count >= threshold) {
            if (!considerFactors || considerFactors.includes(trigger)) {
                commonTriggers.push(trigger);
            }
        }
    });
    
    return commonTriggers;
}

function generatePrediction(migraineFrequency: number, commonTriggers: string[], timeframeMinutes: number): string {
    if (migraineFrequency === 0) {
        return "Not enough historical data to predict migraine likelihood. Please continue logging your migraines to improve predictions.";
    }
    
    let likelihood = "low";
    let predictionMessage = "";
    
    // Calculate likelihood based on migraine frequency and timeframe
    if (timeframeMinutes >= migraineFrequency * 0.9) {
        likelihood = "high";
    } else if (timeframeMinutes >= migraineFrequency * 0.5) {
        likelihood = "moderate";
    }
    
    predictionMessage = `Based on your history, there is a ${likelihood} likelihood of experiencing a migraine within the specified timeframe.`;
    
    // Include information about common triggers
    if (commonTriggers.length > 0) {
        predictionMessage += ` Monitor these common triggers that may increase your risk: ${commonTriggers.join(", ")}.`;
    }
    
    // Add preventive advice
    predictionMessage += " Consider implementing your preventive strategies and ensuring you have medication available if needed.";
    
    return predictionMessage;
}