import { z } from 'zod';

// Basic schemas
export const offsetDateTimeSchema = z.coerce.date();
export type OffsetDateTime = z.infer<typeof offsetDateTimeSchema>;

// Time Zone Conversion schemas
export const timeZoneConversionRequestSchema = z.object({
  sourceTime: offsetDateTimeSchema,
  sourceTimeZone: z.string(),
  targetTimeZone: z.string(),
});
export type TimeZoneConversionRequest = z.infer<
  typeof timeZoneConversionRequestSchema
>;

export const timeZoneConversionResultSchema = z.object({
  sourceTime: offsetDateTimeSchema,
  targetTime: offsetDateTimeSchema,
  sourceTimeZone: z.string(),
  targetTimeZone: z.string(),
});
export type TimeZoneConversionResult = z.infer<
  typeof timeZoneConversionResultSchema
>;

// Participant schema
export const participantSchema = z.object({
  name: z.string(),
  email: z.string(),
  timeZone: z.string().optional(),
});
export type Participant = z.infer<typeof participantSchema>;

// Meeting schemas
export const meetingRequestSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  startTime: offsetDateTimeSchema,
  durationMinutes: z.number().int(),
  participants: z.array(participantSchema),
  timeZone: z.string(),
  location: z.string().optional(),
});
export type MeetingRequest = z.infer<typeof meetingRequestSchema>;

export const meetingSchema = meetingRequestSchema.extend({
  id: z.string(),
  createdAt: offsetDateTimeSchema,
  updatedAt: offsetDateTimeSchema.optional(),
});
export type Meeting = z.infer<typeof meetingSchema>;

export const listMeetingsRequestSchema = z.object({
  startDate: offsetDateTimeSchema.optional(),
  endDate: offsetDateTimeSchema.optional(),
  participantEmail: z.string().optional(),
});
export type ListMeetingsRequest = z.infer<typeof listMeetingsRequestSchema>;

export const cancelMeetingRequestSchema = z.object({
  meetingId: z.string(),
  sendNotification: z.boolean().optional(),
});
export type CancelMeetingRequest = z.infer<typeof cancelMeetingRequestSchema>;

export const updateMeetingRequestSchema = z.object({
  meetingId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  startTime: offsetDateTimeSchema.optional(),
  durationMinutes: z.number().int().optional(),
  participants: z.array(participantSchema).optional(),
  timeZone: z.string().optional(),
  location: z.string().optional(),
});
export type UpdateMeetingRequest = z.infer<typeof updateMeetingRequestSchema>;

// Function declarations matching the interface
export declare function convertTimeZone(
  options: TimeZoneConversionRequest
): Promise<TimeZoneConversionResult>;
export declare function bookMeeting(options: MeetingRequest): Promise<Meeting>;
export declare function listMeetings(
  options: ListMeetingsRequest
): Promise<Meeting[]>;
export declare function cancelMeeting(
  options: CancelMeetingRequest
): Promise<boolean>;
export declare function updateMeeting(
  options: UpdateMeetingRequest
): Promise<Meeting>;
