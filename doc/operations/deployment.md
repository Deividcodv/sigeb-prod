# Deployment — SIGEB

---

## Entornos

| Entorno | Propósito | URL |
|---|---|---|
| **Local** | Desarrollo individual | localhost |
| **Development** | Integración del equipo | dev.sigeb.gov.gt |
| **Staging** | QA y pruebas | staging.sigeb.gov.gt |
| **Production** | Producción | sigeb.gov.gt |

---

## Docker Compose (desarrollo)

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: sigeb-postgres
    environment:
      POSTGRES_DB: sigeb
      POSTGRES_USER: sigeb
      POSTGRES_PASSWORD: sigeb123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: sigeb-api
    environment:
      DATABASE_URL: postgresql://sigeb:sigeb123@postgres:5432/sigeb
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    volumes:
      - ./apps/api/src:/app/apps/api/src
      - storage_data:/app/storage

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: sigeb-web
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000/api
    ports:
      - "3001:3000"
    depends_on:
      - api

volumes:
  postgres_data:
  storage_data:
```

---

## GitHub Actions (CI/CD)

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [develop, master]
  pull_request:
    branches: [develop, master]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: sigeb_test
          POSTGRES_USER: sigeb
          POSTGRES_PASSWORD: sigeb123
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Run tests
        run: npm run test:cov
        env:
          DATABASE_URL: postgresql://sigeb:sigeb123@localhost:5432/sigeb_test
      
      - name: Build
        run: npm run build

  deploy-staging:
    needs: lint-and-test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: echo "Deploy to staging server"
        # Agregar comandos de deploy aquí

  deploy-production:
    needs: lint-and-test
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: echo "Deploy to production server"
        # Agregar comandos de deploy aquí
```

---

## Variables de entorno por entorno

### Development
```env
DATABASE_URL=postgresql://sigeb:sigeb123@localhost:5432/sigeb
JWT_SECRET=dev-secret-key
STORAGE_PATH=./storage
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

### Staging
```env
DATABASE_URL=postgresql://sigeb:${DB_PASSWORD}@staging-db:5432/sigeb
JWT_SECRET=${JWT_SECRET}
STORAGE_PATH=/data/storage
PORT=3000
CORS_ORIGIN=https://staging.sigeb.gov.gt
```

### Production
```env
DATABASE_URL=postgresql://sigeb:${DB_PASSWORD}@prod-db:5432/sigeb
JWT_SECRET=${JWT_SECRET}
STORAGE_PATH=/data/storage
PORT=3000
CORS_ORIGIN=https://sigeb.gov.gt
```

---

## Deploy manual

### Backend
```bash
# En el servidor
git pull origin master
npm ci --production
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart sigeb-api
```

### Frontend
```bash
# En el servidor
git pull origin master
npm ci --production
npm run build
pm2 restart sigeb-web
```

---

## Monitoreo

| Herramienta | Propósito |
|---|---|
| PM2 | Process manager para Node.js |
| Sentry | Error tracking |
| Prometheus + Grafana | Métricas (futuro) |

---

*Última actualización: 2026-08-26*
