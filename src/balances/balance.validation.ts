import { z } from 'zod';

export const projectBalanceSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  organisationId: z.string().min(1, 'Organisation ID is required'),
});

export const userBalanceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  organisationId: z.string().min(1, 'Organisation ID is required'),
});

export const recalculateBalanceSchema = z.object({
  organisationId: z.string().min(1, 'Organisation ID is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  eventType: z.string().min(1, 'Event type is required'),
  reason: z.string().min(1, 'Reason is required'),
});
