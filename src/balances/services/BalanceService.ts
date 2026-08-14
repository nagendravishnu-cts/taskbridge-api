import { Logger } from 'winston';
import { Balance, BalanceSnapshot } from '../models/Balance';
import { BalanceCalculator } from './BalanceCalculator';
import { BalanceRepository } from '../repositories/BalanceRepository';

export interface RecalculateProjectBalanceInput {
  organisationId: string;
  projectId: string;
  userId: string;
  eventType: string;
  reason: string;
}

export interface AuditLikeClient {
  recordAudit(input: {
    eventType: string;
    entityType: string;
    entityId: string;
    projectId: string;
    actorUserId: string;
    actorOrganisationId: string;
    previousState: Record<string, unknown> | null;
    newState: Record<string, unknown> | null;
  }): Promise<{ id: string }>;
}

export class BalanceService {
  constructor(
    private readonly repository: BalanceRepository,
    private readonly auditService: AuditLikeClient,
    private readonly logger: Logger,
  ) {}

  async recalculateProjectBalance(input: RecalculateProjectBalanceInput): Promise<BalanceSnapshot> {
    if (!input.organisationId || !input.projectId || !input.userId) {
      throw new Error('Organisation ID, project ID and user ID are required');
    }

    const entries = await this.repository.getEntriesByProject(input.projectId, input.organisationId);

    if (entries.some((entry) => entry.organisationId !== input.organisationId)) {
      throw new Error('Organisation mismatch');
    }

    const previousBalance = 0;
    const calculated = BalanceCalculator.calculate(entries);
    const newBalance = calculated.availableBalance;

    const snapshot: BalanceSnapshot = {
      id: `snapshot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      balanceId: `balance-${input.projectId}`,
      organisationId: input.organisationId,
      userId: input.userId,
      projectId: input.projectId,
      currency: 'USD',
      eventType: input.eventType,
      previousBalance,
      newBalance,
      reason: input.reason,
      createdAt: new Date(),
    };

    const savedSnapshot = await this.repository.saveSnapshot(snapshot);

    await this.auditService.recordAudit({
      eventType: input.eventType,
      entityType: 'balance',
      entityId: snapshot.id,
      projectId: input.projectId,
      actorUserId: input.userId,
      actorOrganisationId: input.organisationId,
      previousState: { balance: previousBalance },
      newState: { balance: newBalance },
    });

    this.logger.info('Balance recalculated', {
      projectId: input.projectId,
      organisationId: input.organisationId,
      userId: input.userId,
      newBalance,
      eventType: input.eventType,
    });

    return savedSnapshot;
  }
}
