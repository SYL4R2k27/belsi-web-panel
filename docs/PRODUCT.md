# PRODUCT

## System Name
BELSI.Work

## Product Mission
BELSI.Work is a workforce management platform for field operations. It coordinates on-site execution, quality verification, team oversight, and financial accountability through mobile applications and a curator web dashboard.

## Business Outcome
- Increase operational transparency across field teams.
- Enforce work quality using photo evidence and moderation.
- Reduce manual coordination overhead through structured tasks and chat.
- Ensure accurate, auditable payment calculations tied to completed work.

## User Roles
- `installer`: executes shifts and tasks on site.
- `foreman`: manages team composition and invites.
- `curator`: administers all operations through web dashboard.

## Product Surfaces
- Mobile app (existing): installer and foreman workflows.
- Web admin (new): curator-only operational control center.

## Domain Scope
In scope:
- Authentication and role-based access.
- Shift lifecycle management.
- Hourly photo reporting and moderation.
- Task assignment and status tracking.
- Team and invite code management.
- Wallet/payment visibility and payout controls.
- Support chat between field users and curator.
- Profile data management.

Out of scope:
- Public marketing website.
- External client portal.
- Anonymous user workflows.

## Operating Constraints
- Production-grade reliability for thousands of concurrent users.
- Full auditability for curator write actions.
- API-first architecture for mobile and web parity.
- Backward-compatible evolution of existing mobile functionality.

## Non-Functional Requirements
- Availability target: 99.9% monthly for API and dashboard.
- P95 API latency target: < 300 ms for standard reads, < 600 ms for writes.
- Durability: daily backups + point-in-time recovery.
- Security: encrypted transport, encrypted data at rest, role isolation.
- Observability: request tracing, metrics, centralized structured logs.

## Product Success Metrics
- Shift completion rate.
- Photo moderation turnaround time.
- Rejected-photo percentage by team.
- Task overdue rate.
- Support first-response time.
- Payment dispute rate.
