import { db } from "../db";
import { eq } from "drizzle-orm";
import { type LogTriggerOptions, logTrigger } from "../common/schema";
import { triggerDataTable, foodsTable, triggerFoods } from "../db/schema/application";

/**
 * Logs potential migraine trigger data to the database
 */
export const handle: typeof logTrigger = async (options: LogTriggerOptions): Promise<void> => {
    // Extract data from options
    const { data } = options;
    
    // Convert ISO string durations to minutes if provided
    let sleepDurationMinutes: number | undefined = undefined;
    if (data.sleepDuration) {
        const durationMatch = data.sleepDuration.match(/PT(\d+)H(\d+)M/);
        if (durationMatch) {
            const hours = parseInt(durationMatch[1], 10);
            const minutes = parseInt(durationMatch[2], 10);
            sleepDurationMinutes = hours * 60 + minutes;
        }
    }
    
    let screenTimeMinutes: number | undefined = undefined;
    if (data.screenTime) {
        const screenMatch = data.screenTime.match(/PT(\d+)H(\d+)M/);
        if (screenMatch) {
            const hours = parseInt(screenMatch[1], 10);
            const minutes = parseInt(screenMatch[2], 10);
            screenTimeMinutes = hours * 60 + minutes;
        }
    }
    
    // Assuming user_id is available from the context or auth middleware
    // For demonstration purposes, using a placeholder user ID
    const userId = "00000000-0000-0000-0000-000000000000"; // This should be replaced with actual user ID
    
    // Start a transaction to ensure data consistency
    await db.transaction(async (tx) => {
        // Insert trigger data
        const [insertedTrigger] = await tx.insert(triggerDataTable).values({
            user_id: userId,
            timestamp: data.timestamp,
            weather_change: data.weatherChange,
            barometric_pressure: data.barometricPressure,
            sleep_quality: data.sleepQuality,
            sleep_duration_minutes: sleepDurationMinutes,
            stress_level: data.stressLevel,
            hydration_level: data.hydrationLevel,
            hormonal_factors: data.hormonalFactors,
            physical_activity: data.physicalActivity,
            screen_time_minutes: screenTimeMinutes,
            notes: data.notes
        }).returning({ id: triggerDataTable.id });
        
        // Handle foods if provided
        if (data.food && data.food.length > 0) {
            for (const foodName of data.food) {
                // Check if food exists, if not create it
                const existingFood = await tx.select({ id: foodsTable.id })
                    .from(foodsTable)
                    .where(eq(foodsTable.name, foodName))
                    .limit(1);
                
                let foodId: string;
                
                if (existingFood.length > 0) {
                    foodId = existingFood[0].id;
                } else {
                    // Insert new food
                    const [newFood] = await tx.insert(foodsTable)
                        .values({ name: foodName })
                        .returning({ id: foodsTable.id });
                    foodId = newFood.id;
                }
                
                // Create association between trigger and food
                await tx.insert(triggerFoods).values({
                    trigger_id: insertedTrigger.id,
                    food_id: foodId
                });
            }
        }
    });
};