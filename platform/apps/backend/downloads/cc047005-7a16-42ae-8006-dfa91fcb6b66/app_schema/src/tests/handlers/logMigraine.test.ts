
import { afterEach, beforeEach, describe } from "bun:test";
import { resetDB, createDB } from "../../helpers";
import { expect, it } from "bun:test";
import { db } from "../../db";
import { migraineEventsTable, triggerDataTable, migraineSymptoms, migraineMedications, symptomsTable, medicationsTable } from "../../db/schema/application";
import type { LogMigraineOptions, MigraineEvent, TriggerData } from "../../common/schema";

import { handle as logMigraine } from "../../handlers/logMigraine.ts";


describe("", () => {
    beforeEach(async () => {
        await createDB();
    });

    afterEach(async () => {
        await resetDB();
    });
    
    
    it("should log a migraine event with required fields only", async () => {
      const migraineEvent: MigraineEvent = {
        startTime: new Date("2023-07-15T08:30:00Z"),
        intensity: 7,
        symptoms: ["Aura", "Nausea"]
      };

      const options: LogMigraineOptions = {
        event: migraineEvent
      };

      await logMigraine(options);

      // Check if migraine event was stored
      const events = await db.select().from(migraineEventsTable).execute();
      expect(events).toHaveLength(1);
      expect(events[0].start_time).toEqual(migraineEvent.startTime);
      expect(events[0].intensity).toEqual(migraineEvent.intensity);
      expect(events[0].end_time).toBeNull();
      expect(events[0].notes).toBeNull();

      // Check if symptoms were stored
      const symptomsRelations = await db.select().from(migraineSymptoms).execute();
      expect(symptomsRelations).toHaveLength(2);
    });

    
    
    it("should log a migraine event with all fields", async () => {
      const migraineEvent: MigraineEvent = {
        startTime: new Date("2023-07-15T08:30:00Z"),
        endTime: new Date("2023-07-15T14:30:00Z"),
        intensity: 8,
        symptoms: ["Aura", "Nausea", "Light Sensitivity"],
        medications: ["Sumatriptan", "Ibuprofen"],
        notes: "Severe migraine that lasted 6 hours"
      };

      const options: LogMigraineOptions = {
        event: migraineEvent
      };

      await logMigraine(options);

      // Check if migraine event was stored
      const events = await db.select().from(migraineEventsTable).execute();
      expect(events).toHaveLength(1);
      expect(events[0].start_time).toEqual(migraineEvent.startTime);
      // Fixed: Cast endTime that is definitely defined in this test
      expect(events[0].end_time).toEqual(migraineEvent.endTime as Date);
      expect(events[0].intensity).toEqual(migraineEvent.intensity);
      // Fixed: Cast notes that is definitely defined in this test
      expect(events[0].notes).toEqual(migraineEvent.notes as string);

      // Check if symptoms were stored
      const symptomsRelations = await db.select().from(migraineSymptoms).execute();
      expect(symptomsRelations).toHaveLength(3);

      // Check if medications were stored
      const medicationsRelations = await db.select().from(migraineMedications).execute();
      expect(medicationsRelations).toHaveLength(2);
    });

    
    
    it("should log a migraine event with trigger data", async () => {
      const triggerData: TriggerData = {
        timestamp: new Date("2023-07-15T07:30:00Z"),
        weatherChange: true,
        barometricPressure: 1010.2,
        sleepQuality: 4,
        stressLevel: 8,
        hydrationLevel: 5,
        food: ["Chocolate", "Cheese"],
        notes: "Weather changed suddenly"
      };

      const migraineEvent: MigraineEvent = {
        startTime: new Date("2023-07-15T08:30:00Z"),
        intensity: 6,
        symptoms: ["Throbbing Pain"]
      };

      const options: LogMigraineOptions = {
        event: migraineEvent,
        triggers: triggerData
      };

      await logMigraine(options);

      // Check if migraine event was stored
      const events = await db.select().from(migraineEventsTable).execute();
      expect(events).toHaveLength(1);
      expect(events[0].start_time).toEqual(migraineEvent.startTime);

      // Check if trigger data was stored
      const triggers = await db.select().from(triggerDataTable).execute();
      expect(triggers).toHaveLength(1);
      expect(triggers[0].timestamp).toEqual(triggerData.timestamp);
      // Fixed: Cast optional fields that are definitely defined in this test
      expect(triggers[0].weather_change).toEqual(triggerData.weatherChange as boolean);
      expect(triggers[0].barometric_pressure).toEqual(triggerData.barometricPressure as number);
      expect(triggers[0].sleep_quality).toEqual(triggerData.sleepQuality as number);
      expect(triggers[0].stress_level).toEqual(triggerData.stressLevel as number);
      expect(triggers[0].hydration_level).toEqual(triggerData.hydrationLevel as number);
      expect(triggers[0].notes).toEqual(triggerData.notes as string);
      expect(triggers[0].migraine_id).toEqual(events[0].id);
    });

    
    
    it("should convert ISO string durations to minutes for trigger data", async () => {
      const triggerData: TriggerData = {
        timestamp: new Date("2023-07-15T07:30:00Z"),
        sleepDuration: "PT7H30M", // 7 hours 30 minutes
        screenTime: "PT3H45M",    // 3 hours 45 minutes
        hydrationLevel: 6,
        stressLevel: 7
      };

      const migraineEvent: MigraineEvent = {
        startTime: new Date("2023-07-15T08:30:00Z"),
        intensity: 5,
        symptoms: ["Mild Pain", "Dizziness"]
      };

      const options: LogMigraineOptions = {
        event: migraineEvent,
        triggers: triggerData
      };

      await logMigraine(options);

      // Check if trigger data durations were converted correctly
      const triggers = await db.select().from(triggerDataTable).execute();
      expect(triggers).toHaveLength(1);
      expect(triggers[0].sleep_duration_minutes).toEqual(450); // 7h30m = 450 minutes
      expect(triggers[0].screen_time_minutes).toEqual(225);    // 3h45m = 225 minutes
    });

    
    
    it("should create new symptom records if they don't exist", async () => {
      // First, check if the symptoms table is empty
      const initialSymptoms = await db.select().from(symptomsTable).execute();
      expect(initialSymptoms).toHaveLength(0);

      const migraineEvent: MigraineEvent = {
        startTime: new Date("2023-07-15T08:30:00Z"),
        intensity: 7,
        symptoms: ["Unique Symptom 1", "Unique Symptom 2"]
      };

      const options: LogMigraineOptions = {
        event: migraineEvent
      };

      await logMigraine(options);

      // Check if new symptoms were created
      const createdSymptoms = await db.select().from(symptomsTable).execute();
      expect(createdSymptoms).toHaveLength(2);
      
      // Check if the created symptoms match the input
      const symptomNames = createdSymptoms.map(s => s.name);
      expect(symptomNames).toContain("Unique Symptom 1");
      expect(symptomNames).toContain("Unique Symptom 2");
    });

    
    
    it("should create new medication records if they don't exist", async () => {
      // First, check if the medications table is empty
      const initialMedications = await db.select().from(medicationsTable).execute();
      expect(initialMedications).toHaveLength(0);

      const migraineEvent: MigraineEvent = {
        startTime: new Date("2023-07-15T08:30:00Z"),
        intensity: 7,
        symptoms: ["Headache"],
        medications: ["New Med 1", "New Med 2"]
      };

      const options: LogMigraineOptions = {
        event: migraineEvent
      };

      await logMigraine(options);

      // Check if new medications were created
      const createdMedications = await db.select().from(medicationsTable).execute();
      expect(createdMedications).toHaveLength(2);
      
      // Check if the created medications match the input
      const medicationNames = createdMedications.map(m => m.name);
      expect(medicationNames).toContain("New Med 1");
      expect(medicationNames).toContain("New Med 2");
    });

    
    
    it("should reuse existing symptom and medication records", async () => {
      // First, create a migraine with symptoms and medications
      const firstMigraineEvent: MigraineEvent = {
        startTime: new Date("2023-07-15T08:30:00Z"),
        intensity: 7,
        symptoms: ["Common Symptom", "Another Symptom"],
        medications: ["Common Med"]
      };

      const firstOptions: LogMigraineOptions = {
        event: firstMigraineEvent
      };

      await logMigraine(firstOptions);

      // Get the counts after first insert
      const symptomsAfterFirst = await db.select().from(symptomsTable).execute();
      const medicationsAfterFirst = await db.select().from(medicationsTable).execute();
      
      // Now create a second migraine with some of the same symptoms/medications
      const secondMigraineEvent: MigraineEvent = {
        startTime: new Date("2023-07-16T10:30:00Z"),
        intensity: 5,
        symptoms: ["Common Symptom", "New Symptom"],  // One repeated, one new
        medications: ["Common Med", "Another Med"]    // One repeated, one new
      };

      const secondOptions: LogMigraineOptions = {
        event: secondMigraineEvent
      };

      await logMigraine(secondOptions);

      // Check that only new records were added
      const finalSymptoms = await db.select().from(symptomsTable).execute();
      const finalMedications = await db.select().from(medicationsTable).execute();
      
      expect(finalSymptoms).toHaveLength(symptomsAfterFirst.length + 1); // Only one new symptom
      expect(finalMedications).toHaveLength(medicationsAfterFirst.length + 1); // Only one new medication
    });

    
});