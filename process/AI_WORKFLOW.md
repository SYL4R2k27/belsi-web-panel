# AI_WORKFLOW

## Purpose
This protocol is mandatory for any AI-driven implementation task in this project. It defines hard gates that must be satisfied before, during, and after coding.

## Execution Mode
- Rule level: `MUST` unless explicitly marked `SHOULD`.
- A task is non-compliant if any `MUST` step is skipped.
- No code implementation is allowed without passing all required documentation gates.

## Protocol Steps

### Step 0: Context Bootstrap (Mandatory)
1. Read `PROJECT_CONTEXT.md` before any analysis or code change.
2. Load relevant files in the documented priority order.
3. Confirm scope, impacted domains, and affected roles.

Gate:
- If `PROJECT_CONTEXT.md` is not read first, stop task execution and restart from Step 0.

### Step 1: Change Classification
1. Classify request type:
- `feature_change`
- `architecture_change`
- `database_change`
- `bugfix`
- `refactor`
2. Identify impacted documents.

Gate:
- If classification is unclear, do not code until classification is explicit.

### Step 2: Pre-Code Documentation Gates
1. Before architecture changes:
- Update relevant files under `architecture/` (`SYSTEM_MODEL.md`, `EVENT_FLOW.md`, `SECURITY.md`, `SCALING.md`) to reflect target design.
2. Before database changes:
- Document migration intent in implementation notes and update process/docs references where schema behavior changes.
- Migration documentation must include: purpose, forward plan, rollback plan, compatibility impact.
3. Before API contract changes:
- Update contract and behavior documentation before implementation.

Gate:
- If required docs are not updated first, implementation is blocked.

### Step 3: Implementation Rules
1. Implement only changes covered by documented scope.
2. Preserve backward compatibility unless explicitly approved otherwise.
3. Keep security and permission checks server-side.
4. Keep auditability for state-changing admin operations.

Gate:
- Any undocumented logic change is prohibited.

### Step 4: Post-Implementation Documentation
1. After feature creation or behavior change:
- Update `docs/FEATURES.md` with final behavior, rules, and states.
2. If user-visible flows changed:
- Update `docs/SCREENS.md`.
3. If operational behavior changed:
- Update `process/DEV_PROTOCOL.md` or `process/DEPLOYMENT.md` as applicable.

Gate:
- Feature work is incomplete until documentation is updated in the same change set.

### Step 5: Compliance Check Before Completion
1. Verify all applicable gates passed.
2. Verify documentation and implementation are consistent.
3. Provide summary of updated files and rationale.

Gate:
- Do not mark task complete if any documentation-update obligation remains open.

## Non-Negotiable Rules
- Read `PROJECT_CONTEXT.md` before coding.
- Update architecture docs before architecture changes.
- Document migration before database changes.
- Update `docs/FEATURES.md` after feature creation.
- Never implement logic without corresponding documentation update.

## Completion Checklist
- `PROJECT_CONTEXT.md` read first.
- Change classified and scoped.
- Pre-code documentation updates completed.
- Implementation completed within documented scope.
- Post-code documentation updates completed.
- Consistency check passed.
