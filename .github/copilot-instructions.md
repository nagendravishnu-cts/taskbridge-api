# Copilot Custom Instructions for TaskBridge

## Project Context

**Project**: TaskBridge — Notification & Audit Service  
**Type**: B2B SaaS microservice architecture  
**Technology Stack**: Node.js 18+, TypeScript 5.x, Express.js 4.x, PostgreSQL 14+, TypeORM, Jest  
**Team Context**: Multi-service platform with strict security and compliance requirements

---

## Architecture Conventions

### Layered Service Architecture

Every service follows this 4-layer pattern:

```
Controller/Route Handler → Service → Repository → Database
```

**Layer Responsibilities:**
- **Controller**: HTTP request/response handling, input validation, HTTP status codes
- **Service**: Business logic, transactions, orchestration between repositories, error handling
- **Repository**: Data access only (SELECT, INSERT, UPDATE queries), no business logic
- **Database**: TypeORM entities with proper relationships and constraints

### Multi-Service Integration

- Services communicate via **event-driven patterns** (not direct function calls)
- Audit Service listens to Project Service state changes
- Notification Service consumes audit events
- Never create circular dependencies

---

## Coding Standards

### TypeScript & Type Safety

- **All function parameters must be typed** — no `any` type
- **All return types must be explicit** — no implicit returns
- **Use interfaces for contracts** — especially API request/response shapes
- **Use enums for fixed values** — e.g., `ProjectStatus`, `EventType`, `NotificationStatus`
- Use `strictNullChecks: true` in tsconfig

### Validation & Error Handling

- **Input validation required on all controller endpoints** using Zod schemas
- **Typed error classes** for each error scenario (e.g., `UnauthorisedError`, `NotFoundError`, `ValidationError`)
- **Specific HTTP status codes**: 400 (validation), 401 (auth), 403 (authz), 404 (not found), 500 (server error)
- **Error responses** must include: `{ error: string, code: string, details?: object }`

### Structured Logging

- Use Winston logger with context (userId, orgId, requestId)
- Log at appropriate levels: ERROR (failures), WARN (edge cases), INFO (state changes), DEBUG (flow)
- Never log sensitive data (passwords, tokens, PII without anonymisation)

### Code Comments & Documentation

- **JSDoc comments on all public functions** with @param, @returns, @throws
- **Explain the why** — not the what (code should be readable)
- **Security/compliance notes** — especially for multi-tenant operations

---

## Security & Multi-Tenancy

### Authentication & Authorization

- **Every endpoint requires JWT authentication** (except health checks)
- **JWT payload must contain**: `userId`, `orgId`, `email`
- **Validate orgId on every request** — users can only access resources in their organisation
- **Role-based access control (RBAC)** where applicable — admin vs. regular user

### Data Isolation

- **All repository queries must filter by orgId** — this is non-negotiable
- **Audit logs must capture orgId** — for compliance and data recovery
- **Never return data from another organisation** — this is a critical security boundary
- Example check: `WHERE organisation_id = :orgId AND ...`

### Immutability Patterns

- **Audit entries are append-only** — no UPDATE or DELETE operations permitted at service layer
- **Use database constraints** to enforce immutability (`CHECK` constraints or triggers)
- **Timestamps** are auto-set by database (e.g., `CURRENT_TIMESTAMP`)

### Data Privacy

- **IP addresses**: Only capture and store if explicitly required, with retention policy
- **PII handling**: Anonymise in logs, encrypt at rest if stored
- **GDPR compliance**: Users can request data access/deletion (document your process)

---

## Testing Expectations

### Minimum Test Coverage

- **Unit tests** for all service logic
- **Integration tests** for repository layer with database
- **Contract tests** for inter-service events
- **Security tests** for multi-tenant isolation and unauthorised access

### Test Structure

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Test Database

- Use **in-memory PostgreSQL or test database** — never test against production
- **Seed test data with known orgIds** — verify isolation
- **Cleanup after each test** — reset state

---

## API Contract Patterns

### Request/Response Schemas

Always define explicit schemas using Zod:

```typescript
// Request
const CreateProjectRequest = z.object({
  name: z.string().min(1).max(255),
  organisationId: z.string().uuid(),
  milestone: z.string().optional(),
});

// Response
const ProjectResponse = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(['active', 'archived']),
  createdAt: z.date(),
});
```

### Error Responses

Consistent error format:
```json
{
  "error": "Unauthorised: User does not belong to this organisation",
  "code": "AUTHZ_ORG_MISMATCH",
  "details": {
    "userId": "...",
    "requestedOrgId": "..."
  }
}
```

---

## Database Patterns

### Entity Relationships

