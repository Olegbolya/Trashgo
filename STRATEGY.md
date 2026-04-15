# TrashGo — Strategy & Sprint Plan

## Честный диагноз (CTO)

**Что есть сейчас:** кликабельный прототип из Figma. 88 файлов, 12500 строк кода — и 0 строк, которые делают что-то реальное. Нет бэкенда, нет авторизации, нет базы данных, нет стейт-менеджмента. Все данные — хардкод.

**Что нужно:** превратить интерактивный макет в реальный MVP.

---

## 1. Product Manager — Roadmap & User Stories

### RICE-приоритизация фич

| Фича | Reach | Impact | Confidence | Effort | RICE Score | Priority |
|------|-------|--------|------------|--------|------------|----------|
| Auth (регистрация/вход) | 10 | 10 | 10 | 3 | 333 | P0 |
| Create Order (реальный) | 10 | 9 | 9 | 4 | 202 | P0 |
| Contractor matching | 8 | 9 | 8 | 5 | 115 | P0 |
| Order lifecycle (статусы) | 9 | 8 | 9 | 4 | 162 | P0 |
| Push уведомления | 7 | 7 | 7 | 5 | 69 | P1 |
| Система подписок | 6 | 7 | 6 | 6 | 42 | P1 |
| Геймификация (XP/ачивки) | 5 | 6 | 5 | 7 | 21 | P2 |
| Лидерборды | 3 | 4 | 4 | 5 | 10 | P3 |
| NFT бейджи | 2 | 2 | 2 | 8 | 1 | P4 — nice-to-have |

### Sprint 1 (Week 1-2): Foundation

**Epic: Real Auth & Core Flow**

#### US-001: Регистрация пользователя
```
КАК новый пользователь
Я ХОЧУ зарегистрироваться по номеру телефона
ЧТОБЫ получить доступ к платформе

Acceptance Criteria:
- [ ] Ввод номера телефона с маской +7 (XXX) XXX-XX-XX
- [ ] Отправка OTP кода через SMS API (mock на dev)
- [ ] Верификация кода (4 цифры, 60 сек таймаут)
- [ ] Выбор роли: заказчик или исполнитель
- [ ] Заполнение профиля (имя, район)
- [ ] JWT токен сохраняется, сессия живёт 30 дней
- [ ] При рефреше страницы — пользователь остаётся залогинен
```

#### US-002: Создание заказа (заказчик)
```
КАК заказчик
Я ХОЧУ создать заказ на вынос мусора
ЧТОБЫ исполнитель забрал мусор от моей двери

Acceptance Criteria:
- [ ] Форма: адрес (автокомплит), дата, время, объём (мешки), цена
- [ ] Валидация: дата в будущем, цена > 0, адрес не пустой
- [ ] Заказ сохраняется в БД со статусом "new"
- [ ] Заказчик видит заказ в своём дашборде
- [ ] Заказ появляется в маркетплейсе для исполнителей
```

#### US-003: Поиск и принятие заказа (исполнитель)
```
КАК исполнитель
Я ХОЧУ видеть доступные заказы рядом со мной
ЧТОБЫ выбрать подходящий и заработать

Acceptance Criteria:
- [ ] Список заказов отсортирован по расстоянию
- [ ] Фильтры: район, дата, мин. цена
- [ ] Кнопка "Взять заказ" меняет статус на "accepted"
- [ ] Заказчик получает уведомление
- [ ] Заказ исчезает из маркетплейса
```

#### US-004: Lifecycle заказа
```
Статусы: new → accepted → in_progress → completed → rated
Каждый переход:
- [ ] Запись в order_history
- [ ] Уведомление обеим сторонам (toast сейчас, push потом)
- [ ] Обновление UI в реальном времени
```

### Sprint 2 (Week 3-4): Growth & Retention

- US-005: Система подписок (регулярный вывоз)
- US-006: Рейтинг и отзывы
- US-007: XP и уровни (реальная геймификация)
- US-008: Реферальная программа

---

## 2. Project Manager — Execution Plan

### Sprint 1 Velocity Target: 40 story points

