import "./helpers.js";

extern dec llm_func(target: unknown, description: string);

extern dec scenario(target: unknown, gherkin: string);
model ProjectInfo {
  name: string;
  description: string;
  startDate: plainDate;
  endDate: plainDate;
  teamMembers: TeamMember[];
}

model TeamMember {
  id: string;
  name: string;
  role: string;
}

model TaskDetails {
  projectId: string;
  title: string;
  description: string;
  priority: string;
  dueDate: plainDate;
  estimatedHours: float;
}

model TaskStatusUpdate {
  taskId: string;
  status: string;
  completionPercentage: integer;
  notes: string;
  updatedDate: utcDateTime;
}

model TaskAssignment {
  taskId: string;
  assigneeId: string;
  assignedDate: utcDateTime;
}

model ProjectQuery {
  projectId: string;
}

model ReportRequest {
  projectId: string;
  startDate: plainDate;
  endDate: plainDate;
  includeCompletedTasks: boolean;
}

model TeamWorkloadRequest {
  teamMemberId?: string;
  asOfDate: plainDate;
}

interface ProjectManager {
  @scenario("""
  Scenario: Creating a new project
  When user says "Create a new project called Mobile App Redesign starting next Monday and ending in 3 months"
  Then system should extract:
    - Project name: "Mobile App Redesign"
    - Start date: next Monday
    - End date: 3 months after start date
  Examples:
    | Input | Expected Output |
    | "Start a new project called Website Revamp with deadline of December 15th" | ProjectInfo with name "Website Revamp" and endDate of 2023-12-15 |
    | "Create project Backend API with team members John (developer) and Sarah (QA)" | ProjectInfo with name "Backend API" and teamMembers containing John and Sarah |
  """)
  @llm_func("Create a new project with specified details")
  createProject(options: ProjectInfo): string;

  @scenario("""
  Scenario: Updating project details
  When user says "Update the Mobile App project end date to November 30th"
  Then system should extract:
    - Project name: "Mobile App"
    - New end date: November 30th
  Examples:
    | Input | Expected Output |
    | "Change the Website Revamp project description to 'Complete redesign of company website'" | Updated project with new description |
    | "Add Emma as UX designer to the Mobile App project" | Updated project with new team member |
  """)
  @llm_func("Update existing project details")
  updateProject(options: ProjectInfo): void;

  @scenario("""
  Scenario: Getting project information
  When user says "Show me details about the Website Redesign project"
  Then system should retrieve and display all project information
  Examples:
    | Input | Expected Output |
    | "What's the status of the API project?" | Complete project details for API project |
    | "Tell me about the Mobile App project" | Complete project details for Mobile App project |
  """)
  @llm_func("Retrieve project information")
  getProject(options: ProjectQuery): ProjectInfo;

  @scenario("""
  Scenario: Adding a new task
  When user says "Add a task to design login screen for the Mobile App project, high priority, due next Friday"
  Then system should extract:
    - Project: "Mobile App"
    - Task title: "Design login screen"
    - Priority: "high"
    - Due date: next Friday
  Examples:
    | Input | Expected Output |
    | "Create task to implement API authentication for Backend project due in two weeks" | New task with title "Implement API authentication" |
    | "Add a low priority task to update documentation, estimate 4 hours" | New task with priority "low" and estimatedHours 4.0 |
  """)
  @llm_func("Add a new task to a project")
  addTask(options: TaskDetails): string;

  @scenario("""
  Scenario: Updating task status
  When user says "Update the login screen design task to 75% complete"
  Then system should extract:
    - Task reference: "login screen design"
    - Completion percentage: 75
  Examples:
    | Input | Expected Output |
    | "Mark the API authentication task as completed" | Updated task with status "completed" and 100% completion |
    | "Change documentation task status to in progress with note: started first draft" | Updated task with status "in progress" and note |
  """)
  @llm_func("Update the status of an existing task")
  updateTaskStatus(options: TaskStatusUpdate): void;

  @scenario("""
  Scenario: Assigning tasks to team members
  When user says "Assign the login screen design task to Jessica"
  Then system should extract:
    - Task reference: "login screen design"
    - Assignee: "Jessica"
  Examples:
    | Input | Expected Output |
    | "Give the API documentation task to John" | Task assigned to team member with name "John" |
    | "Make Sarah responsible for QA testing" | Task assigned to team member with name "Sarah" |
  """)
  @llm_func("Assign a task to a team member")
  assignTask(options: TaskAssignment): void;

  @scenario("""
  Scenario: Generating project report
  When user says "Generate a report for the Mobile App project for this month"
  Then system should extract:
    - Project: "Mobile App"
    - Date range: current month
  Examples:
    | Input | Expected Output |
    | "Show me a report of Website project progress from last week" | Report for Website project covering last week |
    | "Give me a summary of all active tasks in the Backend project" | Report for Backend project with active tasks only |
  """)
  @llm_func("Generate a comprehensive project status report")
  generateProjectReport(options: ReportRequest): unknown;

  @scenario("""
  Scenario: Checking team workload
  When user says "What's John's current workload?"
  Then system should extract:
    - Team member: "John"
    - Time reference: "current"
  Examples:
    | Input | Expected Output |
    | "Show me what tasks Sarah is working on" | List of tasks assigned to Sarah |
    | "Give me the team workload for next week" | Workload report for all team members for next week |
  """)
  @llm_func("View team member workload and assignments")
  getTeamWorkload(options: TeamWorkloadRequest): unknown;
}model ProjectInfo {
  name: string;
  description: string;
  startDate: plainDate;
  endDate: plainDate;
  teamMembers: TeamMember[];
}

