# EVENT FLOW

## Event Design Principles
- Every state-changing action emits a domain event.
- Events are immutable and timestamped in UTC.
- Event handlers are idempotent.
- Business-critical writes and event publication are transactionally coordinated.

## 1. Authentication Flow
1. User submits credentials or OTP verification request.
2. Identity service validates challenge.
3. Access token and refresh token are issued.
4. `auth.logged_in` event is emitted.
5. Session metadata is stored for audit and anomaly detection.

## 2. Shift Lifecycle Flow
1. Installer triggers `shift.start`.
2. Service validates no concurrent active shift.
3. Shift record transitions to `active`.
4. `shift.started` event emitted.
5. Pause/resume transitions emit `shift.paused` and `shift.resumed`.
6. Finish action emits `shift.finished` and invokes report/payment pipeline.

## 3. Hourly Photo Flow
1. Installer uploads photo during active shift.
2. Storage layer persists asset and returns storage key.
3. Photo metadata saved with `pending` status.
4. `photo.uploaded` event emitted.
5. Dashboard counters update asynchronously.

## 4. Photo Moderation Flow
1. Curator selects pending photo.
2. Action `approve` or `reject` submitted with required comment for reject.
3. Photo status updates atomically with moderator metadata.
4. `photo.moderated` event emitted.
5. Audit entry written.
6. Shift quality metrics and downstream payment signals refresh.

## 5. Task Flow
1. Curator creates task -> `task.created`.
2. Curator assigns installer -> `task.assigned`.
3. Installer changes progress -> `task.status_changed`.
4. Deadline scheduler marks stale tasks -> `task.overdue`.
5. All transitions append task history entry.

## 6. Invite Redemption Flow
1. Foreman creates invite code -> `invite.created`.
2. Installer redeems code.
3. System validates code status, expiration, and usage.
4. Membership link persisted.
5. `invite.redeemed` and `team.member_added` events emitted.

## 7. Support Chat Flow
1. User sends message -> `chat.message_sent`.
2. Message persisted and conversation `last_message_at` updated.
3. Recipient unread counter increments.
4. Delivery/read actions emit `chat.message_read`.

## 8. Payment Flow
1. Shift completion triggers payout calculation command.
2. Finance service computes payment components.
3. Payment record created as `pending` -> `payment.created`.
4. Curator approval emits `payment.approved`.
5. Settlement marks `paid` -> `payment.paid`.
6. Any correction generates explicit `payment.adjusted` event.

## Failure Handling
- Duplicate command requests are deduplicated by idempotency keys.
- Retries use exponential backoff.
- Dead-letter queue captures irrecoverable worker failures.
- Compensating actions are explicit and audit logged.
