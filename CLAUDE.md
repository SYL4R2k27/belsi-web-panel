# CLAUDE.md — BELSI.Work Project Rules

## Mandatory Context Loading

You must read all files in `/knowledge` before doing anything.
These files define architecture, coding standards, deployment, UX rules, and project constraints.
Never make decisions that contradict knowledge base.
If knowledge is missing — ask before coding.

## Loading Priority

Read in this exact order:

1. `knowledge/project.md` — what the system is, roles, business rules
2. `knowledge/architecture.md` — system components, domains, data flow
3. `knowledge/tech-stack.md` — all technologies with rationale
4. `knowledge/database.md` — 23 tables, indexes, constraints, retention
5. `knowledge/api.md` — 45+ endpoints, formats, status codes
6. `knowledge/auth-security.md` — JWT, RBAC, audit, password policy
7. `knowledge/backend.md` — FastAPI structure, layers, configuration
8. `knowledge/frontend.md` — React SPA structure, routing, state management
9. `knowledge/coding-standards.md` — naming, function rules, forbidden patterns
10. `knowledge/patterns.md` — Repository, Service, DI, DTO, Event-driven
11. `knowledge/ux-guidelines.md` — UI rules, components, colors, states
12. `knowledge/deployment.md` — Docker, Nginx, CI/CD, rollback
13. `knowledge/environments.md` — local, staging, production, env vars
14. `knowledge/git-workflow.md` — branches, commits, PRs, releases
15. `knowledge/testing.md` — unit, integration, e2e, coverage targets
16. `knowledge/monitoring.md` — logs, metrics, alerts, health checks
17. `knowledge/roadmap.md` — phases, milestones, dependencies
18. `knowledge/decision-log.md` — architectural decisions with rationale
19. `knowledge/glossary.md` — domain terms, statuses, abbreviations

## Hard Rules

### Before Coding
- Read knowledge base first
- Classify change type: feature / architecture / database / bugfix / refactor
- Identify impacted domains and documents
- Update documentation BEFORE architecture or database changes

### During Coding
- Follow coding-standards.md strictly
- Use patterns from patterns.md
- Use only shadcn/ui components (never custom primitives)
- Decimal for money, never float
- Parameterized queries only
- Server-side authorization, never trust client
- Audit log for every curator write action

### After Coding
- Update docs/FEATURES.md if behavior changed
- Update knowledge files if architecture changed
- Verify all tests pass
- Verify documentation-code consistency

## Decision Hierarchy

When in doubt:
1. Correctness and data integrity
2. Security and permission safety
3. Backward compatibility with mobile clients
4. Operability and observability
5. Performance and cost efficiency

## Conflict Resolution

If knowledge files conflict with each other:
1. knowledge/project.md (highest authority)
2. knowledge/architecture.md
3. knowledge/database.md
4. knowledge/api.md
5. All other knowledge files

Choose the stricter security/correctness interpretation and update conflicting files.

## Forbidden Actions

- Never implement logic without reading relevant knowledge files
- Never use float for financial values
- Never store secrets in source control
- Never skip audit logging for curator actions
- Never create custom UI primitives (use shadcn/ui)
- Never mutate audit_log records
- Never bypass server-side authorization
- Never log tokens, passwords, or PII
