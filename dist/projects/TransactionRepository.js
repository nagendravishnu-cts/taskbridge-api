"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const typeorm_1 = require("typeorm");
const Transaction_1 = require("./Transaction");
/**
 * Repository for transaction persistence and retrieval.
 * Every query MUST be scoped by organisationId to enforce multi-tenant isolation.
 */
class TransactionRepository {
    constructor(dataSource, logger) {
        this.repository = dataSource.getRepository(Transaction_1.Transaction);
        this.logger = logger;
    }
    async create(organisationId, input) {
        const transaction = this.repository.create({
            ...input,
            organisationId,
            status: input.status ?? 'pending',
        });
        const saved = await this.repository.save(transaction);
        this.logger.info('Transaction created', {
            organisationId,
            transactionId: saved.id,
            userId: saved.userId,
            amount: saved.amount,
            status: saved.status,
        });
        return saved;
    }
    async getByUser(organisationId, userId) {
        return this.repository.find({
            where: {
                organisationId,
                userId,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
            order: { createdAt: 'DESC' },
        });
    }
    async getById(organisationId, transactionId) {
        return this.repository.findOne({
            where: {
                id: transactionId,
                organisationId,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
        });
    }
    async deleteAllByUser(organisationId, userId) {
        const result = await this.repository.update({
            organisationId,
            userId,
            deletedAt: (0, typeorm_1.IsNull)(),
        }, {
            deletedAt: new Date(),
        });
        this.logger.warn('Soft-deleted transactions for user', {
            organisationId,
            userId,
            affectedRows: result.affected ?? 0,
        });
        return result.affected ?? 0;
    }
}
exports.TransactionRepository = TransactionRepository;
