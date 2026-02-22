# Git Workflow — BELSI.Work

## Branching Model

```
main (protected)
  │
  ├── develop (integration)
  │     │
  │     ├── feature/shifts-timeline
  │     ├── feature/photo-moderation-bulk
  │     └── feature/task-overdue-alerts
  │
  └── hotfix/fix-payment-calculation
```

### Ветки

| Ветка | Назначение | Создаётся от | Мержится в |
|-------|-----------|-------------|-----------|
| `main` | Production-ready код | - | - |
| `develop` | Интеграционная ветка | main | main (release) |
| `feature/<scope>-<name>` | Новая функциональность | develop | develop |
| `hotfix/<scope>-<name>` | Срочное исправление в production | main | main + develop |

### Правила
- `main` — protected, no direct pushes
- `develop` — protected, merge only through PR
- Feature branches — short-lived, max 3 дня
- Hotfix branches — immediate, max 1 день

## Commit Standard

### Формат
```
<type>(<scope>): <summary>

[optional body]
[optional footer]
```

### Types

| Type | Использование |
|------|-------------|
| `feat` | Новая функциональность |
| `fix` | Исправление бага |
| `refactor` | Рефакторинг без изменения поведения |
| `perf` | Улучшение производительности |
| `test` | Добавление/изменение тестов |
| `docs` | Документация |
| `chore` | Обслуживание (deps, CI, configs) |
| `style` | Форматирование (без изменения логики) |

### Scope (примеры)
- `auth`, `users`, `shifts`, `photos`, `tasks`, `chat`, `finance`, `settings`
- `api`, `db`, `ui`, `infra`

### Правила коммитов
- Одно логическое изменение на коммит
- Imperative mood в subject: "add", "fix", "remove" (не "added", "fixes")
- Subject: max 72 символа
- Body: объяснение why, не what
- Footer: ссылка на issue/ticket, migration notes

### Примеры

```
feat(photos): add bulk approve/reject for moderation queue

Implements batch operations for photo moderation with
confirmation dialog and audit logging for each action.

Refs: #142
```

```
fix(shifts): prevent duplicate active shift on race condition

Add database-level partial unique index to enforce single
active shift per installer at DB level, not just application.

Refs: #187
```

```
chore(deps): update FastAPI to 0.115.x

Includes Pydantic v2 compatibility fixes in schemas.
No breaking API changes.
```

## Pull Request Rules

### Обязательные элементы PR

```markdown
## Summary
<!-- Что изменено и зачем -->

## Changes
<!-- Список конкретных изменений -->

## Risk Assessment
<!-- low / medium / high + пояснение -->

## Test Evidence
<!-- Какие тесты написаны/прошли -->

## Migration Notes
<!-- Есть ли миграции? Forward/backward compatible? -->

## Rollback Plan
<!-- Как откатить если что-то пойдёт не так -->
```

### Правила
- PR должен ссылаться на issue/ticket
- Минимум 1 approving review
- CI должен пройти перед merge
- Не мержить без review после конфликтов
- Squash merge для feature branches в develop
- Merge commit для develop → main (release)

### Review Checklist
- [ ] Код соответствует coding-standards.md
- [ ] Тесты покрывают новое поведение
- [ ] Миграции backward-compatible
- [ ] Документация обновлена
- [ ] Нет sensitive data в коде
- [ ] Error handling адекватный
- [ ] Audit logging для curator write actions

## Protected Branch Policy

### main
- No direct pushes
- Require PR with approval
- Require CI pass
- Force push forbidden
- Только merge commits
- Release tags создаются только от main

### develop
- No direct pushes
- Require PR with approval
- Require CI pass
- Force push forbidden

## Conflict Resolution

1. Author rebases на latest target branch
2. Resolve conflicts locally
3. Прогнать все тесты после rebase
4. НИКОГДА не bypass review после конфликтов

## Versioning

### Semantic Versioning
```
MAJOR.MINOR.PATCH
```

- MAJOR: breaking API changes
- MINOR: new features, backward-compatible
- PATCH: bug fixes, backward-compatible

### Tags
- Release tags только от `main`
- Format: `v1.2.3`
- Backend и frontend версионируются независимо
- Tag = deployable artifact

## Release Process

1. `develop` стабилен, все тесты проходят
2. Создать PR: `develop` → `main`
3. Review + approve
4. Merge
5. Tag release: `v1.X.Y`
6. Deploy to staging
7. Verify staging
8. Deploy to production
9. Verify production
10. Announce release
