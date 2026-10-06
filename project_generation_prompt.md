# AI CLI Prompt: Project Management System (Web + Android + API)

Paste everything below the line into your AI CLI (Claude Code, etc.), run from an empty folder.

---

You are a senior full-stack engineer. Build a complete **Project Management System** as a monorepo with ONE backend serving a web app and an Android-first mobile app. Work step by step, commit after each phase, and run/test what you build. Use only test data. Ask me nothing unless truly blocked; make sensible decisions and note them in the README.

## Stack (fixed)
- Monorepo (npm workspaces): `/backend`, `/web`, `/mobile`, `/shared`, `/docs`
- Backend: Node.js + Express + TypeScript, Prisma ORM, PostgreSQL
- Web: React + Vite + TypeScript, React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS
- Mobile: React Native with Expo (TypeScript), React Navigation, TanStack Query, `expo-secure-store` (Android Keystore / iOS Keychain), `@react-native-community/netinfo`
- Shared: Zod schemas and TS types/enums used by backend, web and mobile (`/shared`)
- Docker + docker-compose (postgres + backend + web) as a bonus

## Features

### 1. Auth
- Register (fullName, email, password), login, logout, `GET /api/auth/me`
- Email unique (case-insensitive). Passwords hashed with bcrypt (cost 12). Never return passwordHash.
- JWT access token (e.g. 1h expiry). Logout must actually invalidate tokens: add a `tokenVersion` column on User, embed it in the JWT, increment on logout, verify in auth middleware.
- One account works on web and mobile.
- Rate-limit `/api/auth/login` and `/api/auth/register` (express-rate-limit, e.g. 5 attempts / 15 min / IP), returning 429 with a clear message.

### 2. Projects
Fields: id, name, description, status (NOT_STARTED | IN_PROGRESS | COMPLETED), startDate, endDate, createdAt, ownerId (FK -> User, cascade delete).
CRUD, owner-only. List supports `?search=` (name), `?status=`, `?page=&limit=`, `?sortBy=&order=`. Validate endDate >= startDate.

### 3. Tasks
Fields: id, name, description, priority (LOW | MEDIUM | HIGH), status (PENDING | IN_PROGRESS | COMPLETED), dueDate, createdAt, projectId (FK -> Project, cascade delete).
CRUD + mark completed (via PUT status). `GET /api/tasks` supports `?projectId=`, `?search=`, `?status=`, `?priority=`, pagination, sorting. Authorization is through project ownership: a user can only touch tasks in their own projects. Return 404 (not 403) for other users' resources to avoid leaking existence.

### 4. Dashboard
`GET /api/dashboard` returns, for the authenticated user only: totalProjects, totalTasks, completedTasks, pendingTasks, projectsInProgress. Use aggregate queries.

### 5. Required endpoints (exact)
POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
GET/POST /api/projects, GET/PUT/DELETE /api/projects/:id
GET/POST /api/tasks, GET/PUT/DELETE /api/tasks/:id
GET /api/dashboard
Consistent JSON error shape: `{ "error": { "code", "message", "details?" } }` with correct status codes (400, 401, 404, 409, 422, 429, 500).

## Backend requirements
- Layered structure: routes -> controllers -> services -> prisma; middleware folder (auth, validate, errorHandler, rateLimiter, notFound)
- Zod validation on every request (body, params, query): required fields, email format, valid dates, non-empty trimmed strings, enum values, UUID ids
- helmet, CORS restricted to `WEB_ORIGIN` env var (allow no-origin requests for mobile), JSON body size limit
- Logging with pino + pino-http (never log passwords/tokens)
- Central error handler; no stack traces in production responses
- SQL-injection safe: Prisma only, no raw string-built queries
- Env validation at startup (Zod); `.env.example` with every variable documented
- Prisma migrations + seed script (2 test users, sample projects/tasks, fake data only)
- Health endpoint `GET /health`
- Unit tests (service/validation) and integration tests (supertest) covering auth, authorization isolation between two users, validation errors, rate limiting. Use Vitest or Jest.
- Bonus if time: audit log table, refresh tokens

## Web requirements
- Pages: Register, Login, Dashboard (stat cards), Projects list (search + status filter + pagination), Project detail (edit/delete project, task list with search + status + priority filters, create/edit/delete task, quick "mark completed" toggle)
- Protected routes, auth context, token in memory + localStorage (or httpOnly approach, documented), axios/fetch client with 401 interceptor -> redirect to login with "Session expired" message
- Responsive (mobile -> desktop), reusable components, form validation with inline errors, loading skeletons/spinners, error and empty states, toasts, confirm dialogs for delete
- API base URL from `VITE_API_URL`

## Mobile requirements (Expo, Android required)
- Screens: Login, Register, Dashboard, Projects list, Project detail (tasks under project), Task create/edit form, Task search/filter (status + priority)
- Navigation: auth stack + bottom tabs (Dashboard, Projects, Profile/Logout) + stack for details
- Token stored ONLY in `expo-secure-store`; never AsyncStorage
- Pull-to-refresh on all lists/dashboard; loading indicators; form validation using shared Zod schemas
- Expired/invalid token (401) -> clear secure storage, navigate to Login, show "Your session has expired. Please log in again."
- No network: detect with NetInfo, show a clear offline banner/message instead of crash or blank screen; handle request timeouts
- Create/edit/delete tasks, mark completed, change status and priority
- API URL from `EXPO_PUBLIC_API_URL` (document how to use LAN IP / deployed URL; Android emulator uses 10.0.2.2)
- `eas.json` configured with a `preview` profile that builds an APK
- Bonus if time: cache tasks for offline viewing, push notification for tasks due tomorrow

## Database
Normalized relational schema: User 1—N Project 1—N Task, with FKs, indexes on ownerId, projectId, status, and unique index on lower(email). Generate an ER diagram in Mermaid at `/docs/ER_DIAGRAM.md` and the Prisma schema.

## Documentation (deliverables)
- Root `README.md`: overview, architecture diagram, prerequisites, setup for backend, web, mobile; DB setup (local Postgres and Docker); env var table for each app; running tests; seed users; how to run the mobile app against the deployed backend; deployment guide (backend on Render/Railway, Postgres on Neon/Supabase, web on Vercel/Netlify, APK via `eas build -p android --profile preview`); security notes; design decisions
- `/docs/API.md` with every endpoint, request/response examples, error codes; also generate an OpenAPI/Swagger spec served at `/api/docs`
- `/docs/DEMO_SCRIPT.md`: 5-minute screen-recording script (log in with same account on web and mobile, create task on one, refresh on the other)
- GitHub Actions CI (lint, typecheck, test, build)

## Process
1. Scaffold monorepo, shared package, tooling (ESLint, Prettier, tsconfig)
2. Backend + DB + tests, verify with curl
3. Web app, verify it builds and runs against the backend
4. Mobile app, verify it type-checks and starts
5. Docker, CI, docs
6. Final pass: security checklist (hashing, authz isolation, validation, rate limit, CORS, no sensitive data in responses), then print a summary of how to run everything and what manual steps I must do (deploy, build APK, record video)
