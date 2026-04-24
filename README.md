# ABA Talent Management 🚀

> Enterprise-grade Human Resource Management System built with **Node.js + Express + TypeScript + Prisma + PostgreSQL** on the backend and **Next.js 15 + React 19** on the frontend.

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
| **Frontend**   | **Next.js 15 (App Router)** · React 19 · TypeScript |
| **Styling**    | TailwindCSS · Lucide React                      |
| **State/Data** | TanStack Query (React Query) · Zustand          |
| **Auth**       | JWT (Access + Refresh Tokens) · RBAC           |
| **Real-time**  | Socket.IO                                       |
| **Container**  | Docker + docker-compose                         |

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
│   │   └── modules/            # Domain logic (auth, employees, etc.)
│
├── frontend/                   # Next.js 15 App (React 19)
│   ├── src/
│   │   ├── app/                # App Router (Pages & Layouts)
│   │   ├── components/         # UI Components (RoleGuard, etc.)
│   │   ├── context/            # Global State (AuthContext)
│   │   └── styles/             # TailwindCSS + Glassmorphism tokens
│
├── frontend-angular-legacy/    # Original Angular codebase (Reference)
│
├── docker/                     # Nginx & Postgres init scripts
├── docker-compose.yml
└── README.md
```

---

## 🧩 Modules

| Module                  | Description                                            |
|-------------------------|--------------------------------------------------------|
| 🔐 **Auth + RBAC**      | JWT auth, refresh tokens, Role-Based Access Control    |
| 👤 **Employees**        | Full profile, documents, work history, org chart       |
| 🏢 **Departments**      | Hierarchical departments, positions, org chart         |
| 🚀 **Onboarding**       | Task checklists, automated workflows                   |
| ⏰ **Attendance**       | Clock-in/out, remote, overtime tracking                |
| 💰 **Payroll**          | Gross/net calc, deductions, bonuses, PDF reports       |
| 📋 **Recruitment**      | Jobs, candidates, application pipeline                 |
| 📊 **Dashboard**        | Executive KPIs, analytics, charts                      |

---

## ⚡ Quick Start

### Prerequisites

- Node.js ≥ 20
- Docker & docker-compose
- PostgreSQL & Redis (local or via Docker)

### 1. Initialize Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### 2. Initialize Frontend

```bash
cd frontend
npm install
npm run dev -- -p 4200
```

| Service        | URL                      |
|----------------|--------------------------|
| API            | http://localhost:3000     |
| Next.js App    | http://localhost:4200     |
| MailHog        | http://localhost:8025     |
| Prisma Studio  | http://localhost:5555     |

### Default Credentials

```
Email:    admin@abatalent.com
Password: Admin@123!
```

---

## 🎨 Design System

The frontend uses a **Premium Glassmorphism** design system:
- **Primary color**: `#00bfa5` (Mint Green)
- **Aesthetic**: Transparent layers, soft shadows, rounded borders.
- **Typography**: Inter (Modern Sans-serif)
- **Icons**: Lucide React

---

## 🐳 Docker

```bash
# Start all services (Postgres, Redis, Backend, Frontend)
docker-compose up -d --build
```

---

## 📜 License

Private – ABA Talent Management © 2026
