"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BalanceService_1 = require("../../src/balances/services/BalanceService");
const BalanceCalculator_1 = require("../../src/balances/services/BalanceCalculator");
describe('BalanceCalculator', () => {
    it('calculates a net balance from credits and debits', () => {
        const entries = [
            {
                id: 'e1',
                organisationId: 'org-1',
                userId: 'user-1',
                projectId: 'project-1',
                currency: 'USD',
                sourceType: 'transaction',
                sourceId: 'tx-1',
                direction: 'credit',
                amount: 100,
                createdAt: new Date('2024-01-01T00:00:00.000Z'),
            },
            {
                id: 'e2',
                organisationId: 'org-1',
                userId: 'user-1',
                projectId: 'project-1',
                currency: 'USD',
                sourceType: 'transaction',
                sourceId: 'tx-2',
                direction: 'debit',
                amount: 30,
                createdAt: new Date('2024-01-02T00:00:00.000Z'),
            },
        ];
        const result = BalanceCalculator_1.BalanceCalculator.calculate(entries);
        expect(result).toEqual(expect.objectContaining({
            totalInflow: 100,
            totalOutflow: 30,
            availableBalance: 70,
            pendingBalance: 0,
            reservedBalance: 0,
        }));
    });
    it('keeps zero totals when there are no entries', () => {
        const result = BalanceCalculator_1.BalanceCalculator.calculate([]);
        expect(result).toEqual({
            totalInflow: 0,
            totalOutflow: 0,
            availableBalance: 0,
            pendingBalance: 0,
            reservedBalance: 0,
        });
    });
    it('calculates a negative balance when debits exceed credits', () => {
        const entries = [
            {
                id: 'e1',
                organisationId: 'org-1',
                userId: 'user-1',
                projectId: 'project-1',
                currency: 'USD',
                sourceType: 'transaction',
                sourceId: 'tx-1',
                direction: 'credit',
                amount: 40,
                createdAt: new Date(),
            },
            {
                id: 'e2',
                organisationId: 'org-1',
                userId: 'user-1',
                projectId: 'project-1',
                currency: 'USD',
                sourceType: 'transaction',
                sourceId: 'tx-2',
                direction: 'debit',
                amount: 70,
                createdAt: new Date(),
            },
        ];
        const result = BalanceCalculator_1.BalanceCalculator.calculate(entries);
        expect(result.availableBalance).toBe(-30);
    });
});
describe('BalanceService', () => {
    let service;
    let repository;
    let auditService;
    let logger;
    beforeEach(() => {
        repository = {
            getByProject: jest.fn(),
            getByUser: jest.fn(),
            getHistory: jest.fn(),
            saveSnapshot: jest.fn(),
            getEntriesByProject: jest.fn(),
        };
        auditService = {
            recordAudit: jest.fn().mockResolvedValue({ id: 'audit-1' }),
        };
        logger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
        service = new BalanceService_1.BalanceService(repository, auditService, logger);
    });
    it('recalculates a project balance for the organisation and records an audit event', async () => {
        repository.getEntriesByProject.mockResolvedValue([
            {
                id: 'e1',
                organisationId: 'org-1',
                userId: 'user-1',
                projectId: 'project-1',
                currency: 'USD',
                sourceType: 'transaction',
                sourceId: 'tx-1',
                direction: 'credit',
                amount: 120,
                createdAt: new Date(),
            },
        ]);
        repository.saveSnapshot.mockResolvedValue({
            id: 'snapshot-1',
            balanceId: 'balance-1',
            organisationId: 'org-1',
            projectId: 'project-1',
            userId: 'user-1',
            currency: 'USD',
            eventType: 'project_status_updated',
            previousBalance: 0,
            newBalance: 120,
            reason: 'Recalculated after project update',
            createdAt: new Date(),
        });
        const result = await service.recalculateProjectBalance({
            organisationId: 'org-1',
            projectId: 'project-1',
            userId: 'user-1',
            eventType: 'project_status_updated',
            reason: 'Recalculated after project update',
        });
        expect(result.newBalance).toBe(120);
        expect(auditService.recordAudit).toHaveBeenCalledWith(expect.objectContaining({
            eventType: 'project_status_updated',
            entityType: 'balance',
            projectId: 'project-1',
            actorOrganisationId: 'org-1',
        }));
    });
    it('rejects access when the project belongs to another organisation', async () => {
        repository.getEntriesByProject.mockResolvedValue([
            {
                id: 'e1',
                organisationId: 'org-2',
                userId: 'user-1',
                projectId: 'project-1',
                currency: 'USD',
                sourceType: 'transaction',
                sourceId: 'tx-1',
                direction: 'credit',
                amount: 100,
                createdAt: new Date(),
            },
        ]);
        await expect(service.recalculateProjectBalance({
            organisationId: 'org-1',
            projectId: 'project-1',
            userId: 'user-1',
            eventType: 'project_status_updated',
            reason: 'Recalculated after project update',
        })).rejects.toThrow('Organisation mismatch');
    });
    it('rejects incomplete calculation input', async () => {
        await expect(service.recalculateProjectBalance({
            organisationId: '',
            projectId: 'project-1',
            userId: 'user-1',
            eventType: 'project_status_updated',
            reason: 'Missing org',
        })).rejects.toThrow('Organisation ID, project ID and user ID are required');
        await expect(service.recalculateProjectBalance({
            organisationId: 'org-1',
            projectId: '',
            userId: 'user-1',
            eventType: 'project_status_updated',
            reason: 'Missing project',
        })).rejects.toThrow('Organisation ID, project ID and user ID are required');
    });
    it('logs the recalculation and stores the snapshot', async () => {
        repository.getEntriesByProject.mockResolvedValue([
            {
                id: 'e1',
                organisationId: 'org-1',
                userId: 'user-1',
                projectId: 'project-1',
                currency: 'USD',
                sourceType: 'transaction',
                sourceId: 'tx-1',
                direction: 'credit',
                amount: 150,
                createdAt: new Date(),
            },
        ]);
        repository.saveSnapshot.mockResolvedValue({
            id: 'snapshot-2',
            balanceId: 'balance-project-1',
            organisationId: 'org-1',
            userId: 'user-1',
            projectId: 'project-1',
            currency: 'USD',
            eventType: 'project_created',
            previousBalance: 0,
            newBalance: 150,
            reason: 'Project created',
            createdAt: new Date(),
        });
        await service.recalculateProjectBalance({
            organisationId: 'org-1',
            projectId: 'project-1',
            userId: 'user-1',
            eventType: 'project_created',
            reason: 'Project created',
        });
        expect(logger.info).toHaveBeenCalledWith('Balance recalculated', expect.objectContaining({
            projectId: 'project-1',
            organisationId: 'org-1',
            userId: 'user-1',
            newBalance: 150,
            eventType: 'project_created',
        }));
        expect(repository.saveSnapshot).toHaveBeenCalledWith(expect.objectContaining({
            projectId: 'project-1',
            eventType: 'project_created',
            reason: 'Project created',
        }));
    });
});
