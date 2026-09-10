# AwardHub — Full-Stack Implementation Plan

Build the complete AwardHub award-voting web application: a Spring Boot 4.1 backend with MSSQL + a React (Vite) frontend, following the system brief, ER tables, and prescribed directory structure.

## User Review Required

> [!IMPORTANT]
> **Scope**: This is a large system (~8 feature modules, ~15 entities, 5 user roles). I will build it **incrementally in phases** and commit working code at each milestone. The frontend will use **mock API data** initially so it can be developed and demonstrated independently of the backend being fully wired to MSSQL.

> [!WARNING]
> **Database**: The brief specifies MSSQL Server. The backend config will include connection placeholders — you'll need a running MSSQL instance with credentials. I'll also provide an H2 dev profile as a zero-config fallback for local testing.

> [!IMPORTANT]
> **State management**: Per the brief's suggestion, I'll use **React Context API + useReducer** for auth state and **Zustand** for feature-level shared state (lightweight, minimal boilerplate, appropriate for this app's complexity).

## Open Questions

> [!IMPORTANT]
> 1. **MSSQL credentials**: Do you have an MSSQL Server instance ready? If not, I'll set up the backend with an **H2 in-memory** dev profile so everything runs out of the box, with MSSQL config ready for production.
> 2. **SMTP/Email**: The brief specifies Gmail SMTP for OTP. Do you have a Gmail app password, or should I stub out the email service for now?
> 3. **JWT secret**: I'll generate a placeholder secret for development. You should rotate it for production.

---

## Build Phases (Incremental)

### Phase 1 — Foundation & Auth (Current Phase)
The critical-path foundation: project scaffolding, design system, auth flows, and the shared layout shell.

### Phase 2 — Category & Nomination Management
Award categories CRUD (Organizer), nomination submission/review workflow, document upload.

### Phase 3 — Profile, Voting & Evaluation
Nominee profile management, voter registration/voting, judge evaluation with rubric scoring.

### Phase 4 — Results, Reports & Admin
Score calculation, winner determination, reporting/analytics, admin panel, audit logs, notifications.

---

## Phase 1 — Detailed Proposed Changes

### Backend — Project Configuration

#### [MODIFY] [application.properties](file:///c:/Users/acer/Desktop/github%20repos/awardhub-test2/src/main/resources/application.properties)
Convert to `application.yml` with structured config: server port, JPA/Hibernate settings, JWT config placeholders.

#### [NEW] [application-dev.yml](file:///c:/Users/acer/Desktop/github%20repos/awardhub-test2/src/main/resources/application-dev.yml)
H2 in-memory database config for local development without MSSQL.

#### [NEW] [application-prod.yml](file:///c:/Users/acer/Desktop/github%20repos/awardhub-test2/src/main/resources/application-prod.yml)
MSSQL connection template with placeholder credentials.

---

### Backend — Common Infrastructure

#### [NEW] `common/exception/` — Global exception handler + custom exceptions
- `GlobalExceptionHandler.java` — `@RestControllerAdvice` with handlers for validation, auth, not-found, and generic errors
- `ResourceNotFoundException.java`, `BadRequestException.java`, `DuplicateResourceException.java`

#### [NEW] `common/dto/` — Shared response wrappers
- `ApiResponse.java` — Generic `{success, message, data}` wrapper
- `PagedResponse.java` — Paginated results with metadata

#### [NEW] `common/audit/` — Audit logging
- `AuditLog.java` (entity) — `logID`, `adminID`, `timestamp`, `actionType`, `details`
- `AuditLogRepository.java`
- `AuditLogService.java`

---

### Backend — Security Module

#### [NEW] `security/jwt/`
- `JwtUtil.java` — Token generation (access + refresh), validation, claims extraction using `io.jsonwebtoken`
- `JwtAuthFilter.java` — `OncePerRequestFilter` that extracts and validates JWT from `Authorization` header

#### [NEW] `security/otp/`
- `OtpService.java` — Generate 6-digit OTP, store with expiry, verify
- `EmailService.java` — Send OTP via `JavaMailSender` (stubbed in dev profile)

#### [NEW] `security/dto/`
- `LoginRequest.java`, `RegisterRequest.java`, `AuthResponse.java`, `OtpVerifyRequest.java`

#### [NEW] `config/`
- `SecurityConfig.java` — Spring Security filter chain: stateless sessions, JWT filter, public/authenticated endpoints, CORS
- `CorsConfig.java` — Allow frontend origin (`localhost:5173`)

---

### Backend — User Module (ISA Hierarchy)

#### [NEW] `user/entity/`
- `User.java` — Superclass entity with `@Inheritance(SINGLE_TABLE)` or `JOINED` strategy: `userID`, `email`, `password`, `contactNumber`, `registrationDate`, `accountStatus`, `role` (enum)
- `Nominee.java`, `Voter.java`, `Judge.java`, `AwardOrganizer.java`, `SystemAdministrator.java` — Subclass entities with role-specific fields

#### [NEW] `user/repository/`
- `UserRepository.java` — `findByEmail`, `existsByEmail`
- Subtype repositories as needed

#### [NEW] `user/service/`
- `AuthService.java` — Register (with OTP flow), login (issue JWT), refresh token, password hashing

#### [NEW] `user/controller/`
- `AuthController.java` — `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/refresh`

---

### Backend — Dependency Addition

#### [MODIFY] [pom.xml](file:///c:/Users/acer/Desktop/github%20repos/awardhub-test2/pom.xml)
Add: `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (JWT), `h2` (dev database), and ensure Spring Boot starter versions are aligned.

---

### Frontend — Project Scaffolding

#### [NEW] `frontend/` — Initialize Vite + React project
- `npx -y create-vite@latest ./ -- --template react` inside `frontend/`
- Install dependencies: `react-router-dom`, `axios`, `zustand`, `react-icons`, `react-hot-toast`

---

### Frontend — Design System & CSS

#### [NEW] [index.css](file:///c:/Users/acer/Desktop/github%20repos/awardhub-test2/frontend/src/index.css)
Complete design system with CSS custom properties:

**Color palette** — Professional, minimal, award-ceremony inspired:
- Primary: Deep indigo (`#4338CA`) with lighter tints
- Accent: Warm gold/amber (`#D97706`) for award-themed highlights
- Neutrals: Cool slate grays for text and backgrounds
- Semantic: Soft green (success), warm red (error), blue (info)
- Dark background base with elegant subtle textures

**Typography**: Inter (Google Fonts) — clean, professional, highly legible

**Spacing, radius, shadow tokens** for consistent component styling

---

### Frontend — Shared Components

#### [NEW] `components/`
| Component | Purpose |
|---|---|
| `Sidebar.jsx` + `Sidebar.css` | Collapsible navigation sidebar with role-based menu items, active state, icons |
| `Topbar.jsx` + `Topbar.css` | Top header bar with breadcrumb, user avatar, notifications bell, logout |
| `Layout.jsx` + `Layout.css` | Authenticated shell: sidebar + topbar + main content area |
| `Button.jsx` + `Button.css` | Reusable button with variants (primary, secondary, ghost, danger), sizes, loading state |
| `Input.jsx` + `Input.css` | Form input with label, error state, icon support |
| `Modal.jsx` + `Modal.css` | Overlay modal with backdrop, close button, transitions |
| `Table.jsx` + `Table.css` | Data table with sorting, pagination, empty state |
| `Card.jsx` + `Card.css` | Content card with header, body, footer sections |
| `Badge.jsx` + `Badge.css` | Status badges (approved, pending, rejected, active) |
| `ProtectedRoute.jsx` | Route guard checking auth + role |
| `Loader.jsx` + `Loader.css` | Loading spinner with fade animation |
| `EmptyState.jsx` | Placeholder for empty data views |
| `StatCard.jsx` + `StatCard.css` | Dashboard metric card with icon, value, label, trend |

---

### Frontend — Auth Feature

#### [NEW] `features/auth/`
- `pages/LoginPage.jsx` — Email + password login form, JWT handling
- `pages/RegisterPage.jsx` — Multi-step registration: role selection → form fields → OTP verification
- `pages/OtpVerifyPage.jsx` — 6-digit OTP input with countdown timer
- `pages/ForgotPasswordPage.jsx` — Password reset request
- `api.js` — Auth API calls (`/api/auth/*`)
- `components/AuthLayout.jsx` — Split-screen auth layout (form + branding panel)

#### [NEW] `context/AuthContext.jsx`
- Auth state provider: `user`, `token`, `role`, `isAuthenticated`
- `login()`, `logout()`, `refreshToken()` actions
- Persist refresh token in httpOnly cookie (via API), access token in memory

---

### Frontend — Routing & App Shell

#### [NEW] `routes/AppRoutes.jsx`
Role-based route definitions:
- Public: `/login`, `/register`, `/verify-otp`
- Nominee: `/dashboard`, `/my-nominations`, `/my-profile`
- Voter: `/dashboard`, `/categories`, `/vote`
- Judge: `/dashboard`, `/evaluations`
- Organizer: `/dashboard`, `/categories`, `/nominations`, `/results`, `/reports`, `/feedback`
- Admin: `/dashboard`, `/users`, `/audit-log`, `/system`

#### [MODIFY] [App.jsx](file:///c:/Users/acer/Desktop/github%20repos/awardhub-test2/frontend/src/App.jsx)
Root app with `AuthProvider`, `BrowserRouter`, `AppRoutes`, `Toaster`

---

### Frontend — Dashboard Pages (per role)

#### [NEW] `features/*/pages/Dashboard.jsx`
Role-specific dashboards with:
- **Organizer**: Stats (total nominations, active categories, pending reviews, total voters), recent activity feed, quick-action cards
- **Nominee**: My nominations (status cards), profile completion %, action items
- **Voter**: Active categories to vote in, voting history, upcoming deadlines
- **Judge**: Pending evaluations, completed evaluations, assignment overview
- **Admin**: System health, user accounts summary, recent audit log entries

Each dashboard uses `StatCard`, `Table`, and `Card` components with mock data initially.

---

### Frontend — API Layer

#### [NEW] `api/axios.js`
- Axios instance with base URL from `VITE_API_BASE_URL`
- Request interceptor: attach `Authorization: Bearer <token>` header
- Response interceptor: on 401, attempt token refresh; on failure, redirect to login

---

## Verification Plan

### Phase 1 Checks
1. **Frontend runs**: `npm run dev` starts without errors on `localhost:5173`
2. **All routes render**: Login, Register, OTP, and all role-based dashboards render correctly
3. **Responsive**: Sidebar collapses on mobile, all layouts adapt from 320px to 1920px+
4. **Backend compiles**: `mvn compile` succeeds with all entities, security config, and controllers
5. **Auth API works**: Login/register endpoints respond correctly (tested with H2 dev profile)

### Manual Verification
- Visual review of the design system, component library, and all pages
- Test role-based routing by switching mock user roles
