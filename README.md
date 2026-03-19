# BELSI.Work Admin Panel

Веб-панель администратора для системы BELSI.Work — управление бригадами, сменами, фотоотчётами, задачами.

## Стек

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Radix UI + shadcn/ui
- React Query (@tanstack/react-query)
- React Router v7
- Axios

## Запуск

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Переменные окружения

| Переменная | Описание |
|-----------|----------|
| `VITE_API_BASE_URL` | URL бэкенда (например `/panel/api`) |
| `VITE_WS_URL` | WebSocket URL |
| `VITE_APP_NAME` | Название приложения |

## Лицензия

Proprietary. All rights reserved.
