import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// --- Users ---
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  username: text('username').notNull(),
  xp: integer('xp').default(0),
  level: integer('level').default(1),
  streak: integer('streak').default(0),
  last_active_at: integer('last_active_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
  microsoft_id: text('microsoft_id').unique(),
  avatar_url: text('avatar_url'),
  role: text('role', { enum: ['student', 'teacher', 'admin'] }).default('student'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const usersRelations = relations(users, ({ many }) => ({
  studySets: many(studySets),
  classes: many(classes),
  classMembers: many(classMembers),
  progress: many(userProgress),
  activities: many(activityLogs),
}));

// --- Study Sets ---
export const studySets = sqliteTable('study_sets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  owner_id: integer('owner_id').notNull(), // Foreign key to users.id
  title: text('title').notNull(),
  description: text('description'),
  is_public: integer('is_public', { mode: 'boolean' }).default(false),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const studySetsRelations = relations(studySets, ({ one, many }) => ({
  owner: one(users, {
    fields: [studySets.owner_id],
    references: [users.id],
  }),
  terms: many(terms),
}));

// --- Terms ---
export const terms = sqliteTable('terms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  set_id: integer('set_id').notNull(), // Foreign key to study_sets.id
  term: text('term').notNull(),
  definition: text('definition').notNull(),
  image_url: text('image_url'),
});

export const termsRelations = relations(terms, ({ one }) => ({
  studySet: one(studySets, {
    fields: [terms.set_id],
    references: [studySets.id],
  }),
}));

// --- User Progress (Learn Mode) ---
export const userProgress = sqliteTable('user_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull(),
  term_id: integer('term_id').notNull(),
  mastery_level: integer('mastery_level').default(0), // 0-5
  last_studied_at: integer('last_studied_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.user_id],
    references: [users.id],
  }),
  term: one(terms, {
    fields: [userProgress.term_id],
    references: [terms.id],
  }),
}));

// --- Classes ---
export const classes = sqliteTable('classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  owner_id: integer('owner_id').notNull(),
  join_code: text('join_code').notNull().unique(),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const classesRelations = relations(classes, ({ one, many }) => ({
  owner: one(users, {
    fields: [classes.owner_id],
    references: [users.id],
  }),
  members: many(classMembers),
}));

// --- Class Members ---
export const classMembers = sqliteTable('class_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  class_id: integer('class_id').notNull(),
  user_id: integer('user_id').notNull(),
  role: text('role').default('student'), // 'student' or 'admin'
  joined_at: integer('joined_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const classMembersRelations = relations(classMembers, ({ one }) => ({
  class: one(classes, {
    fields: [classMembers.class_id],
    references: [classes.id],
  }),
  user: one(users, {
    fields: [classMembers.user_id],
    references: [users.id],
  }),
}));

// --- Activity Logs (Leaderboards) ---
export const activityLogs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull(),
  class_id: integer('class_id'), // Optional, if activity is relevant to a class context
  set_id: integer('set_id'), // Optional, which set was played
  activity_type: text('activity_type').notNull(), // 'set_studied', 'match_completed', 'term_mastered'
  game_mode: text('game_mode'), // 'learn', 'match', 'write', 'listening'
  score: integer('score'), // Points or Time (seconds)
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.user_id],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [activityLogs.class_id],
    references: [classes.id],
  }),
}));

// --- Assignments ---
export const assignments = sqliteTable('assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  class_id: integer('class_id').notNull(),
  set_id: integer('set_id').notNull(),
  assigned_by: integer('assigned_by').notNull(),
  due_date: integer('due_date', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  class: one(classes, {
    fields: [assignments.class_id],
    references: [classes.id],
  }),
  studySet: one(studySets, {
    fields: [assignments.set_id],
    references: [studySets.id],
  }),
  assigner: one(users, {
    fields: [assignments.assigned_by],
    references: [users.id],
  }),
}));
