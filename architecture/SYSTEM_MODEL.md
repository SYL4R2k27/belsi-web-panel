# SYSTEM MODEL

## Architecture Style
Modular monolith backend with clear domain boundaries, exposed through versioned REST API to mobile and web clients.

## Core Components
- `mobile_clients`: iOS and Android apps (existing).
- `web_admin`: curator dashboard.
- `api_service`: FastAPI application.
- `postgresql`: transactional primary database.
- `object_storage`: photo and attachment assets.
- `message_worker`: background processing for asynchronous jobs.
- `observability_stack`: metrics, logs, traces.

## Bounded Domains
- `identity`: authentication, tokens, account status.
- `users`: profile and role data.
- `teams`: foreman teams and membership history.
- `invites`: invite code issuance and redemption.
- `shifts`: lifecycle and time computations.
- `photos`: upload metadata and moderation lifecycle.
- `tasks`: assignment, status transitions, deadlines.
- `chat`: conversations and messages.
- `finance`: payment records and adjustments.
- `audit`: immutable curator action records.
- `settings`: operational policy configuration.

## Canonical Entities
- User, Team, TeamMember, Invite, Shift, ShiftPause, Photo, Task, TaskHistory, Conversation, Message, Payment, AuditLog, Setting.

## Data Ownership
- Each domain owns its write model.
- Cross-domain reads occur through service interfaces, not direct table coupling.
- Audit domain is append-only and never updated in place.

## API Contract Principles
- Base path `/api/v1`.
- JSON snake_case.
- Stable field names and explicit deprecation window for breaking changes.

## Consistency Model
- Strong consistency for shift transitions, moderation actions, payments.
- Eventual consistency allowed for analytics aggregates and dashboard counters.

## Fault Isolation
- Domain module boundaries prevent cascading logic failures.
- Asynchronous workloads moved to worker queue.
- Circuit breakers and retries used for external integrations.

## Operational Model
- Stateless API instances behind load balancer.
- Connection pooling for PostgreSQL.
- Object storage accessed by signed URLs.

## SLO Alignment
- Critical transaction endpoints prioritize low latency and correctness.
- Read-heavy dashboards use indexed queries and pre-aggregates where required.
