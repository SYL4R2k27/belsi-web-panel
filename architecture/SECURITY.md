# SECURITY

## Security Objectives
- Protect identity, payroll, and operational data.
- Prevent unauthorized role escalation.
- Preserve forensic-grade action history.

## Authentication
- JWT access tokens with short TTL.
- Refresh tokens with rotation and revocation support.
- OTP login for mobile users.
- Curator login enforced with strong credential policy and MFA.

## Authorization
- Role-based access control at API gateway and service layers.
- Curator-only access to web admin routes.
- Resource-level checks for installer and foreman operations.

## Token and Session Controls
- Signed JWT with asymmetric keys.
- Key rotation with overlap window.
- Device/session metadata tracked for anomaly detection.
- Immediate revocation on block or credential reset.

## Data Protection
- TLS 1.2+ in transit.
- AES-256 encryption at rest for database and object storage.
- Sensitive fields minimized and access-scoped.
- No secrets stored in source control.

## API Protection
- Input validation and schema enforcement on all endpoints.
- Rate limiting for auth, chat, and upload routes.
- CSRF protection for cookie-bound sessions.
- CORS restricted to approved origins.

## Application Security Controls
- Secure password hashing (Argon2id).
- Parameterized queries only.
- Server-side authorization never delegated to client.
- File uploads validated by mime type and size policy.

## Audit and Compliance
- Immutable audit log for all curator write actions.
- Audit entries include actor, entity, action, before/after state, IP, user-agent, timestamp.
- Centralized log retention with tamper-resistant storage.

## Operational Security
- Least-privilege IAM per service account.
- Segregated environments and credentials.
- Vulnerability scanning in CI for dependencies and images.
- Regular patching cadence and emergency patch path.

## Incident Response
- Alerting on auth anomalies, error spikes, and suspicious role changes.
- On-call runbook with severity classification.
- Containment, eradication, recovery, and post-incident review workflow.
