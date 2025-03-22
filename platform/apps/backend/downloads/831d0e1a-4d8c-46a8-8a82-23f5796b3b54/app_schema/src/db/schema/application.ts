import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Meetings table
export const meetingsTable = pgTable(
  'meetings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    timeZone: text('time_zone').notNull(),
    location: text('location'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  (table) => {
    return {
      startTimeIdx: index('meeting_date_idx').on(table.startTime),
    };
  }
);

// Participants table
export const participantsTable = pgTable(
  'participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    timeZone: text('time_zone'),
  },
  (table) => {
    return {
      emailIdx: index('participant_email_idx').on(table.email),
    };
  }
);

// Meeting participants junction table (for many-to-many relationship)
export const meetingParticipantsTable = pgTable(
  'meeting_participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    meetingId: uuid('meeting_id')
      .notNull()
      .references(() => meetingsTable.id, { onDelete: 'cascade' }),
    participantId: uuid('participant_id')
      .notNull()
      .references(() => participantsTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      meetingParticipantIdx: index('meeting_participant_idx').on(
        table.meetingId,
        table.participantId
      ),
      // To prevent duplicate participants in the same meeting
      uniqueMeetingParticipant: uniqueIndex(
        'unique_meeting_participant_idx'
      ).on(table.meetingId, table.participantId),
    };
  }
);

// TimeZone conversion logs (to keep track of conversions if needed)
export const timeZoneConversionsTable = pgTable('time_zone_conversions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceTime: timestamp('source_time', { withTimezone: true }).notNull(),
  targetTime: timestamp('target_time', { withTimezone: true }).notNull(),
  sourceTimeZone: text('source_time_zone').notNull(),
  targetTimeZone: text('target_time_zone').notNull(),
  convertedAt: timestamp('converted_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Define relations
export const meetingsRelations = relations(meetingsTable, ({ many }) => ({
  participants: many(meetingParticipantsTable),
}));

export const participantsRelations = relations(
  participantsTable,
  ({ many }) => ({
    meetings: many(meetingParticipantsTable),
  })
);

export const meetingParticipantsRelations = relations(
  meetingParticipantsTable,
  ({ one }) => ({
    meeting: one(meetingsTable, {
      fields: [meetingParticipantsTable.meetingId],
      references: [meetingsTable.id],
    }),
    participant: one(participantsTable, {
      fields: [meetingParticipantsTable.participantId],
      references: [participantsTable.id],
    }),
  })
);
