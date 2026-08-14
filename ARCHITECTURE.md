# ARCHITECTURE.md

## Architecture Overview

The TaskBridge solution consists of two primary services: the **Project Service** and the **Notification & Audit Service**. The Project Service is responsible for managing project lifecycle operations such as creation, updates, milestone status changes, and deletion. The Notification & Audit Service consumes these project events to generate user notifications and maintain an immutable audit trail of all changes. 【1-950858】

The application follows a layered architecture consisting of:

```text
Controller/Route
      ↓
Service Layer
      ↓
Repository Layer
      ↓
Database Model
```

Incoming API requests are first handled by controllers, where request validation and authorization checks occur. Controllers delegate business operations to the service layer, which contains all domain logic. Services communicate with repositories for data access, while repositories interact with database models using the ORM. This separation ensures maintainability, testability, and clear responsibility boundaries. 【1-950858】

When a project milestone is created, updated, reopened, closed, or deleted, the Project Service publishes an event to the Notification & Audit Service. The Audit component stores an immutable record containing actor information, previous state, new state, event type, timestamp, and organization details. Simultaneously, the Notification component generates notifications for relevant project members. 【1-950858】

This architecture is well suited for a multi-tenant B2B SaaS application because organization-level isolation can be enforced consistently at the service and repository layers. The separation of audit logging from core project management also improves scalability and compliance readiness while reducing coupling between business domains. 【1-950858】

Key design decisions included adopting the Repository Pattern, enforcing audit log immutability, implementing organization-based authorization, using DTO validation for all API inputs, and defining clear integration contracts between services. The primary trade-off is additional complexity compared to a monolithic design; however, the resulting security, maintainability, and extensibility benefits outweigh the overhead for a compliance-sensitive application. 【1-950858】