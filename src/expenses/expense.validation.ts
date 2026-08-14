import { z } from 'zod';

export const createExpenseSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  payerUserId: z.string().min(1, 'Payer user ID is required'),
  title: z.string().min(1, 'Title is required'),
  totalAmount: z.number().positive('Total amount must be positive'),
  currency: z.string().length(3, 'Currency code must be 3 characters'),
  splitType: z.enum(['equal', 'percentage']),
  participants: z.union([
    z.array(z.string().min(1, 'Participant ID is required')),
    z.array(
      z.object({
        userId: z.string().min(1, 'Participant user ID is required'),
        share: z.number().positive('Share must be positive'),
      }),
    ),
  ]),
});

export const projectExpenseQuerySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  organisationId: z.string().min(1, 'Organisation ID is required'),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
