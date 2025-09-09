import { z } from "zod";

export const journeyStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  timeframe: z.string(),
  status: z.enum(['upcoming', 'current', 'completed', 'overdue']),
  tips: z.array(z.string()),
  requirements: z.array(z.string()).optional(),
  daysFromNow: z.number().optional(),
  completedAt: z.date().optional(),
  reminderSet: z.boolean().default(false),
  reminderDate: z.date().optional(),
});

export const scholarshipJourneySchema = z.object({
  id: z.string(),
  title: z.string(),
  deadline: z.string(),
  opportunityId: z.string().optional(),
  totalSteps: z.number(),
  completedSteps: z.number(),
  daysUntilDeadline: z.number(),
  steps: z.array(journeyStepSchema),
  userId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean().default(true),
});

export const journeyProgressUpdateSchema = z.object({
  journeyId: z.string(),
  stepId: z.string(),
  status: z.enum(['upcoming', 'current', 'completed', 'overdue']),
  completedAt: z.date().optional(),
});

export const journeyReminderSchema = z.object({
  journeyId: z.string(),
  stepId: z.string(),
  reminderDate: z.date(),
  reminderType: z.enum(['email', 'notification']).default('email'),
});

export type JourneyStep = z.infer<typeof journeyStepSchema>;
export type ScholarshipJourney = z.infer<typeof scholarshipJourneySchema>;
export type JourneyProgressUpdate = z.infer<typeof journeyProgressUpdateSchema>;
export type JourneyReminder = z.infer<typeof journeyReminderSchema>;

export type InsertJourneyStep = Omit<JourneyStep, 'id'>;
export type InsertScholarshipJourney = Omit<ScholarshipJourney, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertJourneyProgressUpdate = JourneyProgressUpdate;
export type InsertJourneyReminder = JourneyReminder;