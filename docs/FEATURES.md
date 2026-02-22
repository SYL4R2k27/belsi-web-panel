# FEATURES

## 1. Shift Tracking
### Purpose
Track working time with verifiable state transitions for payroll and performance.

### Core Capabilities
- Start shift.
- Pause and resume shift.
- End shift.
- Compute active, paused, and payable duration.
- Generate shift report.

### Rules
- One active shift per installer.
- Shift transitions are state-validated.
- Paused intervals are excluded from payable duration.
- All transitions are timestamped and auditable.

## 2. Hourly Photo Reports
### Purpose
Provide visual evidence of ongoing work quality and attendance.

### Core Capabilities
- Upload photo linked to active shift.
- Store metadata and original asset.
- Present moderation queue for curator.

### Moderation States
- `pending`
- `approved`
- `rejected`

### Rules
- Each photo belongs to exactly one shift.
- Curator moderation action records actor, timestamp, and comment.
- Rejected photos require explanatory comment.

## 3. Task Management
### Purpose
Plan and track operational work items.

### Core Capabilities
- Create task.
- Assign task to installer.
- Update status.
- Set and enforce deadline.
- Preserve assignment/status history.

### Task Statuses
- `new`
- `assigned`
- `in_progress`
- `done`
- `overdue`
- `cancelled`

## 4. Wallet and Payments
### Purpose
Provide transparent earnings and payment records.

### Core Capabilities
- Track payable output per shift.
- Create payment records.
- Approve and mark payouts.
- Record adjustments with full audit trail.

### Rules
- Monetary amounts use fixed precision decimal.
- Paid records are immutable; corrections are separate adjustment entries.

## 5. Team Management
### Purpose
Represent foreman-led installer groups for supervision and analytics.

### Core Capabilities
- Team creation and membership tracking.
- Foreman-to-installer linkage.
- Team-level performance visibility.

### Rules
- Installer can belong to one active team at a time.
- Team membership changes are historized.

## 6. Invites
### Purpose
Allow controlled team onboarding.

### Core Capabilities
- Foreman generates invite code.
- Installer redeems invite code.
- System links installer to foreman/team.

### Rules
- Invite codes have expiration and active flag.
- Usage count is enforced.
- Redemption is idempotent.

## 7. Support Chat
### Purpose
Provide direct operational communication between field users and curator.

### Core Capabilities
- Conversation list.
- Message history.
- Curator reply interface.
- Read state tracking.

### Rules
- Messages are append-only records.
- Sender identity and role are persisted on every message.

## 8. Profile Management
### Purpose
Maintain user identity and account state.

### Core Capabilities
- View/update profile fields.
- Role-specific profile data.
- Account status management by curator.

### Rules
- Phone number uniqueness is enforced.
- Role changes require audit logging and elevated permission.
