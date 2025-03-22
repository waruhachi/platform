import "./helpers.js";

extern dec llm_func(target: unknown, description: string);

extern dec scenario(target: unknown, gherkin: string);
model TimeZoneConversionRequest {
  sourceTime: offsetDateTime;
  sourceTimeZone: string;
  targetTimeZone: string;
}

model TimeZoneConversionResult {
  sourceTime: offsetDateTime;
  targetTime: offsetDateTime;
  sourceTimeZone: string;
  targetTimeZone: string;
}

model Participant {
  name: string;
  email: string;
  timeZone?: string;
}

model MeetingRequest {
  title: string;
  description?: string;
  startTime: offsetDateTime;
  durationMinutes: integer;
  participants: Participant[];
  timeZone: string;
  location?: string;
}

model Meeting extends MeetingRequest {
  id: string;
  createdAt: offsetDateTime;
  updatedAt?: offsetDateTime;
}

model ListMeetingsRequest {
  startDate?: offsetDateTime;
  endDate?: offsetDateTime;
  participantEmail?: string;
}

model CancelMeetingRequest {
  meetingId: string;
  sendNotification?: boolean;
}

model UpdateMeetingRequest {
  meetingId: string;
  title?: string;
  description?: string;
  startTime?: offsetDateTime;
  durationMinutes?: integer;
  participants?: Participant[];
  timeZone?: string;
  location?: string;
}

interface TimeZoneAndMeetingBot {
  @scenario(
  """
  Scenario: Converting time between two timezones
  When user says "Convert 3:00 PM EST to PST"
  Then system should extract:
      - Source time: 3:00 PM
      - Source timezone: EST
      - Target timezone: PST
  And return the equivalent time in PST
  
  Examples:
      | Input                            | Output                              |
      | "Convert 3:00 PM EST to PST"      | "3:00 PM EST is 12:00 PM PST"       |
      | "What is 9:30 AM JST in GMT"      | "9:30 AM JST is 12:30 AM GMT"       |
      | "Convert 14:15 IST to EDT"        | "14:15 IST is 4:45 AM EDT"          |
  """
  )
  @llm_func("Convert a time from one timezone to another")
  convertTimeZone(options: TimeZoneConversionRequest): TimeZoneConversionResult;

  @scenario(
  """
  Scenario: Scheduling a meeting with multiple participants
  When user says "Book a meeting with John and Mary for tomorrow at 10 AM for 30 minutes titled Project Review"
  Then system should extract:
      - Title: Project Review
      - Start time: tomorrow 10:00 AM
      - Duration: 30 minutes
      - Participants: John, Mary
  And create a new meeting with those details
  
  Examples:
      | Input                                                                    | Outcome                                           |
      | "Schedule a team sync at 2 PM next Monday for 1 hour"                     | Meeting scheduled for next Monday at 2:00 PM      |
      | "Book a 45-minute call with Sarah at 11:30 tomorrow titled Sales Review"  | 45-minute meeting scheduled with Sarah            |
  """
  )
  @llm_func("Schedule a new meeting with specified participants")
  bookMeeting(options: MeetingRequest): Meeting;

  @scenario(
  """
  Scenario: Retrieving scheduled meetings
  When user says "Show me my meetings for next week"
  Then system should extract:
      - Date range: next week (Monday through Sunday)
  And return all meetings within that time period
  
  Examples:
      | Input                                | Expected Output                                |
      | "What meetings do I have tomorrow?"   | List of meetings scheduled for tomorrow       |
      | "Show me my meetings for next week"   | List of meetings scheduled for next week      |
      | "List meetings with John this month"  | Meetings with John scheduled this month       |
  """
  )
  @llm_func("List scheduled meetings filtered by date range or participants")
  listMeetings(options: ListMeetingsRequest): Meeting[];

  @scenario(
  """
  Scenario: Cancelling a scheduled meeting
  When user says "Cancel my 2 PM meeting with marketing team"
  Then system should identify the meeting at 2 PM with marketing team
  And cancel that meeting
  
  Examples:
      | Input                                      | Outcome                              |
      | "Cancel my 3 PM meeting tomorrow"           | Meeting at 3 PM tomorrow cancelled   |
      | "Delete the project sync meeting on Friday" | Project sync meeting cancelled       |
  """
  )
  @llm_func("Cancel a previously scheduled meeting")
  cancelMeeting(options: CancelMeetingRequest): boolean;

  @scenario(
  """
  Scenario: Updating an existing meeting
  When user says "Change my 3 PM meeting to 4 PM"
  Then system should identify the meeting at 3 PM
  And update the start time to 4 PM
  
  Scenario: Updating meeting participants
  When user says "Add Alex to my project review meeting tomorrow"
  Then system should identify the project review meeting
  And add Alex to the participant list
  
  Examples:
      | Input                                      | Outcome                                   |
      | "Move my 9 AM meeting to 10 AM"            | Meeting time updated from 9 AM to 10 AM   |
      | "Change the budget review to 45 minutes"   | Budget review duration updated to 45 min  |
      | "Add Lisa to my team sync on Thursday"     | Lisa added to Thursday's team sync        |
  """
  )
  @llm_func("Update details of an existing meeting")
  updateMeeting(options: UpdateMeetingRequest): Meeting;
}