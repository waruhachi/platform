
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { expect, it } from "bun:test";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { triggerDataTable, foodsTable, triggerFoods, usersTable } from "../../db/schema/application";
import { type LogTriggerOptions } from "../../common/schema";

import { handle as logTrigger } from "../../handlers/logTrigger.ts";


describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should log basic trigger data", async () => {
      // Set up test user
      await db.insert(usersTable).values({
        id: "test-user-1",
        email: "test1@example.com",
        name: "Test User"
      });

      const options: LogTriggerOptions = {
        data: {
          timestamp: new Date("2023-06-15T14:00:00Z"),
          weatherChange: true,
          barometricPressure: 1013.25,
          sleepQuality: 6,
          stressLevel: 8,
          hydrationLevel: 5,
          notes: "Feeling stressed today"
        }
      };

      await logTrigger(options);

      const records = await db.select().from(triggerDataTable).where(eq(triggerDataTable.user_id, "test-user-1"));
      
      expect(records).toHaveLength(1);
      expect(records[0].weather_change).toBe(true);
      expect(records[0].barometric_pressure).toBe(1013.25);
      expect(records[0].sleep_quality).toBe(6);
      expect(records[0].stress_level).toBe(8);
      expect(records[0].hydration_level).toBe(5);
      expect(records[0].notes).toBe("Feeling stressed today");
    });

    
    
    it("should convert ISO duration strings to minutes", async () => {
      // Set up test user
      await db.insert(usersTable).values({
        id: "test-user-2",
        email: "test2@example.com",
        name: "Test User 2"
      });

      const options: LogTriggerOptions = {
        data: {
          timestamp: new Date("2023-06-16T10:30:00Z"),
          sleepDuration: "PT7H30M", // 7 hours 30 minutes
          screenTime: "PT3H15M",    // 3 hours 15 minutes
          sleepQuality: 7
        }
      };

      await logTrigger(options);

      const records = await db.select().from(triggerDataTable).where(eq(triggerDataTable.user_id, "test-user-2"));
      
      expect(records).toHaveLength(1);
      expect(records[0].sleep_duration_minutes).toBe(450); // 7h30m = 450 minutes
      expect(records[0].screen_time_minutes).toBe(195);    // 3h15m = 195 minutes
    });

    
    
    it("should handle food entries correctly", async () => {
      // Set up test user
      await db.insert(usersTable).values({
        id: "test-user-3",
        email: "test3@example.com",
        name: "Test User 3"
      });

      const options: LogTriggerOptions = {
        data: {
          timestamp: new Date("2023-06-17T19:45:00Z"),
          food: ["Chocolate", "Red Wine", "Aged Cheese"],
          notes: "Dinner with friends"
        }
      };

      await logTrigger(options);

      // Get the trigger record
      const triggerRecords = await db.select().from(triggerDataTable).where(eq(triggerDataTable.user_id, "test-user-3"));
      expect(triggerRecords).toHaveLength(1);
      
      const triggerId = triggerRecords[0].id;
      
      // Check the many-to-many relationship was created
      const triggerFoodRecords = await db.select()
        .from(triggerFoods)
        .where(eq(triggerFoods.trigger_id, triggerId));
      
      expect(triggerFoodRecords.length).toBe(3); // Should have 3 food associations
      
      // Verify food items exist (this checks the insertion logic worked)
      const foodNames = await db.select({ name: foodsTable.name })
        .from(foodsTable)
        .innerJoin(triggerFoods, eq(triggerFoods.food_id, foodsTable.id))
        .where(eq(triggerFoods.trigger_id, triggerId));
      
      const foodNamesList = foodNames.map(f => f.name);
      expect(foodNamesList).toContain("Chocolate");
      expect(foodNamesList).toContain("Red Wine");
      expect(foodNamesList).toContain("Aged Cheese");
    });

    
    
    it("should handle all possible trigger data fields", async () => {
      // Set up test user
      await db.insert(usersTable).values({
        id: "test-user-4",
        email: "test4@example.com",
        name: "Test User 4"
      });

      const options: LogTriggerOptions = {
        data: {
          timestamp: new Date("2023-06-18T08:15:00Z"),
          weatherChange: true,
          barometricPressure: 1005.75,
          sleepQuality: 3,
          sleepDuration: "PT5H45M",
          stressLevel: 9,
          food: ["Coffee", "Skipped breakfast"],
          hydrationLevel: 4,
          hormonalFactors: true,
          physicalActivity: "Light stretching",
          screenTime: "PT1H30M",
          notes: "Woke up with headache"
        }
      };

      await logTrigger(options);

      const records = await db.select().from(triggerDataTable).where(eq(triggerDataTable.user_id, "test-user-4"));
      
      expect(records).toHaveLength(1);
      expect(records[0].weather_change).toBe(true);
      expect(records[0].barometric_pressure).toBe(1005.75);
      expect(records[0].sleep_quality).toBe(3);
      expect(records[0].sleep_duration_minutes).toBe(345); // 5h45m = 345 minutes
      expect(records[0].stress_level).toBe(9);
      expect(records[0].hydration_level).toBe(4);
      expect(records[0].hormonal_factors).toBe(true);
      expect(records[0].physical_activity).toBe("Light stretching");
      expect(records[0].screen_time_minutes).toBe(90); // 1h30m = 90 minutes
      expect(records[0].notes).toBe("Woke up with headache");
      
      // Check food items
      const triggerId = records[0].id;
      const foodNames = await db.select({ name: foodsTable.name })
        .from(foodsTable)
        .innerJoin(triggerFoods, eq(triggerFoods.food_id, foodsTable.id))
        .where(eq(triggerFoods.trigger_id, triggerId));
      
      const foodNamesList = foodNames.map(f => f.name);
      expect(foodNamesList).toContain("Coffee");
      expect(foodNamesList).toContain("Skipped breakfast");
    });

    
    
    it("should handle minimal trigger data", async () => {
      // Set up test user
      await db.insert(usersTable).values({
        id: "test-user-5",
        email: "test5@example.com",
        name: "Test User 5"
      });

      // Only timestamp is mandatory in TriggerData
      const options: LogTriggerOptions = {
        data: {
          timestamp: new Date("2023-06-19T12:00:00Z")
        }
      };

      await logTrigger(options);

      const records = await db.select().from(triggerDataTable).where(eq(triggerDataTable.user_id, "test-user-5"));
      
      expect(records).toHaveLength(1);
      expect(records[0].timestamp).toEqual(new Date("2023-06-19T12:00:00Z"));
      // All other fields should be null
      expect(records[0].weather_change).toBe(null);
      expect(records[0].barometric_pressure).toBe(null);
      expect(records[0].sleep_quality).toBe(null);
    });

    
});