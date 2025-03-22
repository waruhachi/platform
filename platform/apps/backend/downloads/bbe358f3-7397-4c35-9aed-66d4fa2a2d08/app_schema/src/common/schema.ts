import { z } from 'zod';

// Model schemas
export const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

export const projectInfoSchema = z.object({
  name: z.string(),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  teamMembers: z.array(teamMemberSchema),
});

export type ProjectInfo = z.infer<typeof projectInfoSchema>;

export const taskDetailsSchema = z.object({
  projectId: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.string(),
  dueDate: z.coerce.date(),
  estimatedHours: z.number(),
});

export type TaskDetails = z.infer<typeof taskDetailsSchema>;

export const taskStatusUpdateSchema = z.object({
  taskId: z.string(),
  status: z.string(),
  completionPercentage: z.number().int(),
  notes: z.string(),
  updatedDate: z.coerce.date(),
});

export type TaskStatusUpdate = z.infer<typeof taskStatusUpdateSchema>;

export const taskAssignmentSchema = z.object({
  taskId: z.string(),
  assigneeId: z.string(),
  assignedDate: z.coerce.date(),
});

export type TaskAssignment = z.infer<typeof taskAssignmentSchema>;

export const projectQuerySchema = z.object({
  projectId: z.string(),
});

export type ProjectQuery = z.infer<typeof projectQuerySchema>;

export const reportRequestSchema = z.object({
  projectId: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  includeCompletedTasks: z.boolean(),
});

export type ReportRequest = z.infer<typeof reportRequestSchema>;

export const teamWorkloadRequestSchema = z.object({
  teamMemberId: z.string().optional(),
  asOfDate: z.coerce.date(),
});

export type TeamWorkloadRequest = z.infer<typeof teamWorkloadRequestSchema>;

// Function declarations
export declare function createProject(options: ProjectInfo): Promise<string>;

export declare function updateProject(options: ProjectInfo): Promise<void>;

export declare function getProject(options: ProjectQuery): Promise<ProjectInfo>;

export declare function addTask(options: TaskDetails): Promise<string>;

export declare function updateTaskStatus(
  options: TaskStatusUpdate
): Promise<void>;

export declare function assignTask(options: TaskAssignment): Promise<void>;

export declare function generateProjectReport(
  options: ReportRequest
): Promise<unknown>;

export declare function getTeamWorkload(
  options: TeamWorkloadRequest
): Promise<unknown>;
