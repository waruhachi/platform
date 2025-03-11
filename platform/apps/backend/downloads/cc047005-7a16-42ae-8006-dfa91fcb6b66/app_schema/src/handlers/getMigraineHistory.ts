import { db } from "../db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import type { HistoryRequest, MigraineEvent } from "../common/schema";
import { getMigraineHistory } from "../common/schema";
import { 
  migraineEventsTable,
  migraineSymptoms,
  symptomsTable,
  migraineMedications,
  medicationsTable,
  triggerDataTable
} from "../db/schema/application";

export const handle: typeof getMigraineHistory = async (options: HistoryRequest): Promise<MigraineEvent[]> => {
  // Start with base query to get migraine events within the date range
  // Add orderBy to sort events by start_time in descending order
  const migraineEvents = await db
    .select()
    .from(migraineEventsTable)
    .where(
      and(
        gte(migraineEventsTable.start_time, options.startDate),
        lte(migraineEventsTable.start_time, options.endDate)
      )
    )
    .orderBy(desc(migraineEventsTable.start_time)); // Sort by start_time in descending order

  // Build array of migraine events with all required data
  const migraineEventsWithDetails: MigraineEvent[] = [];

  for (const event of migraineEvents) {
    // Get symptoms for this migraine event
    const symptoms = await db
      .select({
        name: symptomsTable.name
      })
      .from(migraineSymptoms)
      .innerJoin(symptomsTable, eq(migraineSymptoms.symptom_id, symptomsTable.id))
      .where(eq(migraineSymptoms.migraine_id, event.id));

    // Get medications for this migraine event
    const medications = await db
      .select({
        name: medicationsTable.name
      })
      .from(migraineMedications)
      .innerJoin(medicationsTable, eq(migraineMedications.medication_id, medicationsTable.id))
      .where(eq(migraineMedications.migraine_id, event.id));

    // Build migraine event object
    const migraineEvent: MigraineEvent = {
      startTime: event.start_time,
      intensity: event.intensity,
      symptoms: symptoms.map(s => s.name),
      notes: event.notes || undefined
    };

    // Add optional fields if they exist
    if (event.end_time) {
      migraineEvent.endTime = event.end_time;
    }

    if (medications.length > 0) {
      migraineEvent.medications = medications.map(m => m.name);
    }

    migraineEventsWithDetails.push(migraineEvent);
  }

  // If we need to include trigger data
  if (options.includeTriggersData) {
    for (const migraineEvent of migraineEventsWithDetails) {
      const migraineDbEntry = migraineEvents.find(
        e => e.start_time.getTime() === migraineEvent.startTime.getTime()
      );
      
      if (migraineDbEntry) {
        const triggerData = await db
          .select()
          .from(triggerDataTable)
          .where(eq(triggerDataTable.migraine_id, migraineDbEntry.id))
          .limit(1);
          
        if (triggerData.length > 0) {
          // Add trigger data to the migraine event
          // Note: We're not modifying the MigraineEvent type itself,
          // but tests indicate the data should be included
          (migraineEvent as any).triggerData = triggerData[0];
        }
      }
    }
  }

  return migraineEventsWithDetails;
};