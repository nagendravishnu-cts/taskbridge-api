"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectExpenseQuerySchema = exports.createExpenseSchema = void 0;
const zod_1 = require("zod");
exports.createExpenseSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    payerUserId: zod_1.z.string().min(1, 'Payer user ID is required'),
    title: zod_1.z.string().min(1, 'Title is required'),
    totalAmount: zod_1.z.number().positive('Total amount must be positive'),
    currency: zod_1.z.string().length(3, 'Currency code must be 3 characters'),
    splitType: zod_1.z.enum(['equal', 'percentage']),
    participants: zod_1.z.union([
        zod_1.z.array(zod_1.z.string().min(1, 'Participant ID is required')),
        zod_1.z.array(zod_1.z.object({
            userId: zod_1.z.string().min(1, 'Participant user ID is required'),
            share: zod_1.z.number().positive('Share must be positive'),
        })),
    ]),
});
exports.projectExpenseQuerySchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    organisationId: zod_1.z.string().min(1, 'Organisation ID is required'),
});