| Day | Task | SP | Owner | Status |
|-----|------|----|-------|--------|
| D1 | Zustand store + AuthContext + ProtectedRoute | 5 | Frontend | - |
| D1 | Backend: Bun + Hono + Drizzle + PostgreSQL init | 5 | Backend | - |
| D2 | Backend: Auth API (register, login, verify OTP) | 8 | Backend | - |
| D2 | Frontend: подключить Login/Verify к реальному API | 5 | Frontend | - |
| D3 | Backend: Orders CRUD API | 8 | Backend | - |
| D3 | Frontend: CreateOrder → реальная отправка | 3 | Frontend | - |
| D4 | Backend: Contractor matching + FindOrders API | 5 | Backend | - |
| D4 | Frontend: FindOrders → реальные данные | 3 | Frontend | - |
| D5 | Backend: Order status transitions | 3 | Backend | - |
| D5 | Frontend: CustomerDashboard → API данные | 5 | Frontend | - |
| D6 | Frontend: ContractorDashboard → API данные | 5 | Frontend | - |
| D6 | E2E тесты критического пути | 3 | QA | - |
| D7 | Фикс багов, полировка, деплой | 2 | All | - |

### Blockers Protocol
- Задача висит > 2 дней → эскалация в STRATEGY.md
- Каждый PR требует review
- Мёрж только в dev → staging test → main

---

## 3. Data Analyst — Metrics & Funnels

### Core Funnel

```
Landing → Register → Verify → Create Order → Match → Complete → Rate
  100%      40%        35%       20%           15%      12%       8%
```

### Key Metrics (Day 1)

| Metric | Definition | Target (Month 1) |
|--------|-----------|-------------------|
| **DAU** | Unique users/day | 50 |
| **Activation** | Created first order | 30% of registered |
| **Retention D7** | Active 7 days after signup | 15% |
| **Orders/day** | Completed orders per day | 10 |
| **Avg order value** | Mean price per order | 60₽ |
| **Contractor utilization** | Orders accepted / available hours | 40% |
| **Time to match** | Order created → accepted | < 2 hours |
| **NPS** | Net Promoter Score | > 30 |

### Events to Track (frontend)

```typescript
// Минимальный event tracking
track('page_view', { page, user_role })
track('register_started', { method: 'phone' })
track('register_completed', { role })
track('order_created', { district, price, volume })
track('order_accepted', { time_to_accept })
track('order_completed', { duration, rating })
track('achievement_unlocked', { achievement_id })
track('referral_sent', { method })
```

### LTV / CAC Model

```
LTV = avg_orders_per_month × avg_margin × avg_lifetime_months
    = 4 × 15₽ × 6 = 360₽

CAC target = LTV / 3 = 120₽
    → реферальная скидка 50₽ вписывается
    → органик через Telegram/WhatsApp = 0₽ CAC
```

---

## 4. Tech Lead — Architecture Decision

### Текущая проблема
Frontend-only с хардкодом. Нет архитектуры. Нет слоя данных.

### Решение: Clean Architecture

```
Frontend (React + Vite)          Backend (Bun + Hono)
┌──────────────────────┐         ┌──────────────────────┐
│ UI Layer             │         │ API Layer (Hono)     │
│ ├── Pages            │  HTTP   │ ├── routes/          │
│ ├── Components       │◄───────►│ ├── middleware/      │
│ └── Hooks            │  REST   │ └── validators/      │
├──────────────────────┤         ├──────────────────────┤
│ State Layer          │         │ Service Layer        │
│ ├── Zustand stores   │         │ ├── auth.service     │
│ ├── React Query      │         │ ├── order.service    │
│ └── Auth context     │         │ └── user.service     │
├──────────────────────┤         ├──────────────────────┤
│ API Client Layer     │         │ Data Layer           │
│ ├── api/client.ts    │         │ ├── Drizzle ORM      │
│ ├── api/auth.ts      │         │ ├── PostgreSQL       │
│ └── api/orders.ts    │         │ └── Redis cache      │
└──────────────────────┘         └──────────────────────┘
```

### State Management Decision

```
Zustand (NOT Redux) — потому что:
- Меньше boilerplate
- Нативный TypeScript
- Middleware (persist, devtools)
- Проще для маленькой команды

React Query — для серверного стейта:
- Кэширование запросов
- Автоматическая синхронизация
- Optimistic updates
- Background refetching
```

### API Design: REST + Versioning

```
Base URL: /api/v1

Auth:     POST /api/v1/auth/register
          POST /api/v1/auth/login
          POST /api/v1/auth/verify
          POST /api/v1/auth/refresh

Users:    GET  /api/v1/users/me
          PATCH /api/v1/users/me

Orders:   GET  /api/v1/orders
          POST /api/v1/orders
          GET  /api/v1/orders/:id
          PATCH /api/v1/orders/:id/status
          GET  /api/v1/orders/available (contractor)

Contractors: GET /api/v1/contractors/search
```

---

## 5. Backend — Technical Spec

### Stack
- **Runtime**: Bun 1.x
- **Framework**: Hono
- **Database**: PostgreSQL 16 (Railway)
- **ORM**: Drizzle
- **Cache**: Redis (Upstash)
- **Auth**: JWT (access 15min + refresh 30d)
- **Validation**: Zod

### Критические требования

```
Idempotency:
- POST /orders → idempotency key в header
- Повторный запрос с тем же ключом = тот же результат

Error handling:
- Стандартный формат: { error: { code, message, details } }
- HTTP коды: 400/401/403/404/422/500
- Не отдаём stack traces в production

Rate limits:
- Auth endpoints: 5 req/min per IP
- Orders: 20 req/min per user
- Search: 30 req/min per user

Logging:
- Structured JSON logs
- Request ID в каждом запросе
- Latency tracking
```

### DB Schema (минимальная)

```sql
users:
  id          UUID PRIMARY KEY
  phone       VARCHAR(20) UNIQUE NOT NULL
  role        ENUM('customer', 'contractor') NOT NULL
  name        VARCHAR(100)
  district    VARCHAR(100)
  xp          INT DEFAULT 0
  level       INT DEFAULT 1
  created_at  TIMESTAMP DEFAULT NOW()

orders:
  id          UUID PRIMARY KEY
  customer_id UUID REFERENCES users(id)
  contractor_id UUID REFERENCES users(id) NULL
  address     TEXT NOT NULL
  district    VARCHAR(100)
  status      ENUM('new','accepted','in_progress','completed','cancelled')
  volume      INT NOT NULL
  price       INT NOT NULL
  scheduled_at TIMESTAMP NOT NULL
  created_at  TIMESTAMP DEFAULT NOW()

order_history:
  id          UUID PRIMARY KEY
  order_id    UUID REFERENCES orders(id)
  status      VARCHAR(20) NOT NULL
  created_at  TIMESTAMP DEFAULT NOW()

INDEX: orders(district, status) — для поиска доступных заказов
INDEX: orders(customer_id, created_at) — для дашборда
INDEX: orders(contractor_id, status) — для дашборда исполнителя
```

---

## 6. Frontend — Что менять

### Текущий стек → Целевой стек

| Было | Станет |
|------|--------|
| Хардкод данных | React Query + API |
| useState везде | Zustand stores |
| Нет auth | JWT + ProtectedRoute |
| alert() | toast (уже исправлено) |
| Нет валидации | react-hook-form + Zod |
| 1 context (theme) | Auth + Theme + Notifications |

### Новая файловая структура

```
src/
├── app/
│   ├── components/     (UI компоненты — оставляем)
│   ├── pages/          (страницы — рефакторим)
│   ├── context/        (ThemeContext — оставляем)
│   └── routes.tsx      (lazy loading — оставляем)
├── api/                (NEW — API клиент)
│   ├── client.ts       (axios/fetch instance)
│   ├── auth.ts         (auth endpoints)
│   ├── orders.ts       (orders endpoints)
│   └── users.ts        (users endpoints)
├── stores/             (NEW — Zustand)
│   ├── auth.store.ts   (user, token, isAuth)
│   ├── orders.store.ts (active orders cache)
│   └── ui.store.ts     (sidebar, modals)
├── hooks/              (NEW — custom hooks)
│   ├── useAuth.ts
│   ├── useOrders.ts
│   └── useContractors.ts
├── lib/
│   └── utils.ts        (shared utilities — есть)
└── types/              (NEW — TypeScript types)
    ├── user.ts
    ├── order.ts
    └── api.ts
```

### Performance Targets

| Metric | Сейчас | Цель |
|--------|--------|------|
| LCP | ~2.5s | < 1.5s |
| TTI | ~3s | < 2s |
| Bundle (main) | 280KB | < 200KB |
| First paint | ~1.5s | < 0.8s |

---

## 7. Mobile — UX Audit

### Проблемы текущего мобильного UX

```
❌ 5 кликов для создания заказа (Home → Login → Verify → Dashboard → Create)
   → Цель: 2 клика (Dashboard → Create, если залогинен)

❌ Нет offline mode — белый экран без интернета
   → Цель: Service Worker + cached shell

❌ Нет pull-to-refresh
   → Цель: native-feel refresh на дашбордах

❌ Bottom nav не фиксирован при скролле на некоторых страницах
   → Цель: sticky bottom nav везде
```

---

## 8. DevOps — CI/CD Pipeline

### Текущее состояние
- Frontend: push → Vercel (автоматически)
- Backend: не существует

### Целевое состояние

```yaml
# Frontend Pipeline (Vercel)
push to main:
  1. Install deps
  2. Type check (tsc --noEmit)
  3. Build
  4. Deploy to production

push to dev:
  1. Install deps
  2. Type check
  3. Build
  4. Deploy to staging (preview URL)

# Backend Pipeline (Railway)
push to main:
  1. Install deps (bun install)
  2. Run tests (bun test)
  3. Run migrations
  4. Deploy
  5. Health check
  6. Rollback if health check fails
```

### Monitoring

```
Sentry → Error tracking (frontend + backend)
Railway Metrics → CPU, Memory, Response time
Vercel Analytics → Core Web Vitals
Uptime Robot → Availability monitoring
```

---

## 9. QA — Test Strategy

### Тестовое покрытие (Sprint 1 target)

| Уровень | Coverage | Что тестируем |
|---------|----------|---------------|
| Unit | 60% | Zustand stores, utils, validators |
| Integration | 40% | API endpoints, DB queries |
| E2E | Критический путь | Register → Create Order → Accept → Complete |

### Regression Checklist

```
[ ] Landing page грузится < 2s
[ ] Регистрация работает (новый пользователь)
[ ] Вход работает (существующий пользователь)
[ ] Создание заказа → появляется в маркетплейсе
[ ] Принятие заказа → исчезает из маркетплейса
[ ] Завершение заказа → обновляется дашборд
[ ] Рефреш страницы → пользователь остаётся залогинен
[ ] 404 страница работает для несуществующих роутов
[ ] Mobile responsive: все страницы корректны на 375px
```

---

## 10. UX/UI Designer — User Flow

### Текущий User Flow (Broken)

```
Home → Login → Verify → SelectRole → Register → Dashboard
         ↓ (нет backend)    ↓ (hardcoded)      ↓ (fake data)
     Ничего не работает реально
```

### Целевой User Flow

```
Home
 ├── "Нужно вынести мусор"
 │    └── Login → OTP → [new?] Register → CustomerDashboard
 │                                              ├── Create Order ← 1 tap
 │                                              ├── My Orders (status tracking)
 │                                              ├── My Subscriptions
 │                                              └── Profile (XP, achievements)
 │
 └── "Хочу заработать"
      └── Login → OTP → [new?] Register → ContractorDashboard
                                               ├── Available Orders ← sorted by distance
                                               ├── My Schedule
                                               ├── Earnings
                                               └── Profile (XP, rating)
```

### Каждый экран отвечает на вопрос:

| Экран | Зачем он? |
|-------|-----------|
| Home | Конвертировать посетителя → регистрация |
| Login | Быстрый вход за 30 сек |
| CustomerDashboard | Создать заказ за 2 тапа |
| ContractorDashboard | Найти заказ рядом за 10 сек |
| CreateOrder | Минимум полей → максимум конверсии |
| FindOrders | Увидеть цену и расстояние мгновенно |

---

## 11. Motion / Creative — Micro-interactions

### Влияние на retention (не просто "красиво")

| Interaction | Где | Зачем |
|-------------|-----|-------|
| Confetti при завершении заказа | OrderComplete | Дофаминовый спайк → хочется повторить |
| Progress bar при создании заказа | CreateOrder | Эффект прогресса → снижает брошенность |
| Shake при ошибке валидации | Все формы | Тактильный фидбек → быстрое исправление |
| Slide-up при новом заказе | ContractorDash | Urgency → быстрее берут заказ |
| XP counter animation | Dashboard | Gamification loop → retention |
| Badge unlock animation | Achievements | Коллекционерский инстинкт |

