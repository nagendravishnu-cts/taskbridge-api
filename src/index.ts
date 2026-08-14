import express, { Express } from 'express';
import { Logger, createLogger, format, transports } from 'winston';
import { ExpenseController } from './expenses/controllers/ExpenseController';
import { ExpenseRepository } from './expenses/repositories/ExpenseRepository';
import { ExpenseService } from './expenses/services/ExpenseService';
import { AuditService } from './notifications/services/AuditService';
import { AuditLogRepository } from './notifications/repositories/AuditLogRepository';
import { NotificationController } from './notifications/controllers/NotificationController';
import { AuditController } from './notifications/controllers/AuditController';
import { NotificationRepository } from './notifications/repositories/NotificationRepository';
import { NotificationService } from './notifications/services/NotificationService';
import { BalanceController } from './balances/controllers/BalanceController';
import { BalanceRepository } from './balances/repositories/BalanceRepository';
import { BalanceService } from './balances/services/BalanceService';

const logger: Logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

const app: Express = express();
app.use(express.json());

const expenseRepository = new ExpenseRepository();
const expenseAuditService = new AuditService(new AuditLogRepository(), logger);
const expenseService = new ExpenseService(expenseRepository, expenseAuditService, logger);
app.use('/expenses', new ExpenseController(expenseService, logger).getRouter());

const balanceRepository = new BalanceRepository();
const balanceAuditService = new AuditService(new AuditLogRepository(), logger);
const balanceService = new BalanceService(balanceRepository, balanceAuditService, logger);
app.use('/balances', new BalanceController(balanceService, logger).getRouter());

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository, logger);
app.use('/notifications', new NotificationController(notificationService, logger).getRouter());

const auditService = new AuditService(new AuditLogRepository(), logger);
app.use('/audit', new AuditController(auditService, logger).getRouter());

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'ok' });
});

const port = Number(process.env.PORT ?? 3000);
if (require.main === module) {
  app.listen(port, () => {
    logger.info('TaskBridge API started', { port });
  });
}

export default app;
