import "./helpers.js";

extern dec llm_func(target: unknown, description: string);

extern dec scenario(target: unknown, gherkin: string);
model MigraineEvent {
  startTime: utcDateTime;
  endTime?: utcDateTime;
  intensity: integer; // 1-10 scale
  symptoms: string[];
  medications?: string[];
  notes?: string;
}

model TriggerData {
  timestamp: utcDateTime;
  weatherChange?: boolean;
  barometricPressure?: float;
  sleepQuality?: integer; // 1-10 scale
  sleepDuration?: duration;
  stressLevel?: integer; // 1-10 scale
  food?: string[];
  hydrationLevel?: integer; // 1-10 scale
  hormonalFactors?: boolean;
  physicalActivity?: string;
  screenTime?: duration;
  notes?: string;
}

model LogMigraineOptions {
  event: MigraineEvent;
  triggers?: TriggerData;
}

model LogTriggerOptions {
  data: TriggerData;
}

model PredictionRequest {
  timeframe: duration; // e.g., 24h, 7d
  considerFactors?: string[]; // specific triggers to analyze
}

model HistoryRequest {
  startDate: utcDateTime;
  endDate: utcDateTime;
  includeTriggersData?: boolean;
}

model AnalysisRequest {
  startDate: utcDateTime;
  endDate: utcDateTime;
  triggerType?: string; // analyze specific trigger correlation
}

interface MigraineTracker {
  @scenario("""
  Scenario: Log a migraine episode
  When user says "I'm having a migraine right now, intensity 8 with nausea and light sensitivity"
  Then system should extract:
    - Intensity: 8
    - Symptoms: ["nausea", "light sensitivity"]
    - Start time: current time
  Examples:
    | Input | Expected Details |
    | "Having a moderate headache with visual aura since 2pm" | intensity: 5, symptoms: ["visual aura"], startTime: today 2pm |
    | "Migraine ended 30 minutes ago, took sumatriptan" | endTime: 30 minutes ago, medications: ["sumatriptan"] |
  """)
  @llm_func("Record details about a migraine episode")
  logMigraine(options: LogMigraineOptions): void;

  @scenario("""
  Scenario: Record potential triggers
  When user says "I only slept 5 hours last night and had chocolate"
  Then system should extract:
    - Sleep duration: 5 hours
    - Food: ["chocolate"]
  Examples:
    | Input | Expected Triggers |
    | "Weather changed suddenly today with storm coming" | weatherChange: true |
    | "Feeling very stressed today, level 9" | stressLevel: 9 |
  """)
  @llm_func("Record potential migraine triggers")
  logTrigger(options: LogTriggerOptions): void;

  @scenario("""
  Scenario: Request migraine prediction
  When user asks "Am I likely to get a migraine in the next 48 hours?"
  Then system should analyze data for patterns and predict likelihood
  Examples:
    | Input | Expected Timeframe |
    | "What's my migraine risk for tomorrow?" | timeframe: 24h |
    | "Will I get a migraine this week based on the weather?" | timeframe: 7d, considerFactors: ["weatherChange"] |
  """)
  @llm_func("Predict likelihood of migraine based on triggers and patterns")
  predictMigraine(options: PredictionRequest): string;

  @scenario("""
  Scenario: Query migraine history
  When user asks "Show me my migraine history for the past month"
  Then system should return all migraine events from past 30 days
  Examples:
    | Input | Expected Date Range |
    | "How many migraines did I have last week?" | startDate: 7 days ago, endDate: today |
    | "Show my migraines from January" | startDate: January 1, endDate: January 31 |
  """)
  @llm_func("Retrieve migraine history for a specified time period")
  getMigraineHistory(options: HistoryRequest): MigraineEvent[];

  @scenario("""
  Scenario: Analyze trigger patterns
  When user asks "What seems to trigger my migraines most?"
  Then system should analyze correlation between triggers and migraine events
  Examples:
    | Input | Expected Analysis |
    | "Is lack of sleep causing my migraines?" | triggerType: "sleepDuration" |
    | "Do weather changes affect my migraines?" | triggerType: "weatherChange" |
  """)
  @scenario("""
  Scenario: Generate specific trigger analysis
  When user asks "Show me how chocolate affects my migraines"
  Then system should analyze food trigger specifically for chocolate
  """)
  @llm_func("Analyze correlation between triggers and migraine occurrences")
  analyzeTriggers(options: AnalysisRequest): string;
}