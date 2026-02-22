# GIT RULES

## Branching Model
- `main`: production-ready branch, protected.
- `develop`: integration branch for upcoming release.
- `feature/<scope>-<short-name>`: new development.
- `hotfix/<scope>-<short-name>`: urgent production fixes.

## Commit Standard
Format:
`<type>(<scope>): <summary>`

Types:
- `feat`
- `fix`
- `refactor`
- `perf`
- `test`
- `docs`
- `chore`

Rules:
- One logical change per commit.
- Imperative mood in commit subject.
- Include migration or contract changes in commit body when relevant.

## Pull Request Rules
- PR must reference issue/ticket.
- PR description must include:
  - change summary
  - risk assessment
  - test evidence
  - migration and rollback notes
- At least one approving review required.
- CI must pass before merge.

## Protected Branch Policy
- No direct pushes to `main`.
- Rebase or merge strategy must preserve readable history.
- Force push forbidden on protected branches.

## Conflict Resolution
- Author rebases branch on latest target branch.
- Resolve conflicts locally with tests rerun.
- Never bypass reviews after conflict-heavy changes.

## Versioning and Tags
- Semantic versioning for backend and web admin releases.
- Release tags created only from `main`.
