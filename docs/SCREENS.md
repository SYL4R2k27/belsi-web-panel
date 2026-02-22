# SCREENS

## Mobile Application (Existing)

### Installer Screens
1. `Instructions`
- Purpose: onboarding and operational guidance.
- Data: instruction content by role/version.

2. `Shift`
- Purpose: control shift state and show active timer.
- Actions: start, pause, resume, finish.
- Data: current shift status, elapsed time, pause totals.

3. `Photo Reports`
- Purpose: upload hourly photos and review moderation results.
- Data: photo timeline with status and comments.

4. `Support Chat`
- Purpose: communicate with curator.
- Data: conversation messages and read state.

5. `Wallet / Payments`
- Purpose: inspect earnings and payment history.
- Data: payment entries, totals, statuses.

6. `Profile`
- Purpose: manage account info.
- Data: personal and role metadata.

### Foreman-Only Screens
7. `Team`
- Purpose: monitor team composition and performance.
- Data: member list, aggregate operational metrics.

8. `Invites`
- Purpose: create and manage invite codes.
- Data: active/inactive codes, expiration, usage.

## Web Admin Dashboard (Curator)

### 1. `Overview Dashboard`
- KPI cards: active shifts, pending photos, overdue tasks, open chats, payout totals.
- Trend charts: moderation throughput, shift volume, rejection rate.
- Quick actions: jump to moderation, shifts, chat queue.

### 2. `Photo Moderation Queue`
- Table columns: photo preview, installer, shift, date, status, approve, reject, comment.
- Filters: date range, installer, team, status.
- Action behavior: optimistic UI with server confirmation and audit capture.

### 3. `Shifts Management`
- Table columns: installer, start time, end time, duration, status, payment, photos count.
- Detail panel: event timeline, pauses, linked photos, computed payment basis.

### 4. `Users Management`
- Table columns: name, phone, role, foreman, status, shift history.
- Actions: block/unblock, role update, profile correction, foreman reassignment.

### 5. `Teams Management`
- List and detail views for teams and memberships.
- Invite management integrated with team context.

### 6. `Tasks Management`
- Task list with status, deadline, assignee, priority.
- Create/edit/assign/status transitions.

### 7. `Support Chat`
- Left pane: conversation queue with unread counts.
- Main pane: chronological message stream.
- Composer: curator reply with delivery state.

### 8. `Financial Data`
- Payments ledger, filterable by date/team/installer/status.
- Drill-down: payment formula components and adjustment history.

### 9. `System Logs`
- Operational logs view.
- Audit logs view with actor, action, entity, timestamp.

### 10. `Settings`
- Config groups: moderation policy, task SLA defaults, notification rules.
- All changes require confirmation and are audit logged.
