import {
  pgTable,
  text,
  date,
  serial,
  uuid,
  pgEnum,
  timestamp,
  real,
  integer,
  boolean,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/pg-core';

// Enums
export const priorityEnum = pgEnum('priority', [
  'low',
  'medium',
  'high',
  'critical',
]);
export const statusEnum = pgEnum('status', [
  'not_started',
  'in_progress',
  'on_hold',
  'completed',
]);
export const roleEnum = pgEnum('role', [
  'developer',
  'designer',
  'manager',
  'qa',
  'ux_designer',
  'product_owner',
]);

// Projects Table
export const projectsTable = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Team Members Table
export const teamMembersTable = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Team Members (Junction Table)
export const projectTeamMembersTable = pgTable(
  'project_team_members',
  {
    projectId: uuid('project_id')
      .references(() => projectsTable.id, { onDelete: 'cascade' })
      .notNull(),
    teamMemberId: uuid('team_member_id')
      .references(() => teamMembersTable.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.projectId, table.teamMemberId] }),
    };
  }
);

// Tasks Table
export const tasksTable = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projectsTable.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  priority: priorityEnum('priority').default('medium').notNull(),
  dueDate: date('due_date'),
  estimatedHours: real('estimated_hours'),
  currentStatus: statusEnum('current_status').default('not_started').notNull(),
  completionPercentage: integer('completion_percentage').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Task Status Updates Table
export const taskStatusUpdatesTable = pgTable('task_status_updates', {
  id: serial('id').primaryKey(),
  taskId: uuid('task_id')
    .references(() => tasksTable.id, { onDelete: 'cascade' })
    .notNull(),
  status: statusEnum('status').notNull(),
  completionPercentage: integer('completion_percentage').notNull(),
  notes: text('notes'),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Task Assignments Table
export const taskAssignmentsTable = pgTable('task_assignments', {
  id: serial('id').primaryKey(),
  taskId: uuid('task_id')
    .references(() => tasksTable.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  assigneeId: uuid('assignee_id').references(() => teamMembersTable.id, {
    onDelete: 'set null',
  }),
  assignedDate: timestamp('assigned_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reports Table (to store generated reports)
export const reportsTable = pgTable('reports', {
  id: serial('id').primaryKey(),
  projectId: uuid('project_id')
    .references(() => projectsTable.id, { onDelete: 'cascade' })
    .notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  includeCompletedTasks: boolean('include_completed_tasks')
    .default(true)
    .notNull(),
  reportData: text('report_data'), // JSON data stored as text
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
});

// Workload Snapshots Table (to store workload reports)
export const workloadSnapshotsTable = pgTable('workload_snapshots', {
  id: serial('id').primaryKey(),
  teamMemberId: uuid('team_member_id').references(() => teamMembersTable.id, {
    onDelete: 'cascade',
  }),
  asOfDate: date('as_of_date').notNull(),
  workloadData: text('workload_data'), // JSON data stored as text
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
});
