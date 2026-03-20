# Deployment Guide - TrashGo

## Frontend Deployment на Vercel

### Шаг 1: Создание проекта на Vercel

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите **"Add New"** → **"Project"**
3. Выберите **"Import Git Repository"**
4. Найдите и выберите **`ilnyr27/Trashgo`**

### Шаг 2: Настройка Build Settings

Vercel автоматически определит Vite проект. Проверьте настройки:

```
Framework Preset:      Vite
Build Command:         npm run build
Output Directory:      dist
Install Command:       npm install
Root Directory:        ./
```

### Шаг 3: Environment Variables (опционально)

Если в будущем понадобятся переменные окружения:

```env
VITE_API_URL=https://your-backend-url.railway.app
VITE_WS_URL=wss://your-backend-url.railway.app
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

Добавить через: **Settings** → **Environment Variables**

### Шаг 4: Deploy

1. Нажмите **"Deploy"**
2. Vercel автоматически:
   - Установит зависимости (`npm install`)
   - Соберет проект (`npm run build`)
   - Задеплоит на CDN

**Ожидаемое время**: 2-3 минуты

### Шаг 5: Получение URL

После успешного деплоя вы получите:

- **Production URL**: `https://trashgo.vercel.app` (или ваш кастомный домен)
- **Preview URLs**: Для каждого PR автоматически

---

## Автоматический Deployment

### При каждом push в `main`:
```bash
git add .
git commit -m "Update: описание изменений"
git push origin main
```

Vercel автоматически:
- Запустит новый build
- Задеплоит в production
- Уведомит в GitHub PR

### При создании Pull Request:
- Vercel создаст **Preview Deployment**
- Уникальный URL для тестирования
- Автоматические обновления при каждом коммите в PR

---

## Custom Domain (опционально)

### Добавить свой домен:

1. **Vercel Dashboard** → Ваш проект → **Settings** → **Domains**
2. Добавьте домен (например: `trashgo.com`)
3. Следуйте инструкциям по настройке DNS:

```
Type:   A Record
Name:   @
Value:  76.76.21.21

Type:   CNAME
Name:   www
Value:  cname.vercel-dns.com
```

4. Vercel автоматически создаст SSL сертификат

---

## Проверка деплоя

### После успешного деплоя проверьте:

- [ ] Landing page загружается (`/`)
- [ ] Все роуты работают (`/login`, `/register`, `/create-order`)
- [ ] Статические ассеты загружаются (изображения, стили)
- [ ] Нет ошибок в консоли браузера
- [ ] Mobile responsive работает

### Команды для локальной проверки перед деплоем:

```bash
# Установка зависимостей
npm install

# Локальный dev сервер
npm run dev

# Production build (как на Vercel)
npm run build

# Превью production build локально
npx vite preview
```

---

## Monitoring & Analytics

### Vercel Analytics (встроенный)

**Включить:**
1. Dashboard → Ваш проект → **Analytics**
2. Toggle **Enable Analytics**
3. Доступны метрики:
   - Page Views
   - Unique Visitors
   - Top Pages
   - Real User Metrics (RUM)

### Vercel Speed Insights

**Включить:**
1. Dashboard → **Speed Insights**
2. Метрики производительности:
   - Core Web Vitals (LCP, FID, CLS)
   - Real-time performance data
   - Slowest pages report

---

## Troubleshooting

### Build Failed

**Причины:**
- Missing dependencies → Проверьте `package.json`
- TypeScript errors → Запустите `npm run build` локально
- Vite config issues → Проверьте `vite.config.ts`

**Решение:**
```bash
# Локально проверить build
npm run build

# Просмотр логов на Vercel
Dashboard → Deployments → Failed build → View logs
```

### 404 на всех роутах кроме главной

**Причина:** SPA routing не настроен

**Решение:** Уже настроено в `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Медленная загрузка

**Оптимизация:**
1. Включить **Image Optimization** в Vercel
2. Code splitting в Vite (уже настроено)
3. Lazy loading для роутов
4. CDN caching (автоматически через Vercel)

---

## Rollback

### Откатить на предыдущую версию:

1. Dashboard → **Deployments**
2. Найдите рабочую версию
3. **⋯** → **Promote to Production**

---

## CI/CD Pipeline (опционально)

### GitHub Actions для тестов перед деплоем:

Создайте `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test # если есть тесты
```

Vercel задеплоит **только после** успешного прохождения тестов.

---

## Backend Integration (будущее)

### После создания Backend API:

1. Добавьте Environment Variables в Vercel:
```env
VITE_API_URL=https://trashgo-api.up.railway.app
```

2. Обновите API calls в коде:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

3. Настройте CORS на backend:
```typescript
app.use(cors({
  origin: ['https://trashgo.vercel.app', 'http://localhost:5173']
}));
```

---

## Полезные ссылки

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/ilnyr27/Trashgo
- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev

---

## Checklist для первого деплоя

- [ ] Проект запушен на GitHub
- [ ] Импортировали проект в Vercel
- [ ] Настроили Build Settings (Vite preset)
- [ ] Deploy успешно завершен
- [ ] Проверили production URL
- [ ] Протестировали основные страницы
- [ ] Настроили custom domain (опционально)
- [ ] Включили Analytics (опционально)

---

**Status**: ✅ Готов к деплою
**Last Updated**: 2026-03-20