model TeamMember {
  id: string;
  name: string;
  role: string;
}

model TaskDetails {
  projectId: string;
  title: string;
  description: string;
  priority: string;
  dueDate: plainDate;
  estimatedHours: float;
}

model TaskStatusUpdate {
  taskId: string;
  status: string;
  completionPercentage: integer;
  notes: string;
  updatedDate: utcDateTime;
}

model TaskAssignment {
  taskId: string;
  assigneeId: string;
  assignedDate: utcDateTime;
}

model ProjectQuery {
  projectId: string;
}

model ReportRequest {
  projectId: string;
  startDate: plainDate;
  endDate: plainDate;
  includeCompletedTasks: boolean;
}

model TeamWorkloadRequest {
  teamMemberId?: string;
  asOfDate: plainDate;
}

interface ProjectManager {
  @scenario("""
  Scenario: Creating a new project
  When user says "Create a new project called Mobile App Redesign starting next Monday and ending in 3 months"
  Then system should extract:
    - Project name: "Mobile App Redesign"
    - Start date: next Monday
    - End date: 3 months after start date
  Examples:
    | Input | Expected Output |
    | "Start a new project called Website Revamp with deadline of December 15th" | ProjectInfo with name "Website Revamp" and endDate of 2023-12-15 |
    | "Create project Backend API with team members John (developer) and Sarah (QA)" | ProjectInfo with name "Backend API" and teamMembers containing John and Sarah |
  """)
  @llm_func("Create a new project with specified details")
  createProject(options: ProjectInfo): string;

  @scenario("""
  Scenario: Updating project details
  When user says "Update the Mobile App project end date to November 30th"
  Then system should extract:
    - Project name: "Mobile App"
    - New end date: November 30th
  Examples:
    | Input | Expected Output |
    | "Change the Website Revamp project description to 'Complete redesign of company website'" | Updated project with new description |
    | "Add Emma as UX designer to the Mobile App project" | Updated project with new team member |
  """)
  @llm_func("Update existing project details")
  updateProject(options: ProjectInfo): void;

  @scenario("""
  Scenario: Getting project information
  When user says "Show me details about the Website Redesign project"
  Then system should retrieve and display all project information
  Examples:
    | Input | Expected Output |
    | "What's the status of the API project?" | Complete project details for API project |
    | "Tell me about the Mobile App project" | Complete project details for Mobile App project |
  """)
  @llm_func("Retrieve project information")
  getProject(options: ProjectQuery): ProjectInfo;

  @scenario("""
  Scenario: Adding a new task
  When user says "Add a task to design login screen for the Mobile App project, high priority, due next Friday"
  Then system should extract:
    - Project: "Mobile App"
    - Task title: "Design login screen"
    - Priority: "high"
    - Due date: next Friday
  Examples:
    | Input | Expected Output |
    | "Create task to implement API authentication for Backend project due in two weeks" | New task with title "Implement API authentication" |
    | "Add a low priority task to update documentation, estimate 4 hours" | New task with priority "low" and estimatedHours 4.0 |
  """)
  @llm_func("Add a new task to a project")
  addTask(options: TaskDetails): string;

  @scenario("""
  Scenario: Updating task status
  When user says "Update the login screen design task to 75% complete"
  Then system should extract:
    - Task reference: "login screen design"
    - Completion percentage: 75
  Examples:
    | Input | Expected Output |
    | "Mark the API authentication task as completed" | Updated task with status "completed" and 100% completion |
    | "Change documentation task status to in progress with note: started first draft" | Updated task with status "in progress" and note |
  """)
  @llm_func("Update the status of an existing task")
  updateTaskStatus(options: TaskStatusUpdate): void;

  @scenario("""
  Scenario: Assigning tasks to team members
  When user says "Assign the login screen design task to Jessica"
  Then system should extract:
    - Task reference: "login screen design"
    - Assignee: "Jessica"
  Examples:
    | Input | Expected Output |
    | "Give the API documentation task to John" | Task assigned to team member with name "John" |
    | "Make Sarah responsible for QA testing" | Task assigned to team member with name "Sarah" |
  """)
  @llm_func("Assign a task to a team member")
  assignTask(options: TaskAssignment): void;

  @scenario("""
  Scenario: Generating project report
  When user says "Generate a report for the Mobile App project for this month"
  Then system should extract:
    - Project: "Mobile App"
    - Date range: current month
  Examples:
    | Input | Expected Output |
    | "Show me a report of Website project progress from last week" | Report for Website project covering last week |
    | "Give me a summary of all active tasks in the Backend project" | Report for Backend project with active tasks only |
  """)
  @llm_func("Generate a comprehensive project status report")
  generateProjectReport(options: ReportRequest): unknown;

  @scenario("""
  Scenario: Checking team workload
  When user says "What's John's current workload?"
  Then system should extract:
    - Team member: "John"
    - Time reference: "current"
  Examples:
    | Input | Expected Output |
    | "Show me what tasks Sarah is working on" | List of tasks assigned to Sarah |
    | "Give me the team workload for next week" | Workload report for all team members for next week |
  """)
  @llm_func("View team member workload and assignments")
  getTeamWorkload(options: TeamWorkloadRequest): unknown;
}