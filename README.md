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

## Testing & QA

### Test Credentials

The seed script (`backend/prisma/seed.ts`) creates six test users that share the same password. To test the peer-to-peer transfer flow, use any two of them — **David** and **Eve** work well because they share several common currencies:

| Role   | Email                | Password    | Notes                                      |
| ------ | -------------------- | ----------- | ------------------------------------------ |
| User A | `david@hashpay.test` | `Test1234!` | Has USD, EUR, GBP, AED, INR accounts       |
| User B | `eve@hashpay.test`   | `Test1234!` | Has USD, EUR, GBP, INR, BRL accounts       |

> [!TIP]
> All six seed users (`alice`, `bob`, `charlie`, `david`, `eve`, `frank`) use the password **`Test1234!`**. You can log in as any of them to explore the app from different perspectives.

### Testing the Send (P2P Transfer) — Real-Time Flow

> [!IMPORTANT]
> The **Send Money** feature was implemented to demonstrate **transaction atomicity** and **real-time state management**. To properly verify this, you need **two browser windows open at the same time** so you can watch updates arrive instantly on the receiver's screen.

#### Setup — Two Simultaneous Sessions

1. **Browser 1 (normal window)** — open `http://localhost:3000` and sign in as **David** (`david@hashpay.test` / `Test1234!`).
2. **Browser 2 (incognito / private window)** — open `http://localhost:3000` in an incognito or private window and sign in as **Eve** (`eve@hashpay.test` / `Test1234!`).
3. **Arrange side-by-side** — place both browser windows next to each other so you can observe both dashboards at the same time.

#### Perform the Transfer (Browser 1 — David)

4. **Open Send Money** — click the **"Send"** button in the sidebar (or header on mobile) to open the Send Money modal.
5. **Select a contact** — search for or click **Eve Davis** in the contact list (Step 1 of the modal).
6. **Choose currency & enter amount** — the modal advances to Step 2. Pick a shared currency (e.g. **USD**) from the dropdown and enter an amount (the modal shows your available balance).
7. **Submit the transfer** — click **Continue**. The app sends a `POST /transactions/transfer` request with `fromAccountId`, `toAccountId`, `amount`, `currencyId`, and an `idempotencyKey`.
8. **Confirm success** — a green checkmark screen appears with *"Transfer Successful!"*. Click **Done** to close.

#### Verify Real-Time Updates (Browser 2 — Eve)

9. **Check Eve's dashboard immediately** — without refreshing Browser 2, observe that Eve's account balance has updated and a new notification has appeared in real time via the WebSocket connection.
10. **Verify transaction history** — open Eve's transaction list to confirm the incoming transfer from David appears with the correct amount, currency, and status.

