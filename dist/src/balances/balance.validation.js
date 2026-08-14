"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateBalanceSchema = exports.userBalanceSchema = exports.projectBalanceSchema = void 0;
const zod_1 = require("zod");
exports.projectBalanceSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    organisationId: zod_1.z.string().min(1, 'Organisation ID is required'),
});
exports.userBalanceSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    organisationId: zod_1.z.string().min(1, 'Organisation ID is required'),
});
exports.recalculateBalanceSchema = zod_1.z.object({
    organisationId: zod_1.z.string().min(1, 'Organisation ID is required'),
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    userId: zod_1.z.string().min(1, 'User ID is required'),
    eventType: zod_1.z.string().min(1, 'Event type is required'),
    reason: zod_1.z.string().min(1, 'Reason is required'),
});
