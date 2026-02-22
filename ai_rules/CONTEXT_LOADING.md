# CONTEXT LOADING

## Objective
Allow AI agents to gain accurate project understanding quickly while minimizing context bloat.

## Loading Sequence
1. Read `PROJECT_CONTEXT.md` for canonical map and priorities.
2. Read product-level intent in `docs/PRODUCT.md`.
3. Read system boundaries in `architecture/SYSTEM_MODEL.md`.
4. Read data model and constraints in `architecture/DB_DESIGN.md`.
5. Read feature and flow details in `docs/FEATURES.md` and `architecture/EVENT_FLOW.md`.
6. Read constraints in `architecture/SECURITY.md` and `architecture/SCALING.md`.
7. Read execution protocols in `process/*.md`.
8. Read AI behavior policies in `ai_rules/*.md`.

## Minimal Context Profile
For small bugfixes:
- `PROJECT_CONTEXT.md`
- relevant feature section
- relevant architecture section
- relevant section in `architecture/DB_DESIGN.md` when data model is touched
- `ai_rules/CODE_STYLE.md`

## Full Context Profile
For architecture or cross-domain changes:
- all files under `docs/`
- all files under `architecture/`
- all files under `process/`
- all files under `ai_rules/`

## Retrieval Rules
- Prefer targeted section loading by heading.
- Resolve role and permission questions through `docs/PRODUCT.md` + `architecture/SECURITY.md`.
- Resolve workflow questions through `docs/FEATURES.md` + `architecture/EVENT_FLOW.md`.
- Resolve schema and data invariants through `architecture/DB_DESIGN.md`.
- Resolve operational decisions through `process/DEPLOYMENT.md` + `architecture/SCALING.md`.

## Conflict Resolution Order
1. `PROJECT_CONTEXT.md`
2. `architecture/*`
3. `docs/*`
4. `process/*`
5. `ai_rules/*`

If conflicts remain, choose the stricter security/correctness interpretation and document the update in the same change.
