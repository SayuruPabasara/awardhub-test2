# AwardHub Phase 1 — Task Tracker

## Backend

### Configuration
- [ ] Update `pom.xml` with JWT, H2 dependencies
- [ ] Convert `application.properties` → `application.yml`
- [ ] Create `application-dev.yml` (H2)
- [ ] Create `application-prod.yml` (MSSQL)

### Common Infrastructure
- [ ] `common/exception/` — GlobalExceptionHandler + custom exceptions
- [ ] `common/dto/` — ApiResponse, PagedResponse
- [ ] `common/audit/` — AuditLog entity, repository, service

### Security Module
- [ ] `config/SecurityConfig.java` + `CorsConfig.java`
- [ ] `security/jwt/` — JwtUtil, JwtAuthFilter
- [ ] `security/otp/` — OtpService, EmailService
- [ ] `security/dto/` — LoginRequest, RegisterRequest, AuthResponse, OtpVerifyRequest

### User Module
- [ ] `user/entity/` — User + 5 subclass entities
- [ ] `user/repository/` — UserRepository + subtype repos
- [ ] `user/service/` — AuthService
- [ ] `user/controller/` — AuthController

## Frontend

### Scaffolding
- [ ] Initialize Vite + React project
- [ ] Install dependencies
- [ ] Create `.env` file

### Design System
- [ ] `index.css` — Complete design system with tokens

### Shared Components
- [ ] Layout shell (Sidebar, Topbar, Layout)
- [ ] Form components (Button, Input)
- [ ] Data components (Table, Card, StatCard, Badge)
- [ ] Overlay components (Modal, Loader, EmptyState)
- [ ] ProtectedRoute

### Auth Feature
- [ ] AuthContext provider
- [ ] AuthLayout (split-screen)
- [ ] LoginPage
- [ ] RegisterPage
- [ ] OtpVerifyPage
- [ ] Auth API layer

### Routing & App Shell
- [ ] AppRoutes with role-based guards
- [ ] App.jsx integration

### Dashboard Pages
- [ ] OrganizerDashboard
- [ ] NomineeDashboard
- [ ] VoterDashboard
- [ ] JudgeDashboard
- [ ] AdminDashboard

### API Layer
- [ ] Axios instance with interceptors
