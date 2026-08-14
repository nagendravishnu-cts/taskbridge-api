"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const transaction_validation_1 = require("./transaction.validation");
const errors_1 = require("./errors");
/**
 * Service responsible for transaction business rules.
 * It does not access the database directly; all persistence is delegated to the repository.
 */
class TransactionService {
    constructor(repository, logger, userMembershipChecker) {
        this.repository = repository;
        this.logger = logger;
        this.userMembershipChecker = userMembershipChecker;
    }
    /**
     * Creates a transaction for a user within an organisation.
     */
    async create(organisationId, input) {
        this.ensureOrganisationId(organisationId);
        const parsedInput = transaction_validation_1.createTransactionSchema.parse(input);
        await this.ensureUserBelongsToOrganisation(organisationId, parsedInput.userId);
        try {
            const transaction = await this.repository.create(organisationId, parsedInput);
            this.logAudit('transaction_created', {
                organisationId,
                userId: parsedInput.userId,
                transactionId: transaction.id,
                amount: transaction.amount,
            });
            return transaction;
        }
        catch (error) {
            this.logger.error('Transaction creation failed', {
                organisationId,
                userId: parsedInput.userId,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    /**
     * Returns all active transactions for a user within a single organisation.
     */
    async getByUser(organisationId, userId) {
        this.ensureOrganisationId(organisationId);
        const parsed = transaction_validation_1.getByUserSchema.parse({ organisationId, userId });
        await this.ensureUserBelongsToOrganisation(parsed.organisationId, parsed.userId);
        try {
            const transactions = await this.repository.getByUser(parsed.organisationId, parsed.userId);
            this.logger.info('Transactions retrieved for user', {
                organisationId: parsed.organisationId,
                userId: parsed.userId,
                count: transactions.length,
            });
            return transactions;
        }
        catch (error) {
            this.logger.error('User transaction retrieval failed', {
                organisationId: parsed.organisationId,
                userId: parsed.userId,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    /**
     * Returns a transaction by ID only if it falls under the caller's organisation.
     */
    async getById(organisationId, transactionId) {
        this.ensureOrganisationId(organisationId);
        const parsed = transaction_validation_1.transactionIdSchema.parse({ organisationId, transactionId });
        try {
            const transaction = await this.repository.getById(parsed.organisationId, parsed.transactionId);
            if (!transaction) {
                throw new errors_1.NotFoundError('Transaction not found');
            }
            return transaction;
        }
        catch (error) {
            if (error instanceof errors_1.NotFoundError) {
                throw error;
            }
            this.logger.error('Transaction lookup failed', {
                organisationId: parsed.organisationId,
                transactionId: parsed.transactionId,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    /**
     * Soft-deletes all active transactions for a user within an organisation.
     */
    async deleteAllByUser(organisationId, userId) {
        this.ensureOrganisationId(organisationId);
        const parsed = transaction_validation_1.deleteAllByUserSchema.parse({ organisationId, userId });
        await this.ensureUserBelongsToOrganisation(parsed.organisationId, parsed.userId);
        try {
            const deletedCount = await this.repository.deleteAllByUser(parsed.organisationId, parsed.userId);
            this.logAudit('transactions_deleted', {
                organisationId: parsed.organisationId,
                userId: parsed.userId,
                deletedCount,
            });
            return deletedCount;
        }
        catch (error) {
            this.logger.error('Bulk transaction delete failed', {
                organisationId: parsed.organisationId,
                userId: parsed.userId,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    ensureOrganisationId(organisationId) {
        if (!organisationId || typeof organisationId !== 'string') {
            throw new errors_1.ValidationError('Organisation ID is required and must be a string');
        }
    }
    async ensureUserBelongsToOrganisation(organisationId, userId) {
        if (!this.userMembershipChecker) {
            return;
        }
        const isAllowed = await this.userMembershipChecker(organisationId, userId);
        if (!isAllowed) {
            throw new errors_1.ForbiddenError('User does not belong to this organisation');
        }
    }
    logAudit(action, details) {
        this.logger.warn(action, {
            ...details,
            timestamp: new Date().toISOString(),
        });
    }
}
exports.TransactionService = TransactionService;
