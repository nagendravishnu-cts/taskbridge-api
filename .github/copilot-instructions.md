# Copilot Instructions for TaskBridge

## What We're Building

TaskBridge is a project collaboration platform with two main services: one handles projects, the other handles notifications and audit logging. We use Node.js with TypeScript, Express for the API, and PostgreSQL for data storage with TypeORM to manage it.

## How We Organize Code

Every service follows the same structure:
- Controller handles the HTTP request and response
- Service contains the business logic
- Repository talks to the database
- Database stores everything

This keeps things separated and easy to maintain.

## Coding Standards

Write everything in TypeScript. Use clear function names. Every function should have a type for what it takes in and what it returns - no `any` types. Add comments on functions that explain what they do. Use structured logging so we can see what's happening in production.

## Security Rules

Every user belongs to an organisation. When someone asks for data, check that they belong to that organisation first. Never let someone see another organisation's data. Audit logs should never be deleted or changed - they're permanent records. If the code needs to capture IP addresses, save them separately with a deletion date.

## Testing

Write tests for everything that matters:
- Does the service work correctly?
- Does the database save things right?
- Can users only see their own organisation's data?
- Do the API responses match what we promised?

Run tests before committing code.

## How to Ask Copilot for Code

When you use Copilot to generate code, be specific. Say which service you're working on, what the code should do, and what constraints matter. For example: "Generate a service method that creates an audit log entry. It should not be updatable or deletable, must check the user's organisation, and should log the action with structured logging."

Never accept code that uses `any` types, skips organisation checks, or has no error handling.

## Review Checklist

Before using any code Copilot generates:
- All functions have explicit types
- Organisation ID is checked on every query
- Audit entries cannot be deleted
- Input validation happens before database calls
- Error messages don't expose sensitive information
- Tests exist to verify the security boundaries
