# PROJECT_CONTEXT

This file is the canonical entry point for AI and engineers. It defines what to read first and how to interpret the project documentation set.

## Documentation Map

### Product Layer
- `docs/PRODUCT.md`: business mission, roles, constraints, success metrics.
- `docs/FEATURES.md`: feature definitions, rules, and state models.
- `docs/SCREENS.md`: mobile and web screen inventory with responsibilities.

### Architecture Layer
- `architecture/SYSTEM_MODEL.md`: component model, domain boundaries, ownership.
- `architecture/DB_DESIGN.md`: production logical database model, constraints, indexing, retention, tenant isolation.
- `architecture/EVENT_FLOW.md`: state-changing workflows and domain events.
- `architecture/SECURITY.md`: authn/authz, data protection, audit, incident controls.
- `architecture/SCALING.md`: capacity assumptions and scaling strategy.

### Process Layer
- `process/DEV_PROTOCOL.md`: delivery lifecycle, DoR/DoD, testing and migration protocol.
- `process/AI_WORKFLOW.md`: mandatory AI execution gates for documentation-first development.
- `process/GIT_RULES.md`: branching, commit, PR, and protected-branch policy.
- `process/DEPLOYMENT.md`: CI/CD, release strategy, rollback and verification.

### AI Rules Layer
- `ai_rules/CODE_STYLE.md`: coding standards for backend and web admin.
- `ai_rules/DECISION_RULES.md`: decision hierarchy and execution guardrails.
- `ai_rules/CONTEXT_LOADING.md`: context retrieval strategy and conflict handling.

## Loading Priority
For any task, load files in this exact order:
1. `PROJECT_CONTEXT.md`
2. `docs/PRODUCT.md`
3. `architecture/SYSTEM_MODEL.md`
4. `architecture/DB_DESIGN.md`
5. `docs/FEATURES.md`
6. `architecture/EVENT_FLOW.md`
7. `architecture/SECURITY.md`
8. `architecture/SCALING.md`
9. `docs/SCREENS.md`
10. `process/DEV_PROTOCOL.md`
11. `process/AI_WORKFLOW.md`
12. `process/GIT_RULES.md`
13. `process/DEPLOYMENT.md`
14. `ai_rules/CODE_STYLE.md`
15. `ai_rules/DECISION_RULES.md`
16. `ai_rules/CONTEXT_LOADING.md`

## Usage Contract
- Treat this documentation set as authoritative for new implementation decisions.
- Keep documentation synchronized with behavior changes in the same PR.
- Do not introduce changes that violate security, auditability, or backward compatibility rules.
