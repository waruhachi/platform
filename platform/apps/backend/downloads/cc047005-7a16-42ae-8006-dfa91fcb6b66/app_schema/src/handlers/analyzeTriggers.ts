import { db } from "../db";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { migraineEventsTable, triggerDataTable, migraineSymptoms, symptomsTable, migraineMedications, medicationsTable, triggerFoods, foodsTable } from "../db/schema/application";
import type { AnalysisRequest } from "../common/schema";
import { analyzeTriggers } from "../common/schema";

export const handle: typeof analyzeTriggers = async (options: AnalysisRequest): Promise<string> => {
    const { startDate, endDate, triggerType } = options;

    // Get all migraine events in the date range
    const migraineEvents = await db
        .select()
        .from(migraineEventsTable)
        .where(
            and(
                gte(migraineEventsTable.start_time, startDate),
                lte(migraineEventsTable.start_time, endDate)
            )
        )
        .orderBy(desc(migraineEventsTable.start_time));

    if (migraineEvents.length === 0) {
        return "No migraine events found within the specified date range.";
    }

    // Get all trigger data associated with these migraines
    const migraineIds = migraineEvents.map(event => event.id);
    const triggerData = await db
        .select()
        .from(triggerDataTable)
        .where(
            sql`${triggerDataTable.migraine_id} = ANY(${migraineIds})`
        );

    // If a specific trigger type is requested, filter analysis for that trigger
    if (triggerType) {
        return await analyzeSpecificTrigger(migraineEvents, triggerData, triggerType, startDate, endDate);
    }

    // General analysis of all triggers
    return await generateGeneralAnalysis(migraineEvents, triggerData, startDate, endDate);
};

