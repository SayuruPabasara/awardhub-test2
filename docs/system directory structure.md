--------------
BACKEND
--------------

├── src/main/java/com/awardhub/awardhub/
│   ├── AwardhubApplication.java
│   │
│   ├── config/                    # SecurityConfig, CorsConfig
│   │
│   ├── common/                    # shared across all features
│   │   ├── exception/              GlobalExceptionHandler, custom exceptions
│   │   ├── dto/                    ApiResponse wrapper, PagedResponse
│   │   └── audit/                  AuditLog entity + listener (used by every feature)
│   │
│   ├── security/                  # auth infrastructure
│   │   ├── jwt/                    JwtUtil, JwtAuthFilter
│   │   ├── otp/                    OtpService (DB-persisted), EmailService
│   │   ├── entity/                 OtpCode entity (persisted OTP store)
│   │   ├── repository/             OtpCodeRepository
│   │   └── dto/                    LoginRequest, RegisterRequest, AuthResponse, OtpVerifyRequest
│   │
│   ├── user/                      # User + role subtypes (ISA hierarchy)
│   │   ├── entity/                 User, Nominee, Voter, Judge, AwardOrganizer, SystemAdministrator, UserRole, AccountStatus
│   │   ├── repository/
│   │   ├── service/
│   │   └── controller/
│   │
│   ├── category/                  # Award Category Management
│   ├── nomination/                # Nomination Management (+ Document)
│   ├── profile/                   # Nominee Profile Management (operates on user.Nominee entity)
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/             NomineeProfileRepository
│   │   └── dto/
│   ├── voting/                    # Voting Management (Vote entity)
│   ├── evaluation/                # Evaluation, EvaluationScore
│   ├── results/                   # FinalScore calculation, ranking, winner
│   └── reports/                   # Category statistics, AuditLog queries (aggregates from multiple modules)
│       (each feature/ folder above contains its own entity/, repository/, service/, controller/, dto/)
│
├── src/main/resources/
│   ├── application.yml             common config (JWT, OTP, mail, multipart)
│   ├── application-dev.yml         H2 in-memory DB, JPA auto-DDL, Flyway disabled
│   ├── application-prod.yml        SQL Server, Flyway enabled, env-var credentials
│   └── static/ templates/           (Spring Boot defaults, currently empty)
│
└── src/test/java/com/awardhub/awardhub/   # mirrors main/ package-for-package
    ├── AwardhubApplicationTests.java
    ├── evaluation/EvaluationIntegrationTest.java
    ├── results/ResultsIntegrationTest.java
    ├── user/UserManagementIntegrationTest.java
    └── voting/VotingIntegrationTest.java


--------------
FRONTEND
--------------

frontend/
├── src/
│   ├── api/                       axios instance + interceptors (attach JWT, handle 401 refresh)
│   ├── components/                shared UI: Button, Table, Modal, Badge, Card, Loader, EmptyState,
│   │                              StatCard, Input, Layout, Sidebar, Topbar, ProtectedRoute
│   ├── context/                   AuthContext (current user, role, token state)
│   ├── routes/                    AppRoutes.jsx — route definitions, role-gated routing
│   │
│   ├── features/                  mirrors backend feature split
│   │   ├── auth/                   login, register, OTP verify pages + api calls
│   │   ├── categories/             CRUD list, detail, form modal + api
│   │   ├── nominations/            list, create, detail, document upload + api
│   │   ├── profile/                nominee profile page + api
│   │   ├── voting/                 vote page, voting overview page + api
│   │   ├── evaluations/            judge evaluation page + api
│   │   ├── results/                results page (publish, rankings) + api
│   │   ├── reports/                reports & analytics page, audit log page + api
│   │   └── users/                  user management page (CRUD) + api
│   │       (each feature/ folder: pages/, [components/], api.js)
│   │
│   ├── App.jsx
│   └── main.jsx
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── .env                            VITE_API_BASE_URL
