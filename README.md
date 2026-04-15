# TrashGo — P2P Trash Pickup Marketplace

P2P-маркетплейс вывоза мусора для Казани с геймификацией.

**Live**: [trashgo-coral.vercel.app](https://trashgo-coral.vercel.app)

## Архитектура

| Сервис | Стек | Репозиторий | Деплой |
|--------|------|-------------|--------|
| **Frontend** | React 18 + Vite 6 + TailwindCSS 4 | [Trashgo](https://github.com/ilnyr27/Trashgo) | [Vercel](https://trashgo-coral.vercel.app) |
| **Backend** | Node.js 22 + Hono + Drizzle ORM | [Trashgo-API](https://github.com/ilnyr27/Trashgo-API) | [Railway](https://web-production-8d2c4.up.railway.app) |
| **Database** | PostgreSQL 16 | — | Railway (add-on) |

## Стек фронтенда

| Технология | Назначение |
|------------|------------|
| React 18.3 | UI-фреймворк |
| Vite 6.3 | Сборка |
| TailwindCSS 4.1 | Стили |
| React Router 7.13 | Маршрутизация |
| Zustand | Стейт-менеджмент (auth, orders) |
| TanStack Query | Серверный стейт и кэширование |
| Radix UI + shadcn/ui | Компоненты |
| Motion | Анимации |
| Recharts | Графики |
| Sonner | Тост-уведомления |

## Структура проекта

```
src/
├── api/                  # API-клиент и функции запросов
│   ├── client.ts         # Fetch-обёртка с JWT-заголовками
│   ├── auth.ts           # Авторизация: login, verify, register, refresh
│   └── orders.ts         # Заказы: CRUD, marketplace
├── app/
│   ├── components/       # Общие компоненты (Layout, Footer, ProtectedRoute)
│   ├── pages/            # 20 страниц (lazy-loaded)
│   ├── routes.tsx        # Маршруты с code-splitting и role-guards
│   └── App.tsx           # Корневой компонент (QueryClient + Theme + Router)
├── stores/
│   ├── auth.store.ts     # Zustand: user, token, isAuthenticated
│   └── orders.store.ts   # Zustand: orders state
├── types/
│   ├── user.ts           # User, UserRole
│   ├── order.ts          # Order, OrderStatus
│   └── api.ts            # ApiError, ApiResponse
└── lib/
    └── utils.ts          # Общие утилиты (getDayLabel, formatPhone)
```

## Быстрый старт

```bash
# Клонировать
git clone https://github.com/ilnyr27/Trashgo.git
cd Trashgo

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
# → http://localhost:5173
```

### Environment Variables

В Vercel (Settings → Environment Variables):

```env
VITE_API_URL=https://web-production-8d2c4.up.railway.app/api/v1
```

Локально создай `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Страницы

| Путь | Страница | Доступ |
|------|----------|--------|
| `/` | Landing (hero, features, how-it-works) | Публичный |
| `/login` | Вход по телефону + OTP | Публичный |
| `/register` | Регистрация (имя, роль, район) | Публичный |
| `/verify` | Подтверждение OTP | Публичный |
| `/select-role` | Выбор роли | Публичный |
| `/customer` | Дашборд заказчика | Только customer |
| `/contractor` | Дашборд подрядчика | Только contractor |
| `/create-order` | Создание заказа | Только customer |
| `/find-orders` | Маркетплейс заказов | Только contractor |
| `/order/:id` | Детали заказа | Авторизованные |
| `/subscriptions/*` | Подписки (создание, мои) | Авторизованные |
| `/find-contractors` | Поиск подрядчиков | Только customer |
| `/contractor/:id` | Профиль подрядчика | Авторизованные |
| `/invite-neighbor` | Пригласить соседа | Авторизованные |
| `/levels` | Система уровней | Авторизованные |
| `/achievements` | Достижения | Авторизованные |

## Авто-деплой

Push в `main` → Vercel автоматически деплоит в production.

## Связанные репозитории

- **Backend API**: [ilnyr27/Trashgo-API](https://github.com/ilnyr27/Trashgo-API)
- **Figma**: [Макет](https://www.figma.com/design/F4gDWeoxxZvFq5Wuuj5XBT/Review-file)

## Документация

- [PROJECT_PLAN.md](./PROJECT_PLAN.md) — архитектура, схема БД, API-эндпоинты, план фич
- [STRATEGY.md](./STRATEGY.md) — стратегия продукта, спринт-план, роли команды
- [DEPLOYMENT.md](./DEPLOYMENT.md) — гайд по деплою на Vercel