async function analyzeSpecificTrigger(
    migraineEvents: any[],
    triggerData: any[],
    triggerType: string,
    startDate: Date,
    endDate: Date
): Promise<string> {
    let analysis = `Analysis of ${triggerType} as a migraine trigger from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}:\n\n`;

    switch (triggerType.toLowerCase()) {
        case "weather":
            // Analyze weather-related triggers
            const weatherTriggers = triggerData.filter(t => t.weather_change === true);
            analysis += `Weather changes were reported in ${weatherTriggers.length} out of ${migraineEvents.length} migraine events (${Math.round(weatherTriggers.length / migraineEvents.length * 100)}%).\n`;
            
            if (weatherTriggers.length > 0) {
                const pressureReadings = triggerData
                    .filter(t => t.barometric_pressure !== null)
                    .map(t => t.barometric_pressure);
                
                if (pressureReadings.length > 0) {
                    const avgPressure = pressureReadings.reduce((sum, val) => sum + val, 0) / pressureReadings.length;
                    analysis += `Average barometric pressure during migraine events: ${avgPressure.toFixed(2)} hPa.\n`;
                }
            }
            break;

        case "sleep":
            // Analyze sleep-related triggers
            const sleepData = triggerData.filter(t => t.sleep_quality !== null || t.sleep_duration_minutes !== null);
            
            if (sleepData.length > 0) {
                const qualityReadings = sleepData
                    .filter(t => t.sleep_quality !== null)
                    .map(t => t.sleep_quality);
                
                if (qualityReadings.length > 0) {
                    const avgQuality = qualityReadings.reduce((sum, val) => sum + val!, 0) / qualityReadings.length;
                    analysis += `Average sleep quality before migraine events: ${avgQuality.toFixed(1)}/10.\n`;
                }
                
                const durationReadings = sleepData
                    .filter(t => t.sleep_duration_minutes !== null)
                    .map(t => t.sleep_duration_minutes);
                
                if (durationReadings.length > 0) {
                    const avgDuration = durationReadings.reduce((sum, val) => sum + val!, 0) / durationReadings.length;
                    analysis += `Average sleep duration before migraine events: ${Math.floor(avgDuration / 60)} hours ${Math.round(avgDuration % 60)} minutes.\n`;
                }
            } else {
                analysis += "Not enough sleep data recorded during this period for meaningful analysis.\n";
            }
            break;

        case "stress":
            // Analyze stress-related triggers
            const stressData = triggerData.filter(t => t.stress_level !== null);
            
            if (stressData.length > 0) {
                const stressLevels = stressData.map(t => t.stress_level!);
                const avgStress = stressLevels.reduce((sum, val) => sum + val, 0) / stressLevels.length;
                
                analysis += `Average stress level before migraine events: ${avgStress.toFixed(1)}/10.\n`;
                
                const highStressCount = stressLevels.filter(level => level >= 7).length;
                analysis += `${highStressCount} out of ${stressData.length} migraines (${Math.round(highStressCount / stressData.length * 100)}%) occurred during periods of high stress (level 7 or higher).\n`;
            } else {
                analysis += "Not enough stress data recorded during this period for meaningful analysis.\n";
            }
            break;

        case "food":
            // Analyze food triggers
            const triggerIds = triggerData.map(t => t.id);
            const foodEntries = await db
                .select({
                    trigger_id: triggerFoods.trigger_id,
                    food_name: foodsTable.name
                })
                .from(triggerFoods)
                .innerJoin(foodsTable, eq(triggerFoods.food_id, foodsTable.id))
                .where(sql`${triggerFoods.trigger_id} = ANY(${triggerIds})`);

            if (foodEntries.length > 0) {
                // Count occurrences of each food
                const foodCounts: Record<string, number> = {};
                foodEntries.forEach(entry => {
                    foodCounts[entry.food_name] = (foodCounts[entry.food_name] || 0) + 1;
                });
                
                // Sort foods by frequency
                const sortedFoods = Object.entries(foodCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5); // Top 5 foods
                
                analysis += "Most common foods consumed before migraines:\n";
                sortedFoods.forEach(([food, count], index) => {
                    analysis += `${index + 1}. ${food} (${count} occurrences, ${Math.round(count / migraineEvents.length * 100)}% of migraines)\n`;
                });
            } else {
                analysis += "Not enough food data recorded during this period for meaningful analysis.\n";
            }
            break;

        case "hydration":
            // Analyze hydration-related triggers
            const hydrationData = triggerData.filter(t => t.hydration_level !== null);
            
            if (hydrationData.length > 0) {
                const hydrationLevels = hydrationData.map(t => t.hydration_level!);
                const avgHydration = hydrationLevels.reduce((sum, val) => sum + val, 0) / hydrationLevels.length;
                
                analysis += `Average hydration level before migraine events: ${avgHydration.toFixed(1)}/10.\n`;
                
                const lowHydrationCount = hydrationLevels.filter(level => level <= 4).length;
                analysis += `${lowHydrationCount} out of ${hydrationData.length} migraines (${Math.round(lowHydrationCount / hydrationData.length * 100)}%) occurred during periods of low hydration (level 4 or lower).\n`;
            } else {
                analysis += "Not enough hydration data recorded during this period for meaningful analysis.\n";
            }
            break;

        case "hormonal":
            // Analyze hormonal-related triggers
            const hormonalData = triggerData.filter(t => t.hormonal_factors !== null);
            
            if (hormonalData.length > 0) {
                const hormonalCount = hormonalData.filter(t => t.hormonal_factors === true).length;
                analysis += `Hormonal factors were reported in ${hormonalCount} out of ${hormonalData.length} migraine events (${Math.round(hormonalCount / hormonalData.length * 100)}%).\n`;
            } else {
                analysis += "Not enough hormonal data recorded during this period for meaningful analysis.\n";
            }
            break;

        default:
            analysis = `Trigger type '${triggerType}' is not recognized. Available types for analysis include: weather, sleep, stress, food, hydration, and hormonal.`;
    }

    return analysis;
}

