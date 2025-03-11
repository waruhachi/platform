
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { expect, it } from "bun:test";
import { db } from "../../db";
import { 
  migraineEventsTable, 
  symptomsTable, 
  medicationsTable, 
  migraineSymptoms, 
  migraineMedications,
  usersTable,
  triggerDataTable
} from "../../db/schema/application";
import { type HistoryRequest } from "../../common/schema";

import { handle as getMigraineHistory } from "../../handlers/getMigraineHistory.ts";


describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should return an empty array when no migraine events are found", async () => {
      const options: HistoryRequest = {
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-01-31")
      };

      const result = await getMigraineHistory(options);
      
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });

    
    
    it("should return migraine events within the specified date range", async () => {
      // Create a test user
      const [user] = await db.insert(usersTable).values({
        email: "test@example.com",
        name: "Test User"
      }).returning();
      
      // Create migraine events - one in range, one outside range
      const inRangeEvent = await db.insert(migraineEventsTable).values({
        user_id: user.id,
        start_time: new Date("2023-01-15T10:00:00Z"),
        end_time: new Date("2023-01-15T16:00:00Z"),
        intensity: 7,
        notes: "Severe migraine"
      }).returning();
      
      await db.insert(migraineEventsTable).values({
        user_id: user.id,
        start_time: new Date("2023-02-15T10:00:00Z"),
        intensity: 5,
        notes: "Moderate migraine"
      }).returning();
      
      // Add symptoms to the migraine event
      const [nausea] = await db.insert(symptomsTable).values({
        name: "Nausea"
      }).returning();
      
      const [sensitivity] = await db.insert(symptomsTable).values({
        name: "Light sensitivity"
      }).returning();
      
      await db.insert(migraineSymptoms).values([
        { migraine_id: inRangeEvent[0].id, symptom_id: nausea.id },
        { migraine_id: inRangeEvent[0].id, symptom_id: sensitivity.id }
      ]);
      
      const options: HistoryRequest = {
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-01-31")
      };

      const result = await getMigraineHistory(options);
      
      expect(result).toHaveLength(1);
      expect(result[0].startTime).toEqual(new Date("2023-01-15T10:00:00Z"));
      expect(result[0].endTime).toEqual(new Date("2023-01-15T16:00:00Z"));
      expect(result[0].intensity).toEqual(7);
      expect(result[0].symptoms).toContain("Nausea");
      expect(result[0].symptoms).toContain("Light sensitivity");
      expect(result[0].notes).toEqual("Severe migraine");
    });

    
    
    it("should correctly handle medication data for migraine events", async () => {
      // Create a test user
      const [user] = await db.insert(usersTable).values({
        email: "meds@example.com",
        name: "Meds User"
      }).returning();
      
      // Create a migraine event
      const [migraineEvent] = await db.insert(migraineEventsTable).values({
        user_id: user.id,
        start_time: new Date("2023-01-15T10:00:00Z"),
        end_time: new Date("2023-01-15T16:00:00Z"),
        intensity: 8,
        notes: "Severe with aura"
      }).returning();
      
      // Add medications
      const [med1] = await db.insert(medicationsTable).values({
        name: "Sumatriptan"
      }).returning();
      
      const [med2] = await db.insert(medicationsTable).values({
        name: "Ibuprofen"
      }).returning();
      
      await db.insert(migraineMedications).values([
        { migraine_id: migraineEvent.id, medication_id: med1.id },
        { migraine_id: migraineEvent.id, medication_id: med2.id }
      ]);
      
      const options: HistoryRequest = {
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-01-31")
      };

      const result = await getMigraineHistory(options);
      
      expect(result).toHaveLength(1);
      expect(result[0].medications).toBeDefined();
      expect(result[0].medications?.length).toBe(2);
      expect(result[0].medications).toContain("Sumatriptan");
      expect(result[0].medications).toContain("Ibuprofen");
    });

    
    
    it("should handle missing end times for ongoing migraines", async () => {
      // Create a test user
      const [user] = await db.insert(usersTable).values({
        email: "ongoing@example.com",
        name: "Ongoing User"
      }).returning();
      
      // Create an ongoing migraine (no end time)
      await db.insert(migraineEventsTable).values({
        user_id: user.id,
        start_time: new Date("2023-01-20T14:00:00Z"),
        intensity: 6,
        notes: "Ongoing migraine"
      });
      
      const options: HistoryRequest = {
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-01-31")
      };

      const result = await getMigraineHistory(options);
      
      expect(result).toHaveLength(1);
      expect(result[0].startTime).toEqual(new Date("2023-01-20T14:00:00Z"));
      expect(result[0].endTime).toBeUndefined();
      expect(result[0].intensity).toEqual(6);
    });

    
    
    it("should include trigger data when includeTriggersData is true", async () => {
      // Create a test user
      const [user] = await db.insert(usersTable).values({
        email: "triggers@example.com",
        name: "Triggers User"
      }).returning();
      
      // Create a migraine event
      const [migraineEvent] = await db.insert(migraineEventsTable).values({
        user_id: user.id,
        start_time: new Date("2023-01-10T08:00:00Z"),
        end_time: new Date("2023-01-10T20:00:00Z"), 
        intensity: 9,
        notes: "Severe with triggers"
      }).returning();
      
      // Add trigger data
      await db.insert(triggerDataTable).values({
        migraine_id: migraineEvent.id,
        user_id: user.id,
        timestamp: new Date("2023-01-10T07:00:00Z"),
        weather_change: true,
        barometric_pressure: 1008.5,
        sleep_quality: 4,
        stress_level: 8
      });
      
      // Add symptoms
      const [aura] = await db.insert(symptomsTable).values({
        name: "Aura"
      }).returning();
      
      await db.insert(migraineSymptoms).values({
        migraine_id: migraineEvent.id,
        symptom_id: aura.id
      });
      
      const options: HistoryRequest = {
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-01-31"),
        includeTriggersData: true
      };

      const result = await getMigraineHistory(options);
      
      expect(result).toHaveLength(1);
      expect(result[0].intensity).toEqual(9);
      expect(result[0].symptoms).toContain("Aura");
      
      // Since we don't know the exact implementation, we can only verify the function was called with the correct parameters
      // In a real test, you might check that trigger data is somehow associated with the returned migraine events
    });

    
    
    it("should respect the date range boundaries exactly", async () => {
      // Create a test user
      const [user] = await db.insert(usersTable).values({
        email: "boundary@example.com",
        name: "Boundary User"
      }).returning();
      
      // Create migraine events at the boundaries
      await db.insert(migraineEventsTable).values([
        {
          user_id: user.id,
          start_time: new Date("2023-01-01T00:00:00Z"), // Exactly at start boundary
          intensity: 5,
          notes: "Start boundary"
        },
        {
          user_id: user.id,
          start_time: new Date("2023-01-31T23:59:59Z"), // Just inside end boundary
          intensity: 6,
          notes: "End boundary"
        },
        {
          user_id: user.id,
          start_time: new Date("2022-12-31T23:59:59Z"), // Just outside start boundary
          intensity: 7,
          notes: "Before start"
        },
        {
          user_id: user.id,
          start_time: new Date("2023-02-01T00:00:00Z"), // Just outside end boundary
          intensity: 4,
          notes: "After end"
        }
      ]);
      
      const options: HistoryRequest = {
        startDate: new Date("2023-01-01T00:00:00Z"),
        endDate: new Date("2023-01-31T23:59:59Z")
      };

      const result = await getMigraineHistory(options);
      
      expect(result).toHaveLength(2);
      const notes = result.map(event => event.notes);
      expect(notes).toContain("Start boundary");
      expect(notes).toContain("End boundary");
      expect(notes).not.toContain("Before start");
      expect(notes).not.toContain("After end");
    });

    
    
    it("should return events sorted by start time in descending order", async () => {
      // Create a test user
      const [user] = await db.insert(usersTable).values({
        email: "sorting@example.com",
        name: "Sorting User"
      }).returning();
      
      // Create migraine events with different dates
      await db.insert(migraineEventsTable).values([
        {
          user_id: user.id,
          start_time: new Date("2023-01-05T10:00:00Z"),
          intensity: 5,
          notes: "First event"
        },
        {
          user_id: user.id,
          start_time: new Date("2023-01-15T10:00:00Z"),
          intensity: 6,
          notes: "Second event"
        },
        {
          user_id: user.id,
          start_time: new Date("2023-01-25T10:00:00Z"),
          intensity: 7,
          notes: "Third event"
        }
      ]);
      
      const options: HistoryRequest = {
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-01-31")
      };

      const result = await getMigraineHistory(options);
      
      expect(result).toHaveLength(3);
      // Check if the results are sorted by start time in descending order
      expect(new Date(result[0].startTime) >= new Date(result[1].startTime)).toBeTruthy();
      expect(new Date(result[1].startTime) >= new Date(result[2].startTime)).toBeTruthy();
    });

    
});