# DEPLOYMENT

## Environment Topology
- `dev`: active development integration.
- `staging`: production-like validation.
- `prod`: live traffic.

Each environment has isolated database, cache, storage, and secrets.

## CI/CD Pipeline
1. Static checks: lint, formatting, type checks.
2. Test stage: unit and integration suites.
3. Build stage: immutable container images.
4. Security stage: dependency and image vulnerability scan.
5. Migration stage: apply safe database migrations.
6. Deploy stage: rolling or canary release.
7. Verification stage: smoke tests + SLO checks.

## Deployment Strategy
- Default: rolling update with health-gated traffic.
- Critical changes: canary with automated rollback on error threshold breach.

## Database Deployment Rules
- Migrations are backward-compatible for at least one release window.
- Data backfills run as controlled background jobs.
- Schema-breaking removals require prior deprecation cycle.

## Rollback Protocol
- Trigger rollback on sustained error-rate or latency breach.
- Revert application version first.
- Execute rollback migration only if forward-compatible fallback fails.
- Announce incident and recovery status in release channel.

## Post-Deployment Verification
- Validate auth/login flows.
- Validate shift and photo write paths.
- Validate moderation and payment screens.
- Confirm logs, metrics, and alerts are healthy.

## Production Operations
- On-call ownership defined per service.
- Change freeze windows for high-risk periods.
- Release notes published for every production deployment.
