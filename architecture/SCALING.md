# SCALING

## Capacity Profile
Target operation: thousands of users with concurrent mobile activity and curator dashboard usage.

Expected traffic characteristics:
- Write-heavy bursts during shift start/end windows.
- Continuous photo uploads during active hours.
- Read-heavy curator tables and analytics panels.
- Long-lived chat activity with frequent incremental reads.

## Scaling Strategy

### 1. API Layer
- Stateless FastAPI instances behind load balancer.
- Horizontal autoscaling based on CPU, memory, and request latency.
- Connection pooling tuned per instance.

### 2. Data Layer
- PostgreSQL vertical baseline with read replicas for analytics and heavy read paths.
- Partition high-growth tables by time (`photos`, `messages`, `audit_logs`).
- Index governance with periodic query-plan review.

### 3. Asynchronous Processing
- Queue-backed workers for report generation, notifications, and aggregate updates.
- Retry and dead-letter queues for reliability.
- Worker concurrency tuned by queue lag and job runtime.

### 4. Media Handling
- Object storage for photo assets.
- CDN distribution for thumbnails/previews.
- Signed URL access to reduce API bandwidth load.

### 5. Caching
- Redis for ephemeral caches and short-lived counters.
- Cache high-frequency dashboard aggregates.
- Explicit invalidation on state-changing events.

## Performance Engineering
- P95 latency budgets per endpoint category.
- Bulk pagination strategy for large tables.
- Cursor-based pagination for append-only streams.
- N+1 query prevention via join/prefetch patterns.

## Reliability and Resilience
- Multi-instance deployment across availability zones.
- Health checks with automatic instance replacement.
- Graceful shutdown to drain in-flight requests.
- Backpressure controls for upload and chat spikes.

## Data Lifecycle
- Hot data in primary partitions.
- Warm archive strategy for historical logs/messages.
- Retention-aligned export and purge workflows.

## Scalability Validation
- Load tests for shift peaks, photo bursts, and curator moderation queues.
- Soak tests for memory leaks and queue stability.
- Capacity review before every major release.