- **Foreign keys required** for all relationships
- **Soft deletes** (isDeleted flag) where applicable — never hard delete audit data
- **Timestamps**: `createdAt`, `updatedAt`, `deletedAt` on all entities
- **Organisation scoping**: Every table must have `organisationId` column

### Query Optimization

- **Index on**: organisationId, userId, createdAt, status fields
- **Avoid N+1 queries** — use joins or eager loading in repositories
- **Use database transactions** for multi-step operations (e.g., audit + notification)

---

## Event-Driven Patterns

### Project Service → Audit Service Flow

1. Project Service publishes event: `{ type: 'MILESTONE_UPDATED', projectId, userId, before: {...}, after: {...} }`
2. Audit Service consumes and creates immutable audit entry
3. Notification Service consumes and creates notification records

### Event Schema

```typescript
interface ProjectEvent {
  type: 'MILESTONE_CREATED' | 'MILESTONE_UPDATED' | 'MILESTONE_CLOSED' | 'MILESTONE_REOPENED';
  projectId: string;
  organisationId: string;
  userId: string; // Actor
  timestamp: Date;
  beforeState?: Record<string, any>; // Previous state snapshot
  afterState: Record<string, any>; // New state snapshot
}
```

---

## Code Generation Guidelines for Copilot

### When Asking Copilot to Generate Code:

1. **Be specific about context** — mention: architecture layer, service name, function purpose
2. **Specify constraints** — e.g., "must enforce multi-tenant isolation", "must be immutable", "must validate input with Zod"
3. **Ask for typed code** — "generate TypeScript with explicit return types"
4. **Request documentation** — "include JSDoc comments explaining the security boundary"
5. **Mention security concerns** — "this endpoint handles sensitive data, ensure logs don't expose PII"

### Example Good Prompt:

```
Generate a service method for the AuditService (notifications layer) that:
- Creates an immutable audit log entry (cannot be updated or deleted)
- Takes parameters: projectId (string), userId (string), orgId (string), eventType (enum), beforeState (object), afterState (object)
- Validates all inputs with Zod
- Enforces that orgId matches the JWT token's orgId
- Logs the operation with Winston, including userId and orgId but not sensitive data
- Returns the created audit entry or throws a typed error
- Uses TypeORM repository to persist to database
- Include JSDoc comments explaining the immutability constraint
```

### Unsafe Prompts to Avoid:

- ❌ "Generate a service" (too vague)
- ❌ "Create database code" (no context on isolation, validation)
- ❌ "Make it work" (no requirements)

---

## Review Checklist for AI-Generated Code

Before accepting Copilot output, verify:

- ✅ **No `any` types** — all parameters and returns are explicitly typed
- ✅ **Multi-tenant isolation** — orgId filtering on all queries
- ✅ **Input validation** — Zod schemas applied to all inputs
- ✅ **Error handling** — specific error types, not generic `Error`
- ✅ **Logging** — structured logs with context, no PII
- ✅ **Security boundaries** — authentication and authorisation checks present
- ✅ **Documentation** — JSDoc comments on public functions
- ✅ **Testing** — code is testable (dependencies injectable, no global state)
- ✅ **Database constraints** — foreign keys, checks, immutability enforced
- ✅ **No circular dependencies** — services don't depend on each other

---

## Audit & Compliance

### Audit Entry Requirements

Every audit entry must capture:
- `id` (UUID)
- `organisationId` (string) — for multi-tenant isolation
- `projectId` (string) — affected entity
- `userId` (string) — actor
- `eventType` (enum) — what changed
- `beforeState` (JSON) — previous values
- `afterState` (JSON) — new values
- `createdAt` (timestamp) — immutable
- `ipAddress` (string, optional) — only if required, with retention policy

### Query Requirements

Audit history must be queryable by:
- `projectId` (required)
- `eventType` (optional filter)
- `dateRange` (optional: from, to)
- Always returns results sorted by `createdAt DESC`

---

## Conventions Summary

| Aspect | Convention |
|--------|-----------|
| **Async Operations** | Always use `async/await`, never `.then()` chains |
| **Error Handling** | Try/catch at service layer, specific error types |
| **Database Transactions** | Use TypeORM `transaction()` for multi-step operations |
| **Soft Deletes** | Keep audit/compliance data forever, use `isDeleted` flag |
| **API Versioning** | Start with `/v1/` routes, e.g., `/v1/audit/:projectId` |
| **Environment Config** | Load from `.env`, validate on startup with Zod |
| **Health Checks** | Implement `/health` endpoint (no auth required) |
| **Logging Output** | JSON format for structured logging, timestamp in UTC |

---

**Last Updated**: Sprint - Notification & Audit Service  
**Maintained By**: Development Team  
**Review Frequency**: Before each sprint