async function generateGeneralAnalysis(
    migraineEvents: any[],
    triggerData: any[],
    startDate: Date,
    endDate: Date
): Promise<string> {
    let analysis = `General migraine trigger analysis from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}:\n\n`;
    
    // Count migraines and calculate average intensity
    const totalMigraines = migraineEvents.length;
    const avgIntensity = migraineEvents.reduce((sum, event) => sum + event.intensity, 0) / totalMigraines;
    analysis += `Total migraines: ${totalMigraines}\n`;
    analysis += `Average intensity: ${avgIntensity.toFixed(1)}/10\n\n`;
    
    // Calculate migraine duration when available
    const eventsWithDuration = migraineEvents.filter(event => event.end_time !== null);
    if (eventsWithDuration.length > 0) {
        const durations = eventsWithDuration.map(event => 
            (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60) // duration in minutes
        );
        const avgDurationMinutes = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
        const hours = Math.floor(avgDurationMinutes / 60);
        const minutes = Math.round(avgDurationMinutes % 60);
        analysis += `Average duration: ${hours} hours ${minutes} minutes\n\n`;
    }
    
    // Analyze potential triggers
    analysis += "Potential triggers:\n";
    
    // Weather triggers
    const weatherTriggers = triggerData.filter(t => t.weather_change === true);
    if (weatherTriggers.length > 0) {
        const percentage = Math.round(weatherTriggers.length / triggerData.length * 100);
        analysis += `- Weather changes: ${percentage}% of migraines\n`;
    }
    
    // Sleep quality
    const sleepQualityData = triggerData.filter(t => t.sleep_quality !== null);
    if (sleepQualityData.length > 0) {
        const avgQuality = sleepQualityData.reduce((sum, t) => sum + t.sleep_quality!, 0) / sleepQualityData.length;
        analysis += `- Average sleep quality: ${avgQuality.toFixed(1)}/10\n`;
    }
    
    // Stress level
    const stressData = triggerData.filter(t => t.stress_level !== null);
    if (stressData.length > 0) {
        const avgStress = stressData.reduce((sum, t) => sum + t.stress_level!, 0) / stressData.length;
        analysis += `- Average stress level: ${avgStress.toFixed(1)}/10\n`;
    }
    
    // Hydration level
    const hydrationData = triggerData.filter(t => t.hydration_level !== null);
    if (hydrationData.length > 0) {
        const avgHydration = hydrationData.reduce((sum, t) => sum + t.hydration_level!, 0) / hydrationData.length;
        analysis += `- Average hydration level: ${avgHydration.toFixed(1)}/10\n`;
    }
    
    // Hormonal factors
    const hormonalData = triggerData.filter(t => t.hormonal_factors === true);
    if (hormonalData.length > 0) {
        const percentage = Math.round(hormonalData.length / triggerData.length * 100);
        analysis += `- Hormonal factors: ${percentage}% of migraines\n`;
    }
    
    // Common foods
    const triggerIds = triggerData.map(t => t.id);
    if (triggerIds.length > 0) {
        const foodEntries = await db
            .select({
                trigger_id: triggerFoods.trigger_id,
                food_name: foodsTable.name
            })
            .from(triggerFoods)
            .innerJoin(foodsTable, eq(triggerFoods.food_id, foodsTable.id))
            .where(sql`${triggerFoods.trigger_id} = ANY(${triggerIds})`);
        
        if (foodEntries.length > 0) {
            // Count occurrences of each food
            const foodCounts: Record<string, number> = {};
            foodEntries.forEach(entry => {
                foodCounts[entry.food_name] = (foodCounts[entry.food_name] || 0) + 1;
            });
            
            // Get top 3 foods
            const topFoods = Object.entries(foodCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
            
            if (topFoods.length > 0) {
                analysis += "- Common foods before migraines:\n";
                topFoods.forEach(([food, count]) => {
                    const percentage = Math.round(count / triggerData.length * 100);
                    analysis += `  • ${food} (${percentage}%)\n`;
                });
            }
        }
    }
    
    // Common symptoms
    const migraineIds = migraineEvents.map(event => event.id);
    if (migraineIds.length > 0) {
        const symptomEntries = await db
            .select({
                migraine_id: migraineSymptoms.migraine_id,
                symptom_name: symptomsTable.name
            })
            .from(migraineSymptoms)
            .innerJoin(symptomsTable, eq(migraineSymptoms.symptom_id, symptomsTable.id))
            .where(sql`${migraineSymptoms.migraine_id} = ANY(${migraineIds})`);
        
        if (symptomEntries.length > 0) {
            // Count occurrences of each symptom
            const symptomCounts: Record<string, number> = {};
            symptomEntries.forEach(entry => {
                symptomCounts[entry.symptom_name] = (symptomCounts[entry.symptom_name] || 0) + 1;
            });
            
            // Get top symptoms
            const topSymptoms = Object.entries(symptomCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            
            if (topSymptoms.length > 0) {
                analysis += "\nMost common symptoms:\n";
                topSymptoms.forEach(([symptom, count]) => {
                    const percentage = Math.round(count / migraineEvents.length * 100);
                    analysis += `- ${symptom} (${percentage}%)\n`;
                });
            }
        }
    }
    
    // Log analysis to database
    await db.insert(analysisRequestsTable).values({
        user_id: migraineEvents[0].user_id, // Assuming all events belong to same user
        start_date: startDate,
        end_date: endDate,
        trigger_type: null, // General analysis
        result: analysis
    });
    
    return analysis;
}