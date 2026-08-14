# TaskBridge — Notification & Audit Service

A microservice architecture for real-time notifications and immutable audit logging in a B2B SaaS project collaboration platform.

## 📦 Technology Stack

| Component | Technology |
|-----------|------------|
| **Runtime** | Node.js 18+ |
| **Language** | TypeScript 5.x |
| **Web Framework** | Express.js 4.x |
| **Database** | PostgreSQL 14+ |
| **ORM** | TypeORM 0.3.x |
| **Testing** | Jest 29.x |
| **Validation** | Zod 3.x |
| **Logging** | Winston 3.x |
| **Authentication** | JWT (jsonwebtoken) |
| **Package Manager** | npm 9.x |

## 📁 Project Structure

```
taskbridge-api/
├── .github/
│   └── copilot-instructions.md          # Copilot standards & conventions
├── src/
│   ├── projects/
│   │   ├── models/
│   │   │   └── Project.ts               # Project entity (AI-generated, reviewed)
│   │   ├── repositories/
│   │   │   └── ProjectRepository.ts     # Data access layer
│   │   ├── services/
│   │   │   └── ProjectService.ts        # Business logic
│   │   └── controllers/
│   │       └── ProjectController.ts     # HTTP routes
│   ├── notifications/
│   │   ├── models/
│   │   │   ├── Notification.ts
│   │   │   └── AuditLog.ts
│   │   ├── repositories/
│   │   │   ├── NotificationRepository.ts
│   │   │   └── AuditLogRepository.ts
│   │   ├── services/
│   │   │   ├── NotificationService.ts
│   │   │   └── AuditService.ts
│   │   └── controllers/
│   │       ├── NotificationController.ts
│   │       └── AuditController.ts
│   ├── middleware/
│   │   ├── auth.ts                      # Multi-tenant auth middleware
│   │   └── errorHandler.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── database.ts
│   └── index.ts                         # Application entry point
├── tests/
│   ├── notifications/
│   │   ├── audit.service.test.ts
│   │   └── notification.service.test.ts
│   └── projects/
│       └── project.service.test.ts
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
├── SPEC.md                              # Technical specification
├── REVIEW.md                            # Project Service review & remediation
├── ARCHITECTURE.md                      # System design documentation
├── PROMPTS.md                           # Copilot prompt chain & techniques
├── TOOL_STRATEGY.md                     # Copilot feature usage log
├── IMPACT_ANALYSIS.md                   # Scope change analysis
└── PR_DESCRIPTION.md                    # Pull request documentation
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npm run migrations

# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## 📋 Service Overview

### Project Service
- **Responsibility**: Manage project milestones (create, update status, delete)
- **Status**: AI-generated (reviewed and remediated)
- **Files**: `src/projects/`

### Notification & Audit Service
- **Responsibility**: Real-time notifications + immutable audit logging
- **Status**: Custom built
- **Files**: `src/notifications/`
- **Integration**: Listens to Project Service events

## 🔐 Multi-Tenant Architecture

- All queries scoped to organisation ID
- JWT token contains `orgId` + `userId`
- Repository layer enforces data isolation
- Audit logs capture actor organisation for compliance

## 📚 Documentation

- **SPEC.md** - Technical specification for Notification & Audit Service
- **REVIEW.md** - Code review of Project Service + remediation details
- **ARCHITECTURE.md** - System design and integration patterns
- **PROMPTS.md** - Copilot usage chain and prompt engineering
- **TOOL_STRATEGY.md** - Feature usage log and limitations encountered
- **IMPACT_ANALYSIS.md** - Analysis of mid-sprint scope changes

## ✅ Assessment Deliverables

This project demonstrates:
- Copilot-assisted development with human oversight
- Multi-service architecture for B2B SaaS
- Security and compliance patterns (multi-tenancy, audit logging)
- AI tool strategy and limitations documentation
- Structured code review and remediation workflow
