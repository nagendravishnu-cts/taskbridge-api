import { z } from 'zod';

export const createTransactionSchema = z.object({
  userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
  type: z.string().min(1).max(50),
  amount: z.number().positive({ message: 'Amount must be greater than zero' }),
  currency: z.string().length(3, { message: 'Currency code must be a 3-character ISO code' }).toUpperCase(),
  description: z.string().min(1).max(2000),
  metadata: z.record(z.unknown()).optional(),
});

export const getByUserSchema = z.object({
  organisationId: z.string().uuid({ message: 'Organisation ID must be a valid UUID' }),
  userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
});

export const transactionIdSchema = z.object({
  organisationId: z.string().uuid({ message: 'Organisation ID must be a valid UUID' }),
  transactionId: z.string().uuid({ message: 'Transaction ID must be a valid UUID' }),
});

export const deleteAllByUserSchema = z.object({
  organisationId: z.string().uuid({ message: 'Organisation ID must be a valid UUID' }),
  userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
