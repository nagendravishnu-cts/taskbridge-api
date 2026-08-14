"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllByUserSchema = exports.transactionIdSchema = exports.getByUserSchema = exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
exports.createTransactionSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid({ message: 'User ID must be a valid UUID' }),
    type: zod_1.z.string().min(1).max(50),
    amount: zod_1.z.number().positive({ message: 'Amount must be greater than zero' }),
    currency: zod_1.z.string().length(3, { message: 'Currency code must be a 3-character ISO code' }).toUpperCase(),
    description: zod_1.z.string().min(1).max(2000),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.getByUserSchema = zod_1.z.object({
    organisationId: zod_1.z.string().uuid({ message: 'Organisation ID must be a valid UUID' }),
    userId: zod_1.z.string().uuid({ message: 'User ID must be a valid UUID' }),
});
exports.transactionIdSchema = zod_1.z.object({
    organisationId: zod_1.z.string().uuid({ message: 'Organisation ID must be a valid UUID' }),
    transactionId: zod_1.z.string().uuid({ message: 'Transaction ID must be a valid UUID' }),
});
exports.deleteAllByUserSchema = zod_1.z.object({
    organisationId: zod_1.z.string().uuid({ message: 'Organisation ID must be a valid UUID' }),
    userId: zod_1.z.string().uuid({ message: 'User ID must be a valid UUID' }),
});
