# AwardHub — System Brief for Build Agent

---

## 1. Project Identity

**AwardHub** — a web-based voting system for award nominations. Replaces a fragmented process (forms, email, spreadsheets) with one centralized platform covering: nominee registration, nomination submission/review, document verification, public voting, judge evaluation, automated score calculation, winner determination, and reporting.

**Stack:**
- Backend: Java, Spring Boot (Spring Web, Spring Data JPA, Spring Security), Microsoft SQL Server
- Frontend: React (Vite). State management: not prescribed — let the agent choose and justify its pick (e.g., Context API for simple shared state, or a library like Redux Toolkit/Zustand if the app's state complexity warrants it).
- Auth: **Password-based login** for all roles (email + password via Spring Security). Email OTP is used separately, at two specific points — not as the ongoing login mechanism:
  1. **Registration** — verify the user actually owns the email address before the account is created/activated.
  2. **Voter duplicate-prevention** — used alongside NIC as an identity check when a Voter registers, to help ensure one real person maps to one Voter account.
  
  On successful login, the server issues a **JWT access token (short-lived, ~15 min) + refresh token**. Store the refresh token in an httpOnly cookie and keep the access token in memory on the frontend (not localStorage, to limit XSS exposure).
- Password storage: hash with **BCrypt** (Spring Security's default `PasswordEncoder`) — never store or log plaintext passwords.
- Email delivery (for OTP): **Spring Boot's built-in `JavaMailSender` via SMTP** (e.g., Gmail SMTP with an app password, or your university's SMTP relay if available) — no third-party API key/account needed, well-documented, and standard for a project at this scale. Swap for SendGrid/AWS SES later only if you hit Gmail's sending limits or need better deliverability in production.

## 2. User Roles (all subtypes of a single User account)

| Role | Core responsibilities |
|---|---|
| Nominee | Create/maintain profile, upload documents, submit/update/withdraw nominations, track status |
| Voter | Register, view approved nominees, cast/update/withdraw votes within rules |
| Judge | Evaluate assigned nominees against rubric criteria, submit scores/comments |
| Award Organizer | Define categories/criteria, review/approve/reject nominations, assign judges, monitor voting, publish results, generate reports, review feedback |
| System Administrator | Manage accounts/roles, security, audit logs, backups, system availability |

**Auth model:** every account is created with exactly one role at registration (disjoint, total specialization — no "roleless" account exists, and a User is never more than one role at once). Registration requires setting a password and verifying the email via OTP before the account is activated. Role-based access control gates every module below.

## 3. Data Model

Entities, keys, and relationships as finalized in the EER diagram:

- **User** (super) → **Nominee**, **Voter**, **Judge**, **AwardOrganizer**, **SystemAdministrator** (subtypes, disjoint/total)
- **AwardCategory** — categorizes Nominations, scopes Votes, defines EvaluationCriterion, ranks Results
- **Nomination** — submitted by Nominee, has Documents (weak entity, identifying key = nominationID + documentType), evaluated by Evaluation, yields Result (1:1)
- **Vote** (associative: voterID + nomineeID + categoryID + timestamp + status) — cast by Voter, received by Nominee, scoped by AwardCategory
- **Evaluation** (associative) — submitted by Judge against a Nomination; has many EvaluationScore rows
- **EvaluationCriterion** — defined per AwardCategory; rated via EvaluationScore (composite key: evaluationID + criterionID)
- **Result** — derived totalScore, calculated from two aggregations: Voting Process (Voter–Vote–Nominee) and Evaluation Process (Judge–Evaluation–Nomination)
- **Report**, **Notification**, **AuditLog**, **Feedback** — supporting entities

## 4. Feature Modules (build in this grouping, not as one flat backlog)

1. **Account & Auth** — registration (role selected at signup, email verified via OTP before activation), password-based login (email + BCrypt-hashed password), JWT issuance/refresh, RBAC
2. **Award Category Management** — CRUD, eligibility criteria, nomination/voting schedules, category status
3. **Nomination Management** — submit/update/withdraw, document upload with mandatory-field checks, status workflow (Draft → Under Review → Approved/Rejected), reviewer decision logging
4. **Nominee Profile Management** — profile CRUD, eligibility verification against category rules
5. **Voting** — voter registration/verification via NIC + email OTP (identity check at registration, not per-vote), cast/update/withdraw within active period, one-vote-per-nominee-per-category enforcement (**application-layer rule — not expressible as a DB constraint alone**, needs an explicit check before insert), vote timestamping
6. **Evaluation & Results** — judge assignment, rubric-based scoring, blind review, automatic weighted score calculation, ranking, tie-breaking, organizer approval gate before publishing
7. **Reports, Analytics & Feedback** — Nomination/Nominee/Voting/Evaluation/Winner/UserActivity/Feedback reports, filtering, export; feedback submission + organizer review
8. **Supporting services** — notifications, audit logging (all approvals, votes, evaluations, publications)

## 5. Key Business Rules Not Visible in the Schema Alone

- One vote per (voter, nominee, category) — enforce in service layer, not just a unique DB constraint if you want a friendly error rather than a raw constraint violation.
- Duplicate-vote prevention relies on **NIC number** (verified together with an email OTP at Voter registration) as the primary identity check per category — each voter has one account linked to one NIC.
- Votes/evaluations rejected outside their active period — check against AwardCategory's votingPeriod / evaluation deadline at write time, not just at UI level.
- Winner determination depends on the category's `evaluationMethod` (voting-only / judge-only / hybrid with configurable weightage) — this needs to be a strategy per category, not a single hardcoded formula.
- Results are draft until Organizer explicitly authorizes publication — don't auto-publish on calculation.
- No stored passwords in plaintext anywhere — all passwords BCrypt-hashed; Administrators manage accounts/roles but never see credentials.
- Every approval, vote, evaluation, and publication action writes an AuditLog entry.

## 6. Explicit Non-Goals (v1)

- No native mobile app
- No payment processing
- No OAuth/social sign-in (password-based login only; OTP is for email verification and voter identity checks, not everyday login)
- No offline mode

---
