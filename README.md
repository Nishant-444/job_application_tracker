# Job Application Tracker - Full-Stack Kanban Board

**Version:** 0.1.0
**Status:** Production
**Tech Stack:** TypeScript, Next.js, React, PostgreSQL, Prisma, Docker

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Better Auth](https://img.shields.io/badge/Better_Auth-000000?style=for-the-badge)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

---

## Project Overview

Job Application Tracker is a full-stack Kanban board web application for organizing and managing job applications through every stage of the hiring process. Users sign up, get an automatic board with preset pipeline columns, and can drag-and-drop job application cards between stages. Built with the Next.js 16 App Router, React 19 Server Components, and Prisma 7 ORM backed by PostgreSQL.

**Key Capabilities:**

- **Kanban Board:** Drag-and-drop interface for moving job cards between pipeline stages using dnd-kit
- **Custom Columns:** Create, delete, and reorder columns to fit any workflow
- **Job Application Cards:** Track company, position, location, salary, URL, tags, description, and notes
- **Authentication:** Email/password and Google OAuth via Better Auth
- **Automatic Onboarding:** New users receive a default board with five preset columns
- **Optimistic UI:** Instant feedback on card moves before server confirmation
- **Server Actions:** All mutations handled via Next.js server actions for type-safe, server-side logic
- **Docker Support:** Multi-stage Dockerfile for containerized production deployment

---

## System Architecture

```
Browser --> Next.js Middleware (proxy.ts) --> App Router --> React Server Components
                                                |
                                          Server Actions
                                                |
                                     Prisma ORM (pg adapter)
                                                |
                                     PostgreSQL (Neon / local)
```

**Request Flow:**

1. User navigates to the application in their browser
2. Next.js middleware intercepts the request and checks authentication state
3. Authenticated users are routed to the dashboard; unauthenticated users are redirected to sign-in
4. The dashboard page (React Server Component) fetches board data server-side via Prisma
5. The Kanban board renders client-side with dnd-kit for drag-and-drop interactions
6. User actions (create job, move card, delete column) invoke Next.js server actions
7. Server actions authenticate the session, perform Prisma queries, and revalidate the page cache
8. Better Auth handles all authentication flows via a catch-all API route at `/api/auth/[...all]`

**Key Architecture Decisions:**

- **React Server Components:** Board data fetched on the server to eliminate client-side loading states
- **Server Actions:** Type-safe mutations without building a separate REST/GraphQL API layer
- **Optimistic Updates:** Client state updated immediately via `useBoard` hook; rolled back on server error
- **Prisma pg Adapter:** Direct PostgreSQL connection via `pg` pool, compatible with both Neon serverless and standard PostgreSQL
- **Middleware Route Protection:** Authentication checks at the edge before page rendering begins

---

## Core Technology Stack

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.4-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Better Auth](https://img.shields.io/badge/Better_Auth-1.4-000000?style=flat-square)
![dnd--kit](https://img.shields.io/badge/dnd--kit-6.3-000000?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

| Layer           | Technology           | Version | Purpose                                            |
| --------------- | -------------------- | ------- | -------------------------------------------------- |
| Framework       | Next.js              | v16.1.6 | App Router, RSC, server actions, middleware        |
| UI Library      | React                | v19.2.3 | Component rendering, hooks, Suspense boundaries    |
| Language        | TypeScript           | v5      | Type safety, compile-time error detection          |
| Styling         | Tailwind CSS         | v4.1.18 | Utility-first CSS framework                        |
| UI Components   | shadcn/ui (New York) | -       | Pre-built accessible components (Radix primitives) |
| Icons           | Lucide React         | v0.563  | SVG icon library                                   |
| Drag and Drop   | dnd-kit              | v6.3    | Accessible drag-and-drop for Kanban interactions   |
| Database        | PostgreSQL           | -       | Relational data storage (Neon serverless or local) |
| ORM             | Prisma               | v7.4.0  | Type-safe queries, schema migrations, pg adapter   |
| Authentication  | Better Auth          | v1.4.18 | Email/password, Google OAuth, session management   |
| Notifications   | Sonner               | v2.0.7  | Toast notification system                          |
| Package Manager | pnpm                 | -       | Fast, disk-efficient dependency management         |
| Container       | Docker               | -       | Multi-stage production build                       |

---

## Database Schema

The database uses PostgreSQL with Prisma ORM. All models include `createdAt` and `updatedAt` timestamps. Cascade deletes ensure referential integrity.

### Authentication Tables (Managed by Better Auth)

**User**

```sql
id            UUID PRIMARY KEY DEFAULT uuid()
name          VARCHAR NOT NULL
email         VARCHAR UNIQUE NOT NULL
emailVerified BOOLEAN NOT NULL
image         VARCHAR (nullable)
createdAt     TIMESTAMP DEFAULT now()
updatedAt     TIMESTAMP
```

**Session**

```sql
id        UUID PRIMARY KEY DEFAULT uuid()
expiresAt TIMESTAMP NOT NULL
token     VARCHAR UNIQUE NOT NULL
ipAddress VARCHAR (nullable)
userAgent VARCHAR (nullable)
userId    UUID FK -> User.id (CASCADE DELETE)
createdAt TIMESTAMP
updatedAt TIMESTAMP
```

**Account**

```sql
id                    UUID PRIMARY KEY DEFAULT uuid()
accountId             VARCHAR NOT NULL
providerId            VARCHAR NOT NULL
userId                UUID FK -> User.id (CASCADE DELETE)
accessToken           VARCHAR (nullable)
refreshToken          VARCHAR (nullable)
idToken               VARCHAR (nullable)
accessTokenExpiresAt  TIMESTAMP (nullable)
refreshTokenExpiresAt TIMESTAMP (nullable)
scope                 VARCHAR (nullable)
password              VARCHAR (nullable)
createdAt             TIMESTAMP DEFAULT now()
updatedAt             TIMESTAMP
```

**Verification**

```sql
id         UUID PRIMARY KEY DEFAULT uuid()
identifier VARCHAR NOT NULL
value      VARCHAR NOT NULL
expiresAt  TIMESTAMP NOT NULL
createdAt  TIMESTAMP (nullable)
updatedAt  TIMESTAMP (nullable)
```

### Application Tables

**Board**

```sql
id        UUID PRIMARY KEY DEFAULT uuid()
name      VARCHAR NOT NULL
userId    UUID FK -> User.id (CASCADE DELETE)
createdAt TIMESTAMP DEFAULT now()
updatedAt TIMESTAMP
INDEX(userId)
```

**Column**

```sql
id        UUID PRIMARY KEY DEFAULT uuid()
name      VARCHAR NOT NULL
order     FLOAT NOT NULL
boardId   UUID FK -> Board.id (CASCADE DELETE)
createdAt TIMESTAMP DEFAULT now()
updatedAt TIMESTAMP
INDEX(boardId)
```

**JobApplication**

```sql
id          UUID PRIMARY KEY DEFAULT uuid()
company     VARCHAR NOT NULL
position    VARCHAR NOT NULL
location    VARCHAR (nullable)
salary      VARCHAR (nullable)
jobUrl      VARCHAR (nullable)
tags        TEXT[] (array of strings)
description TEXT (nullable)
notes       TEXT (nullable)
status      VARCHAR DEFAULT 'applied'
order       FLOAT NOT NULL
appliedDate TIMESTAMP (nullable)
columnId    UUID FK -> Column.id (CASCADE DELETE)
boardId     UUID FK -> Board.id (CASCADE DELETE)
userId      UUID FK -> User.id (CASCADE DELETE)
createdAt   TIMESTAMP DEFAULT now()
updatedAt   TIMESTAMP
INDEX(columnId), INDEX(boardId), INDEX(userId)
```

**Relationships:**

- User -> Board (1:N, cascade delete)
- User -> JobApplication (1:N, cascade delete)
- Board -> Column (1:N, cascade delete, ordered by `order` float)
- Board -> JobApplication (1:N, cascade delete)
- Column -> JobApplication (1:N, cascade delete, ordered by `order` float)

---

## Authentication

Authentication is handled by [Better Auth](https://www.better-auth.com/) with the Prisma adapter.

### Authentication Flow

```
Registration --> Hash Password --> Store User --> Database Hook: initializeUserBoard() --> Generate Session
Login --> Verify Password --> Generate Session --> Set Cookie (cached 1 hour)
Protected Route --> Middleware (proxy.ts) --> Check Session --> Allow or Redirect
```

### Supported Methods

- **Email and Password:** Standard registration and login
- **Google OAuth:** Social login (requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`)

### Session Strategy

- **Cookie-Based Sessions:** Session token stored in browser cookie
- **Cookie Cache:** Session data cached for 1 hour to reduce database lookups
- **Server-Side Verification:** `getSession()` called in server components and server actions to authenticate requests

### Auth API

The auth API is mounted as a Next.js catch-all route at `/api/auth/[...all]`. Better Auth handles all endpoints internally (registration, login, logout, session refresh, OAuth callbacks).

### User Onboarding Hook

When a new user is created, a `databaseHooks.user.create.after` hook automatically calls `initializeUserBoard()`, which creates a default board named "Job Hunt" with five preset columns.

---

## Default Board Setup

Every new user is automatically provisioned with a board named "Job Hunt" containing five columns:

| Order | Column Name  | Purpose                           |
| ----- | ------------ | --------------------------------- |
| 0     | Wish List    | Jobs of interest, not yet applied |
| 1     | Applied      | Applications submitted            |
| 2     | Interviewing | Active interview processes        |
| 3     | Offer        | Received offers                   |
| 4     | Rejected     | Applications that did not proceed |

Users can create additional custom columns or delete existing ones from the dashboard.

---

## Server Actions

All data mutations are implemented as Next.js server actions with session authentication.

### Job Application Actions

```
createJobApplication(data)              - Create a new job card in a column
updateJobApplication(jobId, data)       - Update job card fields
deleteJobApplication(jobId)             - Remove a job card
moveJobApplication(jobId, columnId, order) - Move card to a new column/position
```

### Column Actions

```
createColumn(boardId, name)             - Add a new column to the board
deleteColumn(columnId)                  - Remove a column and all its job cards
```

**Authorization:** Every server action verifies the authenticated user owns the target board/column/job before performing the operation. Unauthorized requests return `{ error: 'Unauthorized' }`.

**Cache Invalidation:** After every mutation, `revalidatePath('/dashboard')` is called to refresh the server-rendered page data.

---

## Middleware

The application uses Next.js middleware (defined in `proxy.ts`) for route protection:

```
Request --> proxy.ts middleware
              |
              |--> /sign-in, /sign-up (authenticated user) --> Redirect to /dashboard
              |--> /dashboard (unauthenticated user)         --> Redirect to /sign-in
              |--> All other routes                           --> Pass through
```

The middleware uses `auth.api.getSession()` with the raw request headers (avoids `next/headers` which is incompatible with edge/proxy runtimes).

---

## Deployment Architecture

### Docker (Production)

The project includes a multi-stage Dockerfile optimized for production:

**Stage 1 -- deps:** Installs all dependencies using pnpm with a frozen lockfile on Node.js 22 Alpine.

**Stage 2 -- builder:** Copies dependencies, generates the Prisma client, and builds the Next.js application in standalone output mode.

**Stage 3 -- runner:** Minimal production image running as a non-root user (`nextjs:nodejs`). Copies only the standalone build output and static assets.

**Docker Configuration:**

```yaml
Base Image: node:22-alpine
Output Mode: Next.js standalone
User: nextjs (UID 1001, non-root)
Port: 3000
Host: 0.0.0.0
Dependencies: libc6-compat, openssl (required by Prisma)
```

### Build the Docker Image

```bash
docker build \
  --build-arg DATABASE_URL="<your-database-url>" \
  --build-arg NEXT_PUBLIC_BETTER_AUTH_URL="<your-app-url>" \
  --build-arg BETTER_AUTH_SECRET="<your-secret>" \
  --build-arg GOOGLE_CLIENT_ID="<your-google-client-id>" \
  --build-arg GOOGLE_CLIENT_SECRET="<your-google-client-secret>" \
  -t job-application-tracker .
```

### Run the Container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="<your-database-url>" \
  -e BETTER_AUTH_SECRET="<your-secret>" \
  -e NEXT_PUBLIC_BETTER_AUTH_URL="<your-app-url>" \
  -e GOOGLE_CLIENT_ID="<your-google-client-id>" \
  -e GOOGLE_CLIENT_SECRET="<your-google-client-secret>" \
  job-application-tracker
```

The container exposes port 3000 and listens on `0.0.0.0`.

---

## Getting Started

### Prerequisites

```
Node.js v22+
pnpm (enable via: corepack enable pnpm)
PostgreSQL (local instance or hosted, e.g., Neon)
```

### Local Development Setup

```bash
# Clone repository
git clone <repository-url>
cd job_application_tracker

# Install dependencies
pnpm install

# Configure environment
# Create .env file in the project root (see Environment Variables below)

# Generate Prisma client and push schema to database
pnpm dlx prisma generate
pnpm dlx prisma db push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require"

# Better Auth
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="<a-random-secret-string>"

# Google OAuth (optional, for social login)
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"

# Seed script (optional)
SEED_USER_ID="<user-uuid-to-seed-jobs-for>"
```

### Database Setup (Alternative)

If you prefer migration-based workflows instead of `db push`:

```bash
pnpm dlx prisma migrate dev --name init
```

### Seeding the Database

A seed script populates a user's board with sample job applications across all default columns:

```bash
pnpm seed:jobs
```

Requires `SEED_USER_ID` to be set to an existing user's UUID. Creates sample entries for companies like Stripe, Nomura, Wise, and others.

### Available Scripts

| Command          | Description                                    |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | Start the development server                   |
| `pnpm build`     | Build the application for production           |
| `pnpm start`     | Start the production server                    |
| `pnpm lint`      | Run ESLint                                     |
| `pnpm seed:jobs` | Seed the database with sample job applications |

---

## Project Structure

```
job_application_tracker/
├── app/
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with navbar and toaster
│   ├── page.tsx                 # Landing / hero page
│   ├── api/auth/[...all]/       # Better Auth API catch-all route
│   ├── dashboard/page.tsx       # Authenticated dashboard with Kanban board
│   ├── sign-in/page.tsx         # Sign-in page
│   └── sign-up/page.tsx         # Sign-up page
│
├── components/
│   ├── create-column.tsx        # Dialog for creating new columns
│   ├── create-job.tsx           # Dialog for creating new job applications
│   ├── image-tabs.tsx           # Hero section image tabs
│   ├── job-application-card.tsx # Individual job card component
│   ├── kanban-board.tsx         # Main Kanban board with drag-and-drop
│   ├── navbar.tsx               # Navigation bar with auth state
│   ├── sign-out-btn.tsx         # Sign-out button component
│   └── ui/                      # shadcn/ui primitives (button, card, dialog, etc.)
│
├── lib/
│   ├── db.ts                    # Prisma client singleton with pg pool adapter
│   ├── init-user-board.ts       # Creates default board and columns for new users
│   ├── utils.ts                 # Utility functions (cn helper)
│   ├── actions/
│   │   ├── columns.ts           # Server actions for column CRUD
│   │   └── job-applications.ts  # Server actions for job application CRUD
│   ├── auth/
│   │   ├── auth.ts              # Better Auth server configuration
│   │   └── auth-client.ts       # Better Auth client configuration
│   └── hooks/
│       └── useBoards.ts         # Client-side hook for board state and optimistic updates
│
├── prisma/
│   └── schema.prisma            # Database schema definition
│
├── scripts/
│   └── seed.ts                  # Database seeder with sample job applications
│
├── types/
│   └── index.ts                 # Shared TypeScript types (CompleteBoard, CompleteColumn, etc.)
│
├── proxy.ts                     # Next.js middleware for auth route protection
├── prisma.config.ts             # Prisma configuration
├── Dockerfile                   # Multi-stage production Docker build
├── components.json              # shadcn/ui configuration
├── next.config.ts               # Next.js configuration (standalone output)
├── package.json
└── tsconfig.json
```

---

## Known Limitations & Roadmap

### Current Constraints

1. **Single Board Per User:** Each user gets one board ("Job Hunt"); multi-board support not implemented
2. **No Column Reordering UI:** Columns are ordered by a float value but there is no drag-to-reorder for columns
3. **No Search or Filtering:** Job cards cannot be searched or filtered by tags, company, or status
4. **No Data Export:** No CSV/JSON export of job application data
5. **No Email Verification:** Users can register without email confirmation
6. **Basic Error Handling:** Server action errors are returned as simple string messages

### Planned Enhancements

- Multi-board support (multiple pipelines per user)
- Column drag-and-drop reordering
- Search and filter across job applications
- Data export (CSV, JSON)
- Dashboard analytics (application counts by stage, timeline charts)
- Email verification on registration
- Dark mode support via next-themes (dependency already installed)
- Redis caching layer for session data

---

## Technical Decisions & Trade-offs

### Why Next.js App Router over Pages Router?

- **React Server Components:** Fetch board data on the server with zero client-side loading waterfalls
- **Server Actions:** Eliminate the need for a separate API layer; mutations are co-located with the UI
- **Streaming and Suspense:** Navbar wrapped in Suspense with a skeleton fallback for instant page loads

### Why Prisma with the pg Adapter?

- **Type Safety:** Generated types from the schema ensure queries are correct at compile time
- **Neon Compatibility:** The `@prisma/adapter-pg` and `@neondatabase/serverless` packages allow the same codebase to connect to Neon serverless or a standard PostgreSQL instance
- **Migration Management:** Schema changes tracked via Prisma migrations

### Why Better Auth over NextAuth?

- **Prisma-Native Adapter:** First-class integration with Prisma ORM
- **Database Hooks:** `databaseHooks.user.create.after` enables automatic board initialization on sign-up
- **Cookie Caching:** Built-in session cookie cache reduces database lookups

### Why dnd-kit over React DnD / React Beautiful DnD?

- **Active Maintenance:** dnd-kit is actively maintained and React 19 compatible
- **Sortable Plugin:** Built-in vertical list sorting for within-column card ordering
- **Accessibility:** Keyboard and screen reader support out of the box

### Why Float Ordering Instead of Integer Ordering?

- **Insertions Without Reindexing:** A card inserted between order 1.0 and 2.0 gets order 1.5, avoiding the need to update every other card's order in the column
- **Trade-off:** Over many insertions, float precision can degrade; periodic rebalancing would be needed at scale

### Why Standalone Output Mode?

- **Minimal Docker Image:** `output: 'standalone'` produces a self-contained `server.js` with only the required `node_modules`, significantly reducing container size
- **No Node Modules in Production:** The runner stage only copies the standalone output, not the full `node_modules` directory

---

## Contributing

Contributions welcome. Follow standard Git workflow:

```bash
git checkout -b feature/feature-name
# Make changes
git commit -m "Add: feature description"
git push origin feature/feature-name
# Open pull request
```

**Code Standards:**

- TypeScript strict mode enabled
- ESLint configured via `eslint.config.mjs`
- Prisma schema migrations required for database changes
- shadcn/ui components added via `pnpm dlx shadcn@latest add <component>`
- pnpm as the package manager (do not commit `package-lock.json` or `yarn.lock`)

---

## License

This project is private and not published under an open-source license.
