# DECISION RULES

## Primary Decision Order
1. Correctness and data integrity.
2. Security and permission safety.
3. Backward compatibility with mobile clients.
4. Operability and observability.
5. Performance and cost efficiency.

## Architectural Decision Rules
- Use modular monolith boundaries unless scaling evidence requires extraction.
- Prefer synchronous transactions for critical state transitions.
- Use asynchronous workers for non-critical and heavy post-processing.
- Introduce new infrastructure only with measurable benefit.

## Product Logic Rules
- Enforce role checks server-side for every write action.
- Treat shift and payment data as financial-grade records.
- Preserve event and audit history; never mutate history to hide errors.
- Prefer additive schema evolution over breaking changes.

## API Evolution Rules
- Version all breaking changes.
- Keep field names stable and domain-consistent.
- Deprecate before removal with migration guidance.

## Performance Rules
- Optimize based on measured bottlenecks, not assumptions.
- Require indexes for new high-cardinality filters.
- Use caching only with explicit invalidation strategy.

## Security Rules
- Deny by default when permission is uncertain.
- Never trust client-calculated financial or status data.
- Require re-authentication for high-risk administrative actions.

## AI Execution Rules
- Read `PROJECT_CONTEXT.md` first.
- Load only documents required for the requested change.
- If documentation and code conflict, treat code behavior as current state and update docs in same change.
- When uncertain between two safe options, choose the one that minimizes operational risk.
