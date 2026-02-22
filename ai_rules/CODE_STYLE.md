# CODE STYLE

## General Principles
- Prefer clarity over cleverness.
- Keep functions small and single-purpose.
- Use explicit naming aligned with business domain.
- Write deterministic code paths for state transitions.

## Backend (Python/FastAPI)
- Follow PEP 8 and type-hint all public interfaces.
- Use Pydantic schemas for all API request/response models.
- Keep router, service, and repository layers separated.
- Raise domain-specific exceptions, map to explicit HTTP responses.
- Use Decimal for money; never float for financial values.

## API Contract Rules
- snake_case JSON fields only.
- Stable response schema; avoid shape changes without versioning.
- Pagination required for list endpoints.
- Explicit error codes and messages.

## Database Access
- Parameterized queries only.
- Transaction boundaries defined in service layer.
- No business logic inside raw SQL migrations.
- Index-aware query patterns for large tables.

## Frontend (Web Admin)
- Component-driven architecture.
- Use shadcn/ui primitives; compose, do not reinvent.
- Separate data-fetching logic from presentation components.
- Keep table/filter state serializable and URL-synced when practical.

## Testing Style
- Arrange/Act/Assert structure.
- One behavioral assertion focus per test.
- Include negative path tests for permissions and invalid state transitions.

## Logging Style
- Structured JSON logs.
- Include request_id, user_id, role, action, entity where relevant.
- No sensitive data in logs.
