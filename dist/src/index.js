"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const winston_1 = require("winston");
const ExpenseController_1 = require("./expenses/controllers/ExpenseController");
const ExpenseRepository_1 = require("./expenses/repositories/ExpenseRepository");
const ExpenseService_1 = require("./expenses/services/ExpenseService");
const AuditService_1 = require("./notifications/services/AuditService");
const AuditLogRepository_1 = require("./notifications/repositories/AuditLogRepository");
const NotificationController_1 = require("./notifications/controllers/NotificationController");
const AuditController_1 = require("./notifications/controllers/AuditController");
const NotificationRepository_1 = require("./notifications/repositories/NotificationRepository");
const NotificationService_1 = require("./notifications/services/NotificationService");
const BalanceController_1 = require("./balances/controllers/BalanceController");
const BalanceRepository_1 = require("./balances/repositories/BalanceRepository");
const BalanceService_1 = require("./balances/services/BalanceService");
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
    transports: [new winston_1.transports.Console()],
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
const expenseRepository = new ExpenseRepository_1.ExpenseRepository();
const expenseAuditService = new AuditService_1.AuditService(new AuditLogRepository_1.AuditLogRepository(), logger);
const expenseService = new ExpenseService_1.ExpenseService(expenseRepository, expenseAuditService, logger);
app.use('/expenses', new ExpenseController_1.ExpenseController(expenseService, logger).getRouter());
const balanceRepository = new BalanceRepository_1.BalanceRepository();
const balanceAuditService = new AuditService_1.AuditService(new AuditLogRepository_1.AuditLogRepository(), logger);
const balanceService = new BalanceService_1.BalanceService(balanceRepository, balanceAuditService, logger);
app.use('/balances', new BalanceController_1.BalanceController(balanceService, logger).getRouter());
const notificationRepository = new NotificationRepository_1.NotificationRepository();
const notificationService = new NotificationService_1.NotificationService(notificationRepository, logger);
app.use('/notifications', new NotificationController_1.NotificationController(notificationService, logger).getRouter());
const auditService = new AuditService_1.AuditService(new AuditLogRepository_1.AuditLogRepository(), logger);
app.use('/audit', new AuditController_1.AuditController(auditService, logger).getRouter());
app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, status: 'ok' });
});
const port = Number(process.env.PORT ?? 3000);
if (require.main === module) {
    app.listen(port, () => {
        logger.info('TaskBridge API started', { port });
    });
}
exports.default = app;
