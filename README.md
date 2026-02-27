# HashPay

A peer-to-peer payment platform with multi-currency support, real-time notifications, and PDF transaction reports. Built with a **NestJS** backend and a **Next.js** frontend, powered by **Supabase** for authentication and database.

---

## Tech Stack

| Layer         | Technology                                          |
| ------------- | --------------------------------------------------- |
| Frontend      | Next.js 16, React 19, Tailwind CSS 4, Zustand       |
| Backend       | NestJS 11, Prisma 7 (PostgreSQL), Passport (JWT)     |
| Auth          | Supabase Auth (ES256 JWKS)                           |
| Real-time     | Socket.IO with Redis adapter                         |
| Database      | PostgreSQL (via Supabase)                            |
| Reports       | PDFKit                                               |

---

## Project Structure

```
hashpay/
├── backend/          # NestJS API server
│   ├── prisma/       # Prisma schema & seed script
│   ├── src/
│   │   ├── accounts/       # User account management
│   │   ├── auth/           # JWT strategy & auth guards
│   │   ├── contacts/       # Contact list management
│   │   ├── notifications/  # Real-time notifications (WebSocket)
│   │   ├── prisma/         # Prisma service
│   │   ├── redis/          # Redis service
│   │   ├── reports/        # PDF report generation
│   │   ├── supabase/       # Supabase admin client
│   │   └── transactions/   # P2P transfers (atomic & idempotent)
│   └── ...
└── web/              # Next.js frontend
    ├── app/
    │   ├── lib/            # API client, Supabase helpers, Socket hook
    │   └── ...             # Pages & components
    └── ...
```

---

## Prerequisites

- **Node.js** ≥ 20
- **npm** (comes with Node.js)
- **PostgreSQL** database (or a [Supabase](https://supabase.com) project)
- **Redis** server (for Socket.IO adapter)

---

## Environment Variables

### Backend (`backend/.env`)

Create a `backend/.env` file with the following variables:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

REDIS_URL=redis://localhost:6379

PORT=3000
```

### Frontend (`web/.env`)

Create a `web/.env` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd hashpay
```

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Generate the Prisma client
npx prisma generate

# (Optional) Seed the database
npm run seed

# Start the development server
npm run start:dev
```

The backend API will be available at **http://localhost:3001** by default.

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to the frontend directory
cd web

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at **http://localhost:3000** by default.

---

## Available Scripts

### Backend (`backend/`)

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run start:dev`   | Start in watch mode (development)    |
| `npm run start`       | Start without watch mode             |
| `npm run start:debug` | Start with debugger attached         |
| `npm run build`       | Build for production                 |
| `npm run start:prod`  | Run the production build             |
| `npm run seed`        | Seed the database                    |
| `npm run lint`        | Lint & auto-fix source files         |
| `npm run test`        | Run unit tests                       |
| `npm run test:e2e`    | Run end-to-end tests                 |

### Frontend (`web/`)

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Start the dev server                 |
| `npm run build`  | Build for production                 |
| `npm run start`  | Serve the production build           |
| `npm run lint`   | Lint source files                    |

---

## Database

The project uses **Prisma** as the ORM. The schema is located at `backend/prisma/schema.prisma` and includes the following core models:

- **profiles** – User profiles linked to Supabase Auth
- **accounts** – Multi-currency financial accounts
- **transactions** – P2P transfers with idempotency keys
- **contacts** – User contact lists
- **currencies** – Supported currencies
- **notifications** – In-app notification records

### Useful Prisma Commands

```bash
# Generate the Prisma client after schema changes
npx prisma generate

# Introspect the database and update the schema
npx prisma db pull

# Open Prisma Studio (database GUI)
npx prisma studio
```

---