---

## 12. Growth / Marketing — Growth Engine

### Гипотезы роста

| # | Гипотеза | Метрика | A/B тест |
|---|---------|---------|----------|
| G1 | Скидка 30₽ за первый заказ увеличит конверсию на 40% | Conversion rate | Скидка vs без |
| G2 | "Ваш сосед уже сэкономил X₽" увеличит реферальность | Referral rate | Social proof vs no |
| G3 | Push "Новый заказ рядом!" увеличит response time | Time to accept | Push vs no push |
| G4 | Streak bonus (3 дня подряд = +50 XP) увеличит D7 retention | D7 retention | Streak vs no streak |

### Воронка реферальной программы

```
User A приглашает → User B регистрируется → User B делает 1й заказ
         ↓                    ↓                      ↓
   +50₽ бонус          -30₽ скидка              оба получают XP
```

### Каналы привлечения (по CAC)

```
1. Реферальная система    — CAC: 50₽  (скидка)
2. Telegram каналы района — CAC: 0₽   (органик)
3. Объявления в подъездах — CAC: 5₽   (печать)
4. WhatsApp группы дома   — CAC: 0₽   (вирусный)
5. Avito/Юла реклама      — CAC: 80₽  (платный)
```

---

## 13. Content / SMM — Content Strategy

### Каждый пост работает на одну из 3 целей:

| Тип | Цель | Пример |
|-----|------|--------|
| **Привлечение** | Новые пользователи | "Надоело таскать мешки? В Казани уже 200 человек этого не делают" |
| **Прогрев** | Доверие | "Исполнитель Дмитрий заработал 15000₽ за первый месяц" |
| **Продажа** | Конверсия | "Первый заказ — 30₽ скидка. Попробуй, риска нет" |

### Контент-план (Week 1)

| День | Канал | Тип | Текст |
|------|-------|-----|-------|
| Пн | Telegram | Привлечение | "Кто в Казани ещё сам выносит мусор? Серьёзно?" |
| Вт | Instagram | Прогрев | Видео: "День исполнителя TrashGo — сколько можно заработать" |
| Ср | WhatsApp | Продажа | "Скидка 30₽ на первый заказ — только эта неделя" |
| Чт | Telegram | Прогрев | "Почему 50₽ за вынос — это дешевле, чем ваше время" |
| Пт | Telegram | Привлечение | "Присоединяйся к 100+ жителям Казани на TrashGo" |

---

## 14. CTO — Executive Summary

### Что делаем СЕЙЧАС (Sprint 1):

```
ДЕНЬ 1-2: Foundation
├── Frontend: Zustand + Auth store + ProtectedRoute + API client
└── Backend:  Bun + Hono + PostgreSQL + Auth endpoints

ДЕНЬ 3-4: Core Flow
├── Frontend: CreateOrder → real API, Dashboard → real data
└── Backend:  Orders CRUD + contractor matching

ДЕНЬ 5-6: Integration
├── Frontend: ContractorDashboard → real data, order lifecycle
└── Backend:  Status transitions + notifications

ДЕНЬ 7: Ship
├── E2E test critical path
├── Fix blockers
└── Deploy to production
```

### Что НЕ делаем (сознательно откладываем):

```
❌ Геймификация (XP, ачивки) → Sprint 2
❌ Подписки → Sprint 2
❌ Оплата → Sprint 3
❌ Push уведомления → Sprint 2
❌ Мобильное приложение → Sprint 4+
❌ NFT/Web3 → никогда (пока)
❌ AI рекомендации → Sprint 5+
```

### Definition of Done (Sprint 1):

```
✅ Пользователь может зарегистрироваться
✅ Заказчик может создать реальный заказ
✅ Исполнитель видит доступные заказы
✅ Исполнитель может взять заказ
✅ Обе стороны видят статус заказа
✅ Данные сохраняются в БД
✅ При рефреше пользователь остаётся залогинен
✅ Всё работает на мобильном
```

---

*Документ создан: 2026-04-15*
*Следующий review: после Sprint 1*
