# DEV PROTOCOL

## Engineering Principles
- Ship small, verifiable increments.
- Preserve backward compatibility for active mobile clients.
- Favor explicit contracts over implicit behavior.

## Development Lifecycle
1. Define scope in issue with acceptance criteria.
2. Confirm impacted domains and API/schema changes.
3. Implement with tests and migration safety.
4. Open PR with evidence and rollout notes.
5. Complete review, merge, deploy, validate.

## Definition of Ready
- Problem statement is clear.
- Acceptance criteria are testable.
- Affected APIs and data models identified.
- Operational impact documented.

## Definition of Done
- Feature implemented and code reviewed.
- Tests pass (unit + integration + critical e2e).
- Database migrations validated forward/backward safety.
- Observability hooks added for new critical paths.
- Documentation updated.

## Testing Policy
- Unit tests for domain rules.
- Integration tests for API + database behavior.
- Contract tests for API response compatibility.
- Load tests for endpoints with expected burst traffic.

## Migration Protocol
- Use additive migrations first.
- Backfill asynchronously when needed.
- Remove deprecated columns only after safe release window.
- Every migration includes rollback notes.

## Release Governance
- Feature flags for risky changes.
- Canary deployment for critical modules.
- Post-deploy smoke validation checklist.
- Mandatory rollback criteria defined before release.

## Observability Requirements
- Structured logs for every write action.
- Metrics for request latency, error rate, queue lag.
- Alert thresholds defined for SLO breaches.
