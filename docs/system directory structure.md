--------------
BACKEND
--------------

├── src/main/java/com/awardhub/
│   ├── AwardhubApplication.java
│   │
│   ├── config/                    # SecurityConfig, CorsConfig, MailConfig, OpenApiConfig
│   │
│   ├── common/                    # shared across all features
│   │   ├── exception/              GlobalExceptionHandler, custom exceptions
│   │   ├── dto/                    ApiResponse wrapper, PagedResponse
│   │   └── audit/                  AuditLog entity + listener (used by every feature)
│   │
│   ├── security/                  # auth infrastructure — not owned by one person, built jointly
│   │   ├── jwt/                    JwtUtil, JwtAuthFilter
│   │   ├── otp/                    OTP generation/verification, email sending
│   │   └── dto/                    LoginRequest, RegisterRequest, AuthResponse
│   │
│   ├── user/                      # User + role subtypes (shared foundation — ISA hierarchy)
│   │   ├── entity/                 User, Nominee, Voter, Judge, AwardOrganizer, SystemAdministrator
│   │   ├── repository/
│   │   ├── service/
│   │   └── controller/
│   │
│   ├── category/                  # ← Ahamed: Award Category Management
│   ├── nomination/                # ← Tharuneth: Nomination Management (+ Document)
│   ├── profile/                   # ← Eragoda: Nominee Profile Management
│   ├── voting/                    # ← Fernando: Voting Management (Vote entity)
│   ├── evaluation/                # ← Rukshan: Evaluation, EvaluationCriterion, EvaluationScore, Result
│   └── reporting/                 # ← Hayas: Report, Notification, Feedback, analytics
│       (each feature/ folder above contains its own entity/, repository/, service/, controller/, dto/)
│
├── src/main/resources/
│   ├── application.yml             common config
│   ├── application-dev.yml         dev DB/mail credentials
│   ├── application-prod.yml
│   └── db/migration/               Flyway scripts: V1__init_schema.sql, V2__add_feedback.sql, ...
│
└── src/test/java/com/sliit/awardhub/   # mirrors main/ package-for-package


--------------
FRONTEND
--------------

frontend/
├── src/
│   ├── api/                       axios instance + interceptors (attach JWT, handle 401 refresh)
│   ├── components/                shared UI: Button, Table, Modal, ProtectedRoute, etc.
│   ├── context/                   AuthContext (current user, role, token state)
│   ├── routes/                    route definitions, role-gated routing
│   │
│   ├── features/                  mirrors backend feature split
│   │   ├── auth/                   login, register, OTP verify pages + api calls
│   │   ├── categories/             ← Ahamed
│   │   ├── nominations/            ← Tharuneth
│   │   ├── profile/                ← Eragoda
│   │   ├── voting/                 ← Fernando
│   │   ├── evaluation/             ← Rukshan
│   │   └── reporting/              ← Hayas
│   │       (each feature/ folder: components/, pages/, hooks/, api.js)
│   │
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── public/
└── .env                            VITE_API_BASE_URL, etc.
