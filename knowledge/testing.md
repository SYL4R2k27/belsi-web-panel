# Testing — BELSI.Work

## Стратегия

Пирамида тестирования:
```
         ┌─────┐
         │ E2E │        ← мало, дорогие, критические пути
        ┌┴─────┴┐
        │Integr.│       ← умеренно, API + DB + бизнес-логика
       ┌┴───────┴┐
       │  Unit   │      ← много, быстрые, доменные правила
       └─────────┘
```

## Unit Tests

### Backend (pytest)

**Что тестируется:**
- Бизнес-правила в service layer
- Валидация данных в Pydantic schemas
- Вычисления (payable_hours, payment amounts)
- State machine transitions (shift lifecycle, task status)
- Permission checks
- Domain exceptions

**Что НЕ тестируется unit-тестами:**
- SQLAlchemy models (тестируются integration)
- HTTP routing (тестируется integration)
- Third-party library internals

**Структура**
```python
# tests/unit/services/test_shift_service.py

class TestStartShift:
    def test_creates_shift_for_active_installer(self):
        # Arrange
        user = make_user(role="installer", is_active=True)
        repo = MockShiftRepo(active_shift=None)
        service = ShiftService(repo, audit=MockAudit())

        # Act
        shift = service.start_shift(user.id, ShiftStartData(...))

        # Assert
        assert shift.status == "active"
        assert shift.user_id == user.id

    def test_fails_when_active_shift_exists(self):
        # Arrange
        repo = MockShiftRepo(active_shift=existing_shift)
        service = ShiftService(repo, audit=MockAudit())

        # Act + Assert
        with pytest.raises(ShiftAlreadyActiveError):
            service.start_shift(user.id, ShiftStartData(...))

    def test_fails_for_blocked_user(self):
        # ...

    def test_fails_for_non_installer_role(self):
        # ...
```

**Naming Convention:**
- File: `test_<module>.py`
- Class: `Test<Feature>`
- Method: `test_<expected_behavior>` или `test_<action>_<condition>_<result>`

### Frontend (vitest)

**Что тестируется:**
- Utility functions (formatCurrency, formatDate, etc.)
- Custom hooks (useDebounce, etc.)
- Zod validation schemas
- Data transformations

**Структура**
```typescript
// __tests__/formatCurrency.test.ts
describe('formatCurrency', () => {
  it('formats positive amount with space separator', () => {
    expect(formatCurrency(1234.56)).toBe('1 234.56 ₽')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('0.00 ₽')
  })
})
```

## Integration Tests

### Backend (pytest + test database)

**Что тестируется:**
- API endpoint → service → repository → database полный путь
- HTTP status codes для success и error cases
- Пагинация и фильтрация
- Authentication и authorization
- Database constraints (unique, FK, check constraints)
- Migration forward/backward compatibility

**Инфраструктура:**
- Отдельная test PostgreSQL database
- Fixtures для создания тестовых данных
- Transaction rollback между тестами (не cleanup)
- Factory pattern для тестовых сущностей

**Структура**
```python
# tests/integration/test_photos_api.py

class TestPhotoModeration:
    async def test_approve_photo_as_curator(self, client, curator_token, pending_photo):
        response = await client.post(
            f"/api/v1/photos/{pending_photo.id}/approve",
            headers={"Authorization": f"Bearer {curator_token}"}
        )
        assert response.status_code == 200
        assert response.json()["data"]["status"] == "approved"

    async def test_reject_photo_requires_comment(self, client, curator_token, pending_photo):
        response = await client.post(
            f"/api/v1/photos/{pending_photo.id}/reject",
            headers={"Authorization": f"Bearer {curator_token}"},
            json={}  # no comment
        )
        assert response.status_code == 422

    async def test_installer_cannot_moderate(self, client, installer_token, pending_photo):
        response = await client.post(
            f"/api/v1/photos/{pending_photo.id}/approve",
            headers={"Authorization": f"Bearer {installer_token}"}
        )
        assert response.status_code == 403
```

### Contract Tests

**Что тестируется:**
- API response shape matches documented schema
- Field names are stable (snake_case, no renames)
- Pagination envelope format
- Error response format

## E2E Tests

### Критические пути (smoke tests)

| # | Сценарий | Что проверяется |
|---|---------|----------------|
| 1 | Curator login | Auth flow, JWT, redirect to dashboard |
| 2 | View dashboard | KPI loading, data display |
| 3 | Moderate photo | Approve/reject, audit log created |
| 4 | View shift detail | Shift data, timeline, photos |
| 5 | Create task | Form, validation, success toast |
| 6 | Send support message | Message delivery, unread counter |
| 7 | Block user | Confirmation dialog, user status change |
| 8 | View payment | Payment detail, amounts |

### Инструмент
- Playwright или Cypress для browser automation
- Запуск: перед production deploy (staging)
- Не заменяют integration tests, только smoke-проверка критических путей

## Test Factories

### Backend
```python
# tests/factories/user_factory.py
class UserFactory:
    @staticmethod
    def create(
        role: str = "installer",
        is_active: bool = True,
        foreman_id: UUID | None = None,
        **overrides
    ) -> User:
        return User(
            id=uuid4(),
            phone=f"+7900{random.randint(1000000, 9999999)}",
            role=role,
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            is_active=is_active,
            foreman_id=foreman_id,
            hourly_rate=Decimal("500.00"),
            **overrides
        )
```

## Покрытие

### Целевое покрытие

| Слой | Target | Mandatory |
|------|--------|-----------|
| Service layer (business logic) | 90%+ | Yes |
| Repository layer | 70%+ | Integration tests |
| API endpoints | 80%+ | Integration tests |
| Frontend utilities | 80%+ | Yes |
| Frontend components | 50%+ | Critical only |

### Что обязательно покрыто тестами
- Все state machine transitions (shift, photo, task, payment)
- Все permission checks (RBAC)
- Все financial calculations
- Все validation rules (Pydantic schemas)
- Все error paths для business rules

## Запуск тестов

```bash
# Backend
pytest tests/unit/                    # Unit tests
pytest tests/integration/             # Integration tests
pytest tests/ -m "not slow"           # All except slow
pytest tests/ --cov=app --cov-report=html  # With coverage

# Frontend
npm run test                          # vitest run
npm run test:watch                    # vitest watch
npm run test:coverage                 # with coverage
```

## CI Requirements

- All unit tests pass
- All integration tests pass
- Coverage does not decrease
- No new test failures
- Tests run in < 5 minutes (target)
