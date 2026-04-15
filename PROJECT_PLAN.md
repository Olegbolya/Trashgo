# TrashGo - Project Plan & Architecture

## 📋 Project Overview

**TrashGo** - платформа для вывоза мусора с геймификацией и системой поиска подрядчиков.

**Figma Design**: [Review file](https://www.figma.com/design/F4gDWeoxxZvFq5Wuuj5XBT/Review-file)

---

## 🏗️ Repository Structure

### 1. Frontend Repository
- **Repo**: [github.com/ilnyr27/Trashgo](https://github.com/ilnyr27/Trashgo)
- **Deploy**: Vercel
- **Tech Stack**: React 18 + Vite 6 + TailwindCSS 4

### 2. Backend Repository
- **Repo**: [github.com/ilnyr27/Trashgo-API](https://github.com/ilnyr27/Trashgo-API)
- **Deploy**: [Railway](https://web-production-8d2c4.up.railway.app)
- **Tech Stack**: Node.js 22 + Hono + Drizzle ORM + PostgreSQL

---

## 🎯 Tech Stack

### Frontend (Deployed)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI-фреймворк |
| Vite | 6.3.5 | Сборка |
| TailwindCSS | 4.1.12 | Стили |
| React Router | 7.13.0 | Маршрутизация |
| Zustand | Latest | Стейт-менеджмент |
| TanStack Query | Latest | Серверный стейт |
| Radix UI + shadcn/ui | Latest | UI-компоненты |
| Motion | 12.23.24 | Анимации |
| React Hook Form | 7.55.0 | Формы |
| Recharts | 2.15.2 | Графики |

### Backend (Deployed)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Runtime** | Node.js 22 | JavaScript runtime |
| **Framework** | Hono 4.x | HTTP-фреймворк |
| **Database** | PostgreSQL 16 | Основная БД (Railway) |
| **ORM** | Drizzle ORM | Типизированные SQL-запросы |
| **Auth** | JWT (jsonwebtoken) | Access + Refresh токены |
| **Validation** | Zod 4.x | Валидация запросов |
| **Deploy** | Railway (Nixpacks) | Авто-деплой из GitHub |

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (Vercel)                  │
│         React + Vite + TailwindCSS              │
│                                                 │
│  Pages:                                         │
│  • Landing (Home, Hero, Features)               │
│  • Auth (Login, Register, Verify)               │
│  • Orders (Create, Find, Detail)                │
│  • Dashboards (Customer, Contractor)            │
│  • Subscriptions & Gamification                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ REST API (JSON)
                 │ JWT Authorization
                 ▼
┌─────────────────────────────────────────────────┐
│            API Gateway (Railway)                │
│               Hono Framework                    │
│          Authentication & Routing               │
└────────────┬────────────────────────────────────┘
             │
   ┌─────────┼─────────┬──────────┬──────────┐
   │         │         │          │          │
┌──▼──┐  ┌──▼──┐  ┌───▼───┐  ┌───▼───┐  ┌──▼──┐
│Users│  │Order│  │Gaming │  │Payment│  │Notif│
│ Svc │  │ Svc │  │  Svc  │  │  Svc  │  │ Svc │
└──┬──┘  └──┬──┘  └───┬───┘  └───┬───┘  └──┬──┘
   │        │         │          │         │
   └────────┴─────────┴──────────┴─────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
      ┌────▼─────┐         ┌────▼────┐
      │PostgreSQL│         │  Redis  │
      │(Railway) │         │ (Cache) │
      └──────────┘         └─────────┘
```

---

## 🎮 Gamification System Design

### User Progression

```
Level System:
┌─────────────────────────────────────────────┐
│ Level 1-5:   Новичок (Rookie)               │
│ Level 6-10:  Эколог (Eco-Warrior)           │
│ Level 11-20: Профи (Pro Recycler)           │
│ Level 21-30: Эксперт (Eco Expert)           │
│ Level 31+:   Легенда (Green Legend)         │
└─────────────────────────────────────────────┘
```

### Achievement Categories

1. **Order Achievements**
   - First Order (Первый заказ) - 10 XP
   - 10 Orders Completed - 50 XP
   - 100 Orders Completed - 500 XP
   - Speed Demon (заказ < 24ч) - 25 XP

2. **Eco Achievements**
   - Recycler (сортировка мусора) - 30 XP
   - Green Week (7 дней подряд) - 100 XP
   - Eco Month (30 дней) - 500 XP

3. **Social Achievements**
   - Invite Friend - 50 XP
   - Team Player (5 соседей) - 100 XP
   - Community Leader (20 соседей) - 300 XP

4. **Contractor Achievements**
   - Fast Service (< 2ч отклик) - 20 XP
   - 5-Star Rating x10 - 100 XP
   - 100 Jobs Completed - 1000 XP

### Rewards System

- **Points**: XP для прогресса уровня
- **Badges**: Коллекционные достижения
- **Discounts**: Скидки от подрядчиков (10-30%)
- **Premium Features**: Приоритет в поиске, аналитика
- **Leaderboards**: Глобальный/по районам

---

## 🗄️ Database Schema (Deployed)

### Текущие таблицы (PostgreSQL на Railway)

```sql
-- Пользователи
users (id UUID, phone, name, role [customer|contractor], district, xp, level, password_hash, created_at)

-- OTP-коды для авторизации
otp_codes (id UUID, phone, code, expires_at, used, created_at)

-- Заказы
orders (id UUID, customer_id FK, contractor_id FK, address, district, status [new|accepted|in_progress|completed|cancelled], volume, price, description, scheduled_at, created_at, updated_at)

-- Аудит-лог статусов
order_history (id UUID, order_id FK, status, note, created_at)

-- Refresh-токены (ротация)
refresh_tokens (id UUID, user_id FK, token UNIQUE, expires_at, created_at)

Индексы:
- idx_orders_district_status (district, status)
- idx_orders_customer (customer_id, created_at)
- idx_orders_contractor (contractor_id, status)
```

### Таблицы для будущих фаз

```sql
-- Подписки
subscriptions (id, customer_id, contractor_id, frequency, next_date)

-- Геймификация
achievements (id, name, description, category, xp_reward, icon)
user_achievements (user_id, achievement_id, unlocked_at)
leaderboards (district_id, user_id, rank, points, period)

-- Подрядчики (расширение)
contractor_services (contractor_id, service_type, price, min_order)
contractor_availability (contractor_id, day, start_time, end_time)
```

---

## 🔌 API Endpoints

**Base URL**: `https://web-production-8d2c4.up.railway.app/api/v1`

### Реализовано (v1)

#### Auth `/api/v1/auth`
```
POST /login       — Отправка OTP на телефон
POST /verify      — Проверка OTP → JWT (или isNewUser)
POST /register    — Регистрация нового юзера (после verify)
POST /refresh     — Ротация JWT-пары
```

#### Users `/api/v1/users` (JWT required)
```
GET  /me          — Профиль текущего пользователя
PATCH /me         — Обновить имя/район
```

#### Orders `/api/v1/orders` (JWT required)
```
GET  /            — Мои заказы
GET  /available   — Маркетплейс (только contractor)
POST /            — Создать заказ (только customer)
PATCH /:id/status — Сменить статус (state machine)
```

### Планируется (v2+)

```
GET    /api/v1/subscriptions          — Подписки
GET    /api/v1/contractors/search     — Поиск подрядчиков
GET    /api/v1/achievements           — Список достижений
GET    /api/v1/leaderboards           — Рейтинги
WS     /ws/notifications              — Реалтайм события
```

---

## 📦 Feature Breakdown

### MVP Phase 1 (Current Frontend Features)

- [x] Landing page с Hero, Features, How It Works
- [x] Authentication flow (Login, Verify, Select Role)
- [x] Registration для клиентов и подрядчиков
- [x] Create Order форма
- [x] Find Orders marketplace
- [x] Customer Dashboard
- [x] Contractor Dashboard
- [x] Level System UI
- [x] Achievements Panel UI
- [x] Create Subscription
- [x] My Subscriptions
- [x] Find Contractors
- [x] Invite Neighbor

### Phase 2 (Backend + Integration)

- [x] Backend API на Node.js 22 + Hono
- [x] PostgreSQL на Railway
- [x] Authentication (OTP → JWT с ротацией)
- [x] Orders CRUD API со статусной машиной
- [x] Деплой на Railway с авто-миграциями
- [ ] Подключение фронта к реальному API
- [ ] SMS-провайдер (SMS.ru / SMS Aero)
- [ ] Contractor matching algorithm
- [ ] Payment integration (ЮKassa)
- [ ] Real-time notifications (WebSocket)

### Phase 3 (Gamification)

- [ ] Achievement engine
- [ ] XP calculation system
- [ ] Leaderboards (global + district)
- [ ] Rewards & discount system
- [ ] Streak tracking
- [ ] Social features (invites, teams)

### Phase 4 (Advanced Features)

- [ ] AI-powered contractor recommendations
- [ ] Route optimization for contractors
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Mobile app (React Native)
- [ ] Web3 integration (NFT badges)

---

## 🚀 Deployment Strategy

### Frontend (Vercel)

**Repository**: `ilnyr27/Trashgo`

**Build Settings**:
```bash
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Environment Variables**:
```env
VITE_API_URL=https://web-production-8d2c4.up.railway.app/api/v1
```

**Auto-Deploy**:
- Push to `main` → Production deploy
- Push to `dev` → Preview deploy
- Pull Requests → Preview URLs

### Backend (Railway)

**Repository**: [ilnyr27/Trashgo-API](https://github.com/ilnyr27/Trashgo-API)

**Services**:
1. API Server (Hono) — `web-production-8d2c4.up.railway.app`
2. PostgreSQL Database — Railway add-on

**Environment Variables**:
```env
DATABASE_URL=postgresql://... (от Railway PostgreSQL)
JWT_SECRET=<random>
JWT_REFRESH_SECRET=<random>
FRONTEND_URL=https://trashgo-coral.vercel.app
NODE_ENV=production
```

**Auto-Deploy**:
- Push to `main` → Production deploy
- Automatic database migrations
- Health checks & rollback

---

## 🔧 Development Workflow

### Local Development

```bash
# Frontend (c:\Users\ilray\Claude\TrashGo)
npm install
npm run dev      # http://localhost:5173

# Backend (c:\Users\ilray\Claude\Trashgo-API)
npm install
npm run dev      # http://localhost:3000
```

### Git Workflow

```
main (production)
  └── dev (development)
       ├── feature/order-system
       ├── feature/gamification
       └── feature/payments
```

### CI/CD Pipeline

**GitHub Actions** (Frontend):
```yaml
on: push
jobs:
  - Lint & Type Check
  - Run Tests
  - Build Production
  - Deploy to Vercel (auto)
```

**Railway** (Backend):
```yaml
on: push to main
jobs:
  - Run Tests
  - Database Migrations
  - Deploy to Railway
  - Health Check
```

---

## 🎨 Design System

### Colors (from Tailwind config)

```
Primary:   Green (#10b981, #059669)
Secondary: Blue (#3b82f6)
Success:   Green (#22c55e)
Warning:   Yellow (#eab308)
Error:     Red (#ef4444)
Neutral:   Gray (#64748b)
```

### Typography

```
Font Family: System fonts (SF Pro, Inter, Roboto)
Sizes:       12px, 14px, 16px, 20px, 24px, 32px
Weights:     400 (regular), 500 (medium), 600 (semibold), 700 (bold)
```

### Components (Available)

- Buttons (Primary, Secondary, Tertiary)
- Cards, Dialogs, Modals
- Forms (Input, Select, Textarea, Checkbox)
- Navigation (Header, Footer, Sidebar)
- Data Display (Tables, Charts, Badges)
- Feedback (Toasts, Alerts, Progress)

---

## 📊 Analytics & Monitoring

### Metrics to Track

**User Metrics**:
- Daily/Monthly Active Users (DAU/MAU)
- User Retention (D1, D7, D30)
- Registration → First Order conversion
- Average Order Value (AOV)

**Gamification Metrics**:
- Achievement unlock rate
- Average user level
- Daily streak retention
- Leaderboard engagement

**Business Metrics**:
- Orders per day
- Contractor utilization
- Average response time
- Customer satisfaction (NPS)

### Tools

- **Vercel Analytics** (Frontend performance)
- **Sentry** (Error tracking)
- **PostHog** (Product analytics)
- **Railway Metrics** (Backend performance)

---

## 🔐 Security Considerations

### Authentication
- JWT with refresh tokens
- OTP verification for phone/email
- Rate limiting on auth endpoints
- Password hashing (bcrypt/argon2)

### API Security
- CORS configuration
- Rate limiting (Redis)
- Input validation (Zod)
- SQL injection protection (Drizzle ORM)
- XSS protection

### Data Privacy
- GDPR compliance
- Data encryption at rest
- Secure file uploads
- PII anonymization in logs

---

## 📱 Future Considerations

### Mobile App
- React Native + Expo
- Shared components with web
- Push notifications
- Geolocation tracking

### Web3 Integration
- NFT achievement badges
- Token rewards for eco-actions
- Decentralized reputation system
- Blockchain-verified recycling

### AI Features
- Smart contractor matching
- Price prediction
- Demand forecasting
- Image recognition (мусор classification)

---

## 📞 Contact & Resources

**Frontend**: https://github.com/ilnyr27/Trashgo
**Backend**: https://github.com/ilnyr27/Trashgo-API
**Figma**: https://www.figma.com/design/F4gDWeoxxZvFq5Wuuj5XBT/Review-file
**Live**: https://trashgo-coral.vercel.app
**API**: https://web-production-8d2c4.up.railway.app

---

*Last Updated: 2026-04-15*
