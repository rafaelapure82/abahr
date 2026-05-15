# 🚀 ABA Talent Management – Setup Guide

Este repositorio contiene el sistema **ABA HR**, una solución de gestión de talento humano de alto nivel construida con un stack moderno y escalable.

---

## ⚡ Inicio Rápido (A Tope)

Sigue estas instrucciones para poner todos los servicios en marcha en tiempo récord.

### 🐳 Opción A: Docker (Recomendado)
Levanta todo el ecosistema (DB, Redis, API, App) con un solo comando.

```bash
# Desde la raíz del proyecto
docker-compose up -d --build
```
*   **API:** `http://localhost:3000`
*   **App:** `http://localhost:4200`
*   **MailHog:** `http://localhost:8025`

---

### 💻 Opción B: Manual (Desarrollo Activo)

Si prefieres ejecutar los servicios por separado para desarrollo:

#### 1. Backend (API)
```bash
cd backend
npm install                     # Instalar dependencias
npm run prisma:generate         # Generar cliente de base de datos
npm run prisma:migrate          # Sincronizar esquema de DB
npm run prisma:seed             # (Opcional) Cargar datos de prueba
npm run dev                     # ¡A tope! Iniciar API
```

#### 2. Frontend (Next.js)
```bash
cd frontend
npm install                     # Instalar dependencias
npm run dev -- -p 4200          # ¡A tope! Iniciar App en puerto 4200
```

---

## 🔑 Credenciales de Acceso
Usa estos datos para entrar al sistema una vez iniciado:

| Campo | Valor |
| :--- | :--- |
| **Email** | `admin@abatalent.com` |
| **Password** | `Admin@123!` |

---

## 🛠️ Herramientas de Mantenimiento

*   **Prisma Studio**: `cd backend && npm run prisma:studio`
    *   *Visualiza y edita los datos de la base de datos en `http://localhost:5555`.*
*   **Logs del Sistema**: Los logs se encuentran en `backend/logs/`.
*   **Reset de DB**: `cd backend && npm run prisma:reset` (¡Cuidado! Borra todo).

---

## 📁 Estructura del Monorepo

```bash
ABAHR/
├── backend/      # API Rest (Node.js + Express + Prisma)
├── frontend/     # Interfaz Web (Next.js 15 + React 19)
├── docker/       # Configuraciones de contenedores
└── scripts/      # Utilidades de automatización
```

---

## 🎨 Design System
El sistema utiliza un estilo **Premium Glassmorphism**:
- **Colores**: Mint Green (`#00bfa5`) y Sleek Dark Mode.
- **Tipografía**: Inter.
- **Componentes**: TailwindCSS + Lucide React.

---

> [!TIP]
> Si tienes problemas de conectividad con la base de datos, asegúrate de que el archivo `.env` en `backend/` tenga la `DATABASE_URL` correcta.

---
**ABA Talent Management © 2026**
