# Copilot Prompt Engineering Documentation

This document records all prompts used to build the Notification & Audit Service and supporting documentation, including the prompting techniques applied and how Copilot output was modified.

---

## Prompt Chain Execution

### Prompt 1: Generate Project Service (Low-Effort, Unreviewed)

**Executed:** Section 2 - Project Service Generation  
**Copilot Feature Used:** Copilot Chat - Ask Mode

**Exact Prompt Text**

```text
Generate a Project model and a Project service with create, update status, get by team, and delete functions. Use a database.
```

**Prompting Technique:** Minimal specification (intentionally low-effort to simulate contractor code)

**Rationale:** This prompt deliberately avoids security details, architectural specifics, and validation requirements to generate code similar to what a rushed contractor would produce. This tests our code review and remediation capabilities.

**Copilot Response:** Generated Project model and ProjectService files.

**Issues Found:**
- No organisation ID filtering (multi-tenant isolation missing)
- No input validation
- No error handling
- Missing authorization checks
- Delete operation permanently removed records
- No logging

**Post-Generation Corrections:** Full remediation documented in REVIEW.md.

---

### Prompt 2: Create Technical Specification

**Executed:** Section A - SPEC.md Creation  
**Copilot Feature Used:** Ask Mode

**Exact Prompt Text**

```text
Act as a senior software architect.

Based on the following requirements, create a technical specification for a Notification & Audit Service.

Requirements:
- Record immutable audit logs for project lifecycle changes
- Generate notifications for all project team members
- Support querying audit history by project ID
- Filter by date range and event type
- Enforce multi-tenant organisation isolation
- Use layered architecture

Provide:
1. Data models with field types
2. API contracts
3. Validation rules
4. Security requirements
5. Integration points with Project Service
```

**Prompting Technique:** Role-Based + Specificity

**Rationale:** Defined a senior architect role and supplied detailed requirements to generate structured technical documentation.

**Copilot Response:** Generated a specification draft containing entities, APIs, and service responsibilities.

**Post-Generation Corrections:**
- Added audit immutability requirements.
- Expanded authorization rules.
- Added tenant isolation constraints.
- Added compliance considerations.

---

### Prompt 3: Review AI-Generated Project Service

**Executed:** Section B - Code Review

**Copilot Feature Used:** Ask Mode + #file

**Exact Prompt Text**

```text
Review #file:ProjectService.ts as a senior security engineer.

Identify:
- Security issues
- Multi-tenant isolation risks
- Architecture violations
- Performance concerns
- Validation issues

For each issue provide:
- Severity
- Impact
- Recommended fix
```

**Prompting Technique:** Role-Based

**Rationale:** Focused Copilot on security and architecture analysis before remediation.

**Copilot Response:** Identified validation and architectural weaknesses.

**Post-Generation Corrections:**
- Discovered missing organisation filtering.
- Added SaaS-specific security concerns.
- Added authorization review findings.
- Documented AI blind spots.

---

### Prompt 4: Remediate Project Service

**Executed:** Section B - Project Service Rewrite

**Copilot Feature Used:** Agent Mode

**Exact Prompt Text**

```text
Refactor the Project Service to production standards.

Requirements:
- Layered architecture
  - Model
  - Repository
  - Service
  - Controller
- TypeORM repositories only
- No database logic in services
- Multi-tenant organisation filtering
- Zod validation
- Structured logging
- Typed request and response contracts
- Error handling
- TypeScript strict mode

Generate all required files.
```

**Prompting Technique:** Constraint-Based + Specificity

**Rationale:** Required coordinated generation across multiple files while enforcing architectural standards.

**Copilot Response:** Generated model, repository, service, controller, DTO, and validation layers.

**Post-Generation Corrections:**
- Improved exception handling.
- Added audit event publishing.
- Added service authorization checks.
- Improved logging detail.

---

### Prompt 5: Build Audit Service

**Executed:** Section C - Audit Service Implementation

**Copilot Feature Used:** Agent Mode + @workspace

**Exact Prompt Text**

```text
Using @workspace context, generate an Audit Service.

Requirements:
- Audit entries are immutable
- Store actor user ID and organisation ID
- Store previous state and new state snapshots
- Support filtering by project ID, event type, and date range
- Repository pattern
- TypeORM
- Structured logging
- DTO validation

Do not generate update or delete operations.
```

**Prompting Technique:** Constraint-Based

**Rationale:** Explicit constraints ensured audit logs remained immutable.

**Copilot Response:** Generated Audit entity, repository, service, controller, and DTOs.

**Post-Generation Corrections:**
- Added tenant filtering.
- Strengthened validation.
- Added custom exception handling.

---

### Prompt 6: Build Notification Service

**Executed:** Section C - Notification Service Implementation

**Copilot Feature Used:** Agent Mode

**Exact Prompt Text**

```text
Generate a Notification Service integrated with the existing Project and Audit services.

Requirements:
- Create notifications on project create
- Create notifications on status update
- Create notifications on delete
- Notify all assigned team members
- Allow unread notification retrieval
- Allow marking notifications as read

Follow requirements from .github/copilot-instructions.md
```

**Prompting Technique:** Specificity + Context Referencing

**Rationale:** Reused project-wide instructions to maintain consistency.

**Copilot Response:** Generated service, repository, controller, and notification entity.

**Post-Generation Corrections:**
- Added authorization rules.
- Fixed recipient filtering.
- Added notification templates.

---

### Prompt 7: Generate Unit Tests

**Executed:** Section C - Test Development

**Copilot Feature Used:** /tests

**Exact Prompt Text**

```text
/tests

Generate Jest unit tests for:
- Notification dispatch to all project members
- Audit creation
- Audit immutability
- Date range filtering
- Event type filtering
- Multi-tenant authorization

Use existing service contracts and repositories.
```

**Prompting Technique:** Few-Shot + Constraint-Based

**Rationale:** Directed Copilot toward assessment-specific requirements.

**Copilot Response:** Generated initial set of Jest test cases.

**Post-Generation Corrections:**
- Added negative test cases.
- Added unauthorized-access tests.
- Added validation error scenarios.
- Increased coverage for edge cases.

---

### Prompt 8: Generate Impact Analysis

**Executed:** Scope Change Analysis

**Copilot Feature Used:** Ask Mode

**Exact Prompt Text**

```text
Analyze the impact of introducing a new event type called MILESTONE_REOPENED.

Additional requirement:
Audit entries must capture the actor IP address.

Identify:
- Affected modules
- Database changes
- API changes
- Migration requirements
- Security implications
- Compliance considerations
- Testing requirements
```

**Prompting Technique:** Decomposition

**Rationale:** Broke a large impact analysis task into smaller areas.

**Copilot Response:** Identified data model, API, repository, and testing changes.

**Post-Generation Corrections:**
- Added privacy implications.
- Added IP address retention recommendations.
- Added deployment sequencing.
- Added tenant-isolation impact analysis.

---

### Prompt 9: Generate Documentation

**Executed:** Documentation Phase

**Copilot Feature Used:** /doc

**Exact Prompt Text**

```text
/doc

Generate documentation comments for all public methods in:
- ProjectService
- AuditService
- NotificationService

Include parameters, return values, exceptions, and security considerations.
```

**Prompting Technique:** Specificity

**Rationale:** Improved maintainability and consistency of generated code.

**Copilot Response:** Generated 