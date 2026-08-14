# Copilot Prompt Engineering Documentation

This document records all prompts used to build the Notification & Audit Service and supporting documentation, including the prompting techniques applied and how Copilot output was modified.

## Prompt Chain Execution

### Prompt 1: Generate Project Service (Low-Effort, Unreviewed)
**Executed**: Section 2 - Project Service Generation  
**Copilot Feature Used**: Copilot Chat - Ask Mode  
**Exact Prompt Text**:
```
Generate a Project model and a Project service with create, update status, get by team, and delete functions. Use a database.
```

**Prompting Technique**: Minimal specification (intentionally low-effort to simulate contractor code)  
**Rationale**: This prompt deliberately avoids security details, architectural specifics, and validation requirements to generate code similar to what a rushed contractor would produce. This tests our code review and remediation capabilities.

**Copilot Response**: Generated two files - Project.ts model and ProjectService.ts  
**Issues Found**: (See REVIEW.md for detailed analysis)
- No organisation ID filtering (multi-tenant isolation missing)
- No input validation
- Delete function has no safeguards
- No error handling
- Missing TypeScript types in places
- No audit logging

**Post-Generation Corrections**: Full remediation documented in REVIEW.md

---

## Prompt Techniques Reference

| Technique | Definition | Used In |
|-----------|-----------|---------|
| **Specificity** | Providing detailed context and requirements | Prompts 2+ (not in Prompt 1) |
| **Decomposition** | Breaking large problems into smaller steps | SPEC.md generation |
| **Few-shot** | Providing examples of desired output format | Test generation prompts |
| **Constraint-based** | Explicitly stating what code must/must not do | Audit Service generation |
| **Role-based** | Assigning Copilot a role/persona | Service remediation |
| **Iterative refinement** | Refining output through multiple turns | Throughout |

---

## Post-Generation Corrections

### Prompt 1 Corrections (Project Service)

**File**: `src/projects/models/Project.ts`  
**What Was Wrong**: Model had no organisation ID field, timestamp fields missing, no immutability constraints  
**How Fixed**: Added `organisationId`, `createdAt`, `updatedAt`, `isDeleted` fields, added database constraints  

**File**: `src/projects/services/ProjectService.ts`  
**What Was Wrong**: No organisation filtering in queries, no input validation, delete function deletes permanently without audit  
**How Fixed**: Added organisationId parameter to all methods, added Zod validation, implemented soft delete with audit logging, added error handling  

**Pattern**: Copilot generated code that works in isolation but fails security review in multi-tenant context. This required human judgment to catch.

---

## Prompt Execution Progress

- [x] Prompt 1: Low-effort Project Service generation
- [ ] Prompt 2: SPEC.md technical specification
- [ ] Prompt 3: Audit Service core logic
- [ ] Prompt 4: Notification Service logic
- [ ] Prompt 5: Test case generation
- [ ] Prompt 6: IMPACT_ANALYSIS.md for scope change

---



This document will be updated after each Copilot interaction to maintain a complete record of:
1. What was prompted
2. Which Copilot feature was used
3. Which prompting technique was applied
4. What Copilot generated
5. What required human correction
6. Why the correction was needed

All corrections reflect cases where Copilot's output was incomplete, insecure, or inappropriate for production use.
