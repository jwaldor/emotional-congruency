import { pgTable, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Profiles table - linked to Supabase auth.users
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // This will match auth.users.id
  email: text('email').notNull(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Access codes table for referral system
export const accessCodes = pgTable('access_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  createdById: uuid('created_by_id').references(() => profiles.id),
  isGeneral: boolean('is_general').default(false).notNull(), // true for admin-generated codes
  maxUses: integer('max_uses').default(1).notNull(),
  currentUses: integer('current_uses').default(0).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Updated Analysis table (renamed from Result to match new naming)
export const analyses = pgTable('analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id), // nullable for anonymous access
  inputText: text('input_text').notNull(), // The transcript from the voice recording
  analysisText: text('analysis_text').notNull(), // The AI-generated insights
  analyzedEmotions: text('analyzed_emotions'), // JSON string of the emotions that were analyzed
  analysisType: text('analysis_type').default('original').notNull(), // Type of analysis performed
  accessCodeUsed: uuid('access_code_used').references(() => accessCodes.id), // Track which access code was used
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Feedback table
export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisId: uuid('analysis_id').references(() => analyses.id), // Updated reference
  email: text('email'), // Optional email for follow-up
  feedbackText: text('feedback_text').notNull(), // The feedback text
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  analyses: many(analyses),
  accessCodes: many(accessCodes),
}));

export const accessCodesRelations = relations(accessCodes, ({ one, many }) => ({
  createdBy: one(profiles, {
    fields: [accessCodes.createdById],
    references: [profiles.id],
  }),
  analyses: many(analyses),
}));

export const analysesRelations = relations(analyses, ({ one, many }) => ({
  user: one(profiles, {
    fields: [analyses.userId],
    references: [profiles.id],
  }),
  accessCode: one(accessCodes, {
    fields: [analyses.accessCodeUsed],
    references: [accessCodes.id],
  }),
  feedback: many(feedback),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  analysis: one(analyses, {
    fields: [feedback.analysisId],
    references: [analyses.id],
  }),
}));

// Export types for TypeScript
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type AccessCode = typeof accessCodes.$inferSelect;
export type NewAccessCode = typeof accessCodes.$inferInsert;

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
