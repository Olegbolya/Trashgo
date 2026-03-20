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

### 2. Backend Repository (To Create)
- **Repo**: `github.com/ilnyr27/Trashgo-API`
- **Deploy**: Railway
- **Tech Stack**: Bun + Hono + PostgreSQL + Redis

---

## 🎯 Tech Stack

### Frontend (Current Repo)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Vite | 6.3.5 | Build Tool |
| TailwindCSS | 4.1.12 | Styling |
| React Router | 7.13.0 | Routing |
| Material UI | 7.3.5 | UI Components |
| Radix UI | Latest | Headless Components |
| Motion | 12.23.24 | Animations |
| React Hook Form | 7.55.0 | Forms |
| Recharts | 2.15.2 | Charts/Analytics |

### Backend (Planned)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Runtime** | Bun 1.x | High-performance JS runtime |
| **Framework** | Hono | Edge-first web framework |
| **Database** | PostgreSQL 16 | Primary database |
| **ORM** | Drizzle ORM | Type-safe database queries |
| **Cache** | Redis/Upstash | Caching & sessions |
| **Queue** | BullMQ | Background jobs |
| **WebSockets** | Socket.io | Real-time updates |
| **Auth** | JWT + OAuth | Authentication |

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
                 │ REST/GraphQL API
                 │ WebSocket Connection
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

## 🗄️ Database Schema (Planned)

### Core Tables

```sql
-- Users & Authentication
users (id, email, phone, role, level, xp, created_at)
user_profiles (user_id, name, avatar, district_id, bio)
user_achievements (user_id, achievement_id, unlocked_at)

-- Orders
orders (id, customer_id, contractor_id, status, address, district_id)
order_items (order_id, item_type, quantity, weight)
order_history (order_id, status, timestamp, notes)

-- Subscriptions
subscriptions (id, customer_id, contractor_id, frequency, next_date)
subscription_schedules (subscription_id, day_of_week, time_slot)

-- Gamification
achievements (id, name, description, category, xp_reward, icon)
user_stats (user_id, total_orders, total_weight, streak_days)
leaderboards (district_id, user_id, rank, points, period)

-- Contractors
contractors (user_id, company_name, rating, verified, service_areas)
contractor_services (contractor_id, service_type, price, min_order)
contractor_availability (contractor_id, day, start_time, end_time)

-- Districts & Geolocation
districts (id, name, city, polygon_geojson)
service_areas (contractor_id, district_id, base_price)
```

---

## 🔌 API Endpoints (Planned)

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-otp
POST   /api/auth/logout
GET    /api/auth/me
```

### Users
```
GET    /api/users/:id
PATCH  /api/users/:id
GET    /api/users/:id/achievements
GET    /api/users/:id/stats
```

### Orders
```
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id
DELETE /api/orders/:id
GET    /api/orders/nearby (для подрядчиков)
```

### Subscriptions
```
GET    /api/subscriptions
POST   /api/subscriptions
GET    /api/subscriptions/:id
PATCH  /api/subscriptions/:id
DELETE /api/subscriptions/:id
```

### Contractors
```
GET    /api/contractors
GET    /api/contractors/:id
GET    /api/contractors/search?district=X&service=Y
POST   /api/contractors/:id/reviews
```

### Gamification
```
GET    /api/achievements
GET    /api/leaderboards?district=X&period=week
POST   /api/achievements/unlock
GET    /api/users/:id/level-progress
```

### WebSocket Events
```
WS     /ws/notifications
       - order.status_updated
       - achievement.unlocked
       - level.up
       - contractor.nearby
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

- [ ] Backend API с Bun + Hono
- [ ] PostgreSQL database setup
- [ ] Authentication (JWT + OTP)
- [ ] Orders CRUD API
- [ ] Contractor matching algorithm
- [ ] Real-time notifications (WebSocket)
- [ ] Payment integration (Stripe/Yookassa)
- [ ] Email/SMS notifications

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
VITE_API_URL=https://trashgo-api.up.railway.app
VITE_WS_URL=wss://trashgo-api.up.railway.app
VITE_GOOGLE_MAPS_API_KEY=your_key
```

**Auto-Deploy**:
- Push to `main` → Production deploy
- Push to `dev` → Preview deploy
- Pull Requests → Preview URLs

### Backend (Railway)

**Repository**: `ilnyr27/Trashgo-API` (to create)

**Services**:
1. API Server (Hono app)
2. PostgreSQL Database
3. Redis Cache
4. Worker (Background jobs)

**Environment Variables**:
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
FRONTEND_URL=https://trashgo.vercel.app
```

**Auto-Deploy**:
- Push to `main` → Production deploy
- Automatic database migrations
- Health checks & rollback

---

## 🔧 Development Workflow

### Local Development

```bash
# Frontend
npm install
npm run dev      # http://localhost:5173

# Backend (future)
bun install
bun run dev      # http://localhost:3000
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

**Repository**: https://github.com/ilnyr27/Trashgo
**Figma**: https://www.figma.com/design/F4gDWeoxxZvFq5Wuuj5XBT/Review-file

---

*Last Updated: 2026-03-20*
