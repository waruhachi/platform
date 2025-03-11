import { db } from "../db";
import type { LogMigraineOptions } from "../common/schema";
import { logMigraine } from "../common/schema";
import { 
  migraineEventsTable, 
  symptomsTable, 
  migraineSymptoms,
  medicationsTable,
  migraineMedications,
  triggerDataTable,
  foodsTable,
  triggerFoods,
  usersTable
} from "../db/schema/application";
import { eq } from "drizzle-orm";

export const handle: typeof logMigraine = async (options: LogMigraineOptions): Promise<void> => {
  return db.transaction(async (tx) => {
    // 1. First, ensure we have a user (for testing purposes)
    // In a real application, you would get the user_id from authentication context
    const existingUsers = await tx.select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, "test@example.com"))
      .limit(1);
    
    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
    } else {
      const [newUser] = await tx.insert(usersTable)
        .values({
          email: "test@example.com",
          name: "Test User"
        })
        .returning({ id: usersTable.id });
      userId = newUser.id;
    }

    // 2. Insert migraine event with the valid user ID
    const [migraineEvent] = await tx.insert(migraineEventsTable).values({
      start_time: options.event.startTime,
      end_time: options.event.endTime || null,
      intensity: options.event.intensity,
      notes: options.event.notes || null,
      user_id: userId
    }).returning({ id: migraineEventsTable.id });

    // 3. Process symptoms (ensuring they exist in the symptoms table)
    for (const symptomName of options.event.symptoms) {
      // Find or create the symptom
      const existingSymptom = await tx.select({ id: symptomsTable.id })
        .from(symptomsTable)
        .where(eq(symptomsTable.name, symptomName))
        .limit(1);
      
      let symptomId;
      if (existingSymptom.length > 0) {
        symptomId = existingSymptom[0].id;
      } else {
        const [newSymptom] = await tx.insert(symptomsTable)
          .values({ name: symptomName })
          .returning({ id: symptomsTable.id });
        symptomId = newSymptom.id;
      }
      
      // Link symptom to migraine event
      await tx.insert(migraineSymptoms).values({
        migraine_id: migraineEvent.id,
        symptom_id: symptomId
      });
    }

    // 4. Process medications if provided
    if (options.event.medications && options.event.medications.length > 0) {
      for (const medicationName of options.event.medications) {
        // Find or create the medication
        const existingMed = await tx.select({ id: medicationsTable.id })
          .from(medicationsTable)
          .where(eq(medicationsTable.name, medicationName))
          .limit(1);
        
        let medId;
        if (existingMed.length > 0) {
          medId = existingMed[0].id;
        } else {
          const [newMed] = await tx.insert(medicationsTable)
            .values({ name: medicationName })
            .returning({ id: medicationsTable.id });
          medId = newMed.id;
        }
        
        // Link medication to migraine event
        await tx.insert(migraineMedications).values({
          migraine_id: migraineEvent.id,
          medication_id: medId
        });
      }
    }

    // 5. Process triggers data if provided
    if (options.triggers) {
      // Helper function to convert ISO duration string to minutes
      const durationToMinutes = (isoDuration: string | undefined): number | null => {
        if (!isoDuration) return null;
        
        // Simple implementation for "PT1H30M" format - in a real app, use a proper duration parser
        let minutes = 0;
        const hourMatch = isoDuration.match(/(\d+)H/);
        if (hourMatch) {
          minutes += parseInt(hourMatch[1]) * 60;
        }
        
        const minuteMatch = isoDuration.match(/(\d+)M/);
        if (minuteMatch) {
          minutes += parseInt(minuteMatch[1]);
        }
        
        return minutes;
      };
      
      const [triggerData] = await tx.insert(triggerDataTable).values({
        migraine_id: migraineEvent.id,
        user_id: userId,
        timestamp: options.triggers.timestamp,
        weather_change: options.triggers.weatherChange,
        barometric_pressure: options.triggers.barometricPressure,
        sleep_quality: options.triggers.sleepQuality,
        sleep_duration_minutes: options.triggers.sleepDuration ? durationToMinutes(options.triggers.sleepDuration) : null,
        stress_level: options.triggers.stressLevel,
        hydration_level: options.triggers.hydrationLevel,
        hormonal_factors: options.triggers.hormonalFactors,
        physical_activity: options.triggers.physicalActivity,
        screen_time_minutes: options.triggers.screenTime ? durationToMinutes(options.triggers.screenTime) : null,
        notes: options.triggers.notes
      }).returning({ id: triggerDataTable.id });
      
      // Process foods if provided
      if (options.triggers.food && options.triggers.food.length > 0) {
        for (const foodName of options.triggers.food) {
          // Find or create the food
          const existingFood = await tx.select({ id: foodsTable.id })
            .from(foodsTable)
            .where(eq(foodsTable.name, foodName))
            .limit(1);
          
          let foodId;
          if (existingFood.length > 0) {
            foodId = existingFood[0].id;
          } else {
            const [newFood] = await tx.insert(foodsTable)
              .values({ name: foodName })
              .returning({ id: foodsTable.id });
            foodId = newFood.id;
          }
          
          // Link food to trigger data
          await tx.insert(triggerFoods).values({
            trigger_id: triggerData.id,
            food_id: foodId
          });
        }
      }
    }
  });
};