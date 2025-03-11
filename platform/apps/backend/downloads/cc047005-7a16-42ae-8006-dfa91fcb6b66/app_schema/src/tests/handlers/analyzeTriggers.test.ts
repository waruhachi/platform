
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { expect, it } from "bun:test";
import { db } from "../../db";
import { 
  usersTable, 
  migraineEventsTable, 
  triggerDataTable, 
  symptomsTable,
  migraineSymptoms,
  medicationsTable,
  migraineMedications,
  foodsTable,
  triggerFoods,
  analysisRequestsTable
} from "../../db/schema/application";
import { type AnalysisRequest } from "../../common/schema";
import { eq } from "drizzle-orm";

import { handle as analyzeTriggers } from "../../handlers/analyzeTriggers.ts";


describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should analyze triggers with provided date range", async () => {
      // Create a user
      const [user] = await db.insert(usersTable)
        .values({
          email: "test@example.com",
          name: "Test User"
        })
        .returning();

      // Create migraine events
      const [migraineEvent1] = await db.insert(migraineEventsTable)
        .values({
          user_id: user.id,
          start_time: new Date("2023-01-01T10:00:00Z"),
          end_time: new Date("2023-01-01T16:00:00Z"),
          intensity: 7
        })
        .returning();

      const [migraineEvent2] = await db.insert(migraineEventsTable)
        .values({
          user_id: user.id,
          start_time: new Date("2023-01-10T08:00:00Z"),
          end_time: new Date("2023-01-10T18:00:00Z"),
          intensity: 8
        })
        .returning();

      // Create trigger data for the migraines
      await db.insert(triggerDataTable)
        .values({
          migraine_id: migraineEvent1.id,
          user_id: user.id,
          timestamp: new Date("2023-01-01T09:00:00Z"),
          weather_change: true,
          stress_level: 8,
          sleep_quality: 4
        });

      await db.insert(triggerDataTable)
        .values({
          migraine_id: migraineEvent2.id,
          user_id: user.id,
          timestamp: new Date("2023-01-10T07:00:00Z"),
          weather_change: true,
          stress_level: 9,
          sleep_quality: 3
        });

      // Run the analysis
      const analysisRequest: AnalysisRequest = {
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-31T23:59:59Z")
      };

      const result = await analyzeTriggers(analysisRequest);

      // Verify result contains expected content
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      
      // Verify the analysis request was logged
      const savedRequests = await db.select()
        .from(analysisRequestsTable)
        .where(eq(analysisRequestsTable.user_id, user.id));
      
      expect(savedRequests.length).toBe(1);
      expect(savedRequests[0].start_date.toISOString()).toBe(analysisRequest.startDate.toISOString());
      expect(savedRequests[0].end_date.toISOString()).toBe(analysisRequest.endDate.toISOString());
      expect(savedRequests[0].result).toEqual(result);
    });

    
    
    it("should analyze triggers by specific trigger type", async () => {
      // Create a user
      const [user] = await db.insert(usersTable)
        .values({
          email: "test2@example.com",
          name: "Test User 2"
        })
        .returning();

      // Create migraine events
      const [migraineEvent1] = await db.insert(migraineEventsTable)
        .values({
          user_id: user.id,
          start_time: new Date("2023-02-01T10:00:00Z"),
          end_time: new Date("2023-02-01T16:00:00Z"),
          intensity: 7
        })
        .returning();

      const [migraineEvent2] = await db.insert(migraineEventsTable)
        .values({
          user_id: user.id,
          start_time: new Date("2023-02-10T08:00:00Z"),
          end_time: new Date("2023-02-10T18:00:00Z"),
          intensity: 8
        })
        .returning();

      // Create trigger data for the migraines with weather changes
      await db.insert(triggerDataTable)
        .values({
          migraine_id: migraineEvent1.id,
          user_id: user.id,
          timestamp: new Date("2023-02-01T09:00:00Z"),
          weather_change: true,
          barometric_pressure: 1010.5
        });

      await db.insert(triggerDataTable)
        .values({
          migraine_id: migraineEvent2.id,
          user_id: user.id,
          timestamp: new Date("2023-02-10T07:00:00Z"),
          weather_change: true,
          barometric_pressure: 998.2
        });

      // Run the analysis specifically for weather triggers
      const analysisRequest: AnalysisRequest = {
        startDate: new Date("2023-02-01T00:00:00Z"),
        endDate: new Date("2023-02-28T23:59:59Z"),
        triggerType: "weather"
      };

      const result = await analyzeTriggers(analysisRequest);

      // Verify result contains expected content
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(result.toLowerCase()).toContain("weather");
      
      // Verify the analysis request was logged with the trigger type
      const savedRequests = await db.select()
        .from(analysisRequestsTable)
        .where(eq(analysisRequestsTable.user_id, user.id));
      
      expect(savedRequests.length).toBe(1);
      expect(savedRequests[0].trigger_type).toBe("weather");
    });

    
    
    it("should analyze complex triggers including food and medications", async () => {
      // Create a user
      const [user] = await db.insert(usersTable)
        .values({
          email: "test3@example.com",
          name: "Test User 3"
        })
        .returning();

      // Create food entries
      const [food1] = await db.insert(foodsTable)
        .values({ name: "Chocolate" })
        .returning();
      
      const [food2] = await db.insert(foodsTable)
        .values({ name: "Red Wine" })
        .returning();

      // Create medication entries
      const [medication1] = await db.insert(medicationsTable)
        .values({ name: "Ibuprofen" })
        .returning();

      // Create migraine events
      const [migraineEvent] = await db.insert(migraineEventsTable)
        .values({
          user_id: user.id,
          start_time: new Date("2023-03-15T14:00:00Z"),
          end_time: new Date("2023-03-15T22:00:00Z"),
          intensity: 9,
          notes: "Severe migraine with aura"
        })
        .returning();

      // Create trigger data with food triggers
      const [triggerData] = await db.insert(triggerDataTable)
        .values({
          migraine_id: migraineEvent.id,
          user_id: user.id,
          timestamp: new Date("2023-03-15T12:00:00Z"),
          weather_change: false,
          stress_level: 6,
          sleep_quality: 7,
          hydration_level: 4
        })
        .returning();

      // Associate foods with trigger
      await db.insert(triggerFoods)
        .values([
          { trigger_id: triggerData.id, food_id: food1.id },
          { trigger_id: triggerData.id, food_id: food2.id }
        ]);

      // Associate medication with migraine
      await db.insert(migraineMedications)
        .values({ migraine_id: migraineEvent.id, medication_id: medication1.id });

      // Create symptom
      const [symptom1] = await db.insert(symptomsTable)
        .values({ name: "Visual Aura" })
        .returning();

      const [symptom2] = await db.insert(symptomsTable)
        .values({ name: "Nausea" })
        .returning();

      // Associate symptoms with migraine
      await db.insert(migraineSymptoms)
        .values([
          { migraine_id: migraineEvent.id, symptom_id: symptom1.id },
          { migraine_id: migraineEvent.id, symptom_id: symptom2.id }
        ]);

      // Run the analysis for food triggers
      const analysisRequest: AnalysisRequest = {
        startDate: new Date("2023-03-01T00:00:00Z"),
        endDate: new Date("2023-03-31T23:59:59Z"),
        triggerType: "food"
      };

      const result = await analyzeTriggers(analysisRequest);

      // Verify result contains expected content
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      
      // A good analysis should mention the foods
      expect(result.toLowerCase().includes("chocolate") || 
             result.toLowerCase().includes("red wine") || 
             result.toLowerCase().includes("food")).toBe(true);
    });

    
    
    it("should return empty analysis when no data exists in requested period", async () => {
      // Create a user
      const [user] = await db.insert(usersTable)
        .values({
          email: "test4@example.com",
          name: "Test User 4"
        })
        .returning();

      // Create migraine events outside the analysis period
      await db.insert(migraineEventsTable)
        .values({
          user_id: user.id,
          start_time: new Date("2023-05-01T10:00:00Z"),
          end_time: new Date("2023-05-01T16:00:00Z"),
          intensity: 6
        });

      // Run the analysis for a period with no data
      const analysisRequest: AnalysisRequest = {
        startDate: new Date("2023-04-01T00:00:00Z"),
        endDate: new Date("2023-04-30T23:59:59Z")
      };

      const result = await analyzeTriggers(analysisRequest);

      // Verify result contains expected content for no-data scenario
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      
      // The analysis should indicate no data or patterns found
      expect(result.toLowerCase().includes("no") || 
             result.toLowerCase().includes("insufficient") || 
             result.toLowerCase().includes("not enough") ||
             result.toLowerCase().includes("no data")).toBe(true);
      
      // Verify the analysis request was still logged
      const savedRequests = await db.select()
        .from(analysisRequestsTable)
        .where(eq(analysisRequestsTable.user_id, user.id));
      
      expect(savedRequests.length).toBe(1);
    });

    
    
    it("should handle analysis with all possible trigger factors present", async () => {
      // Create a user
      const [user] = await db.insert(usersTable)
        .values({
          email: "test5@example.com",
          name: "Test User 5"
        })
        .returning();

      // Create migraine events
      const [migraineEvent] = await db.insert(migraineEventsTable)
        .values({
          user_id: user.id,
          start_time: new Date("2023-06-15T08:00:00Z"),
          end_time: new Date("2023-06-15T20:00:00Z"),
          intensity: 10,
          notes: "One of the worst migraines"
        })
        .returning();

      // Create food entry
      const [food] = await db.insert(foodsTable)
        .values({ name: "Processed Food" })
        .returning();

      // Create comprehensive trigger data with all factors
      const [triggerData] = await db.insert(triggerDataTable)
        .values({
          migraine_id: migraineEvent.id,
          user_id: user.id,
          timestamp: new Date("2023-06-15T07:00:00Z"),
          weather_change: true,
          barometric_pressure: 985.3,
          sleep_quality: 2,
          sleep_duration_minutes: 300, // 5 hours
          stress_level: 9,
          hydration_level: 3,
          hormonal_factors: true,
          physical_activity: "High intensity workout",
          screen_time_minutes: 480, // 8 hours
          notes: "High stress day with poor sleep and dehydration"
        })
        .returning();

      // Associate food with trigger
      await db.insert(triggerFoods)
        .values({ trigger_id: triggerData.id, food_id: food.id });

      // Run comprehensive analysis
      const analysisRequest: AnalysisRequest = {
        startDate: new Date("2023-06-01T00:00:00Z"),
        endDate: new Date("2023-06-30T23:59:59Z")
      };

      const result = await analyzeTriggers(analysisRequest);

      // Verify result contains comprehensive analysis
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      
      // Check that the analysis request was logged with the result
      const savedRequests = await db.select()
        .from(analysisRequestsTable)
        .where(eq(analysisRequestsTable.user_id, user.id));
      
      expect(savedRequests.length).toBe(1);
      expect(savedRequests[0].result).toEqual(result);
    });

    
});