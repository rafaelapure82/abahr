# ABA Talent Management 🚀

> Enterprise-grade Human Resource Management System built with **Node.js + Express + TypeScript + Prisma + PostgreSQL** on the backend and **Angular 15+** on the frontend.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Monorepo Structure](#-monorepo-structure)
- [Modules](#-modules)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Docker](#-docker)
- [API Reference](#-api-reference)
- [Design System](#-design-system)

---

## 🛠 Tech Stack

| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| **Backend**    | Node.js 20 · Express · TypeScript · Prisma ORM  |
| **Database**   | PostgreSQL (NeonDB for production)              |
| **Cache/Queue**| Redis                                           |
| **Frontend**   | Angular 15+ · Standalone Components · Signals  |
| **Styling**    | TailwindCSS · shadcn/ui analog                 |
| **Auth**       | JWT (Access + Refresh Tokens) · RBAC           |
| **Real-time**  | Socket.IO                                       |
| **Email**      | Nodemailer + MailHog (dev) + Resend (prod)     |
| **Storage**    | Local filesystem / AWS S3                       |
| **Container**  | Docker + docker-compose                         |
| **Proxy**      | Nginx                                           |

---

## 📁 Monorepo Structure

```
ABAHR/
├── backend/                    # Express API
│   ├── prisma/
│   │   ├── schema.prisma       # Full DB schema (15 modules)
│   │   └── seed.ts             # Initial data seed
│   ├── src/
│   │   ├── config/             # env, logger, prisma, redis
│   │   ├── common/
│   │   │   └── middlewares/    # auth, errorHandler, rateLimiter
│   │   └── modules/
│   │       ├── auth/
│   │       ├── employees/
│   │       ├── departments/
│   │       ├── attendance/
│   │       ├── payroll/
│   │       ├── recruitment/
│   │       ├── performance/
│   │       ├── benefits/
│   │       ├── onboarding/
│   │       ├── notifications/
│   │       ├── reports/
│   │       ├── webhooks/
│   │       └── dashboard/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Angular 15+ SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # auth, guards, interceptors, services
│   │   │   ├── shared/         # reusable components, pipes, directives
│   │   │   ├── features/       # one folder per HRM module
│   │   │   └── layout/         # shell, sidebar, topbar
│   │   ├── assets/
│   │   ├── environments/
│   │   └── styles/             # TailwindCSS + design tokens
│   ├── Dockerfile
│   └── tailwind.config.js
│
├── docker/
│   ├── nginx/
│   │   └── nginx.conf          # Reverse proxy + SSL
│   └── postgres/
│       └── init.sql            # Extension setup
│
├── scripts/
│   └── init.ps1                # One-step Windows init
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🧩 Modules

| Module                  | Description                                            |
|-------------------------|--------------------------------------------------------|
| 🔐 **Auth + RBAC**      | JWT auth, refresh tokens, 8 roles, MFA ready          |
| 👤 **Employees**        | Full profile, documents, work history, org chart       |
| 🏢 **Departments**      | Hierarchical departments, positions, org chart         |
| 🚀 **Onboarding**       | Task checklists, automated workflows                   |
| ⏰ **Attendance**       | Clock-in/out, remote, overtime tracking                |
| 🏖 **Leave/PTO**        | Request, approve, balance tracking, 7 leave types      |
| 💰 **Payroll**          | Gross/net calc, deductions, bonuses, PDF reports       |
| 📋 **Recruitment**      | Jobs, candidates, application pipeline                 |
| ⭐ **Performance**      | Reviews, 360 feedback, goals, ratings                  |
| 🎁 **Benefits**         | Benefit catalog, employee enrollment                   |
| 📊 **Dashboard**        | Executive KPIs, analytics, charts                      |
| 🔔 **Notifications**    | In-app (Socket.IO) + email                             |
| 📤 **Export**           | Excel (xlsx) + PDF reports                             |
| 🌐 **Employee Portal**  | Self-service for leave, documents, profile             |
| 🔗 **Webhooks**         | Event-based integrations with delivery tracking        |

---

## ⚡ Quick Start

### Prerequisites

- Node.js ≥ 20
- Docker & docker-compose
- PowerShell (Windows) or Bash (Linux/Mac)

### 1. Clone and initialize

```powershell
# Windows
.\scripts\init.ps1
```

```bash
# Linux/Mac
chmod +x scripts/init.sh && ./scripts/init.sh
```

### 2. Fill in secrets

Edit `.env` and at minimum set:
```env
JWT_SECRET=<random 32+ char string>
JWT_REFRESH_SECRET=<random 32+ char string>
```

### 3. Start development

```bash
# Terminal 1 – API
cd backend && npm run dev

# Terminal 2 – Angular
cd frontend && npm start
```

| Service        | URL                      |
|----------------|--------------------------|
| API            | http://localhost:3000     |
| Health Check   | http://localhost:3000/health |
| Angular App    | http://localhost:4200     |
| MailHog        | http://localhost:8025     |
| Prisma Studio  | http://localhost:5555     |

### Default Credentials

```
Email:    admin@abatalent.com
Password: Admin@123!
```

---

## 🔐 Environment Variables

See `.env.example` for a full reference. Critical variables:

| Variable              | Description                        |
|-----------------------|------------------------------------|
| `DATABASE_URL`        | PostgreSQL connection string       |
| `JWT_SECRET`          | Min 32-char JWT signing secret     |
| `JWT_REFRESH_SECRET`  | Min 32-char refresh token secret   |
| `REDIS_URL`           | Redis connection URL               |
| `SMTP_HOST`           | SMTP server (MailHog in dev)       |

---

## 🐳 Docker

```bash
# Development (postgres + redis only)
docker-compose up -d postgres redis

# Full stack (all services)
docker-compose up -d

# Production (with nginx)
docker-compose --profile production up -d

# Stop everything
docker-compose down

# Reset database
docker-compose down -v
```

---

## 🗄️ Database

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations (dev)
npm run prisma:migrate

# Deploy migrations (production)
npm run prisma:migrate:prod

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

---

## 🎨 Design System

The frontend uses the **TeamHub-inspired** design system:
- **Primary color**: `#22C55E` (green-500)
- **Background**: White / `#F9FAFB`
- **Typography**: Inter (Google Fonts)
- **Components**: Custom Angular components with TailwindCSS + shadcn analog

---

## 📡 API Structure

```
/api/v1/auth            POST /login, POST /register, POST /refresh
/api/v1/employees       CRUD + profile, documents
/api/v1/departments     CRUD + org chart
/api/v1/attendance      Clock in/out, reports
/api/v1/leaves          Request, approve, balance
/api/v1/payroll         Process, approve, PDF export
/api/v1/recruitment     Jobs, candidates, pipeline
/api/v1/performance     Reviews, goals, 360 feedback
/api/v1/benefits        Catalog, enrollment
/api/v1/onboarding      Tasks, progress tracking
/api/v1/notifications   In-app, mark read
/api/v1/reports         Excel/PDF exports
/api/v1/webhooks        CRUD + delivery logs
/api/v1/dashboard       KPIs, analytics data
```

---

## 📜 License

Private – ABA Talent Management © 2025
