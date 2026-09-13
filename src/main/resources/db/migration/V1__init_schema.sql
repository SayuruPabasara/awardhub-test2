-- =====================================================================
-- V1__init_schema.sql
-- Generated from the JPA @Entity classes in com.awardhub.awardhub.*
-- Target: Microsoft SQL Server (matches application-prod.yml)
--
-- This reproduces, as literal DDL, exactly what Hibernate's ddl-auto
-- would create from the current entity annotations, so it must be kept
-- in sync by hand if the entities change (Flyway does not do this for
-- you). Reserved words (e.g. "rank", "timestamp") are bracket-quoted.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. USER hierarchy (JOINED inheritance, discriminator column "role")
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    email               NVARCHAR(255)  NOT NULL,
    password            NVARCHAR(255)  NOT NULL,
    contact_number      NVARCHAR(255)  NULL,
    registration_date   DATETIME2      NOT NULL,
    account_status      NVARCHAR(30)   NOT NULL,
    role                NVARCHAR(31)   NOT NULL,
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- Nominee subtype
CREATE TABLE nominees (
    user_id             BIGINT PRIMARY KEY,
    nic_passport        NVARCHAR(255)  NULL,
    date_of_birth       NVARCHAR(255)  NULL,
    gender              NVARCHAR(255)  NULL,
    street              NVARCHAR(255)  NULL,
    city                NVARCHAR(255)  NULL,
    state               NVARCHAR(255)  NULL,
    zip                 NVARCHAR(255)  NULL,
    organization        NVARCHAR(255)  NULL,
    job_title           NVARCHAR(255)  NULL,
    biography           NVARCHAR(MAX)  NULL,
    education           NVARCHAR(MAX)  NULL,
    achievements        NVARCHAR(MAX)  NULL,
    nominee_references  NVARCHAR(MAX)  NULL,
    CONSTRAINT uq_nominees_nic_passport UNIQUE (nic_passport),
    CONSTRAINT fk_nominees_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Voter subtype
CREATE TABLE voters (
    user_id             BIGINT PRIMARY KEY,
    nic                 NVARCHAR(255)  NULL,
    activation_status   BIT            NOT NULL DEFAULT 0,
    CONSTRAINT uq_voters_nic UNIQUE (nic),
    CONSTRAINT fk_voters_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Judge subtype
CREATE TABLE judges (
    user_id             BIGINT PRIMARY KEY,
    area_of_expertise   NVARCHAR(255)  NULL,
    CONSTRAINT fk_judges_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- AwardOrganizer subtype
CREATE TABLE award_organizers (
    user_id             BIGINT PRIMARY KEY,
    position            NVARCHAR(255)  NULL,
    CONSTRAINT fk_award_organizers_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- SystemAdministrator subtype
CREATE TABLE system_administrators (
    user_id             BIGINT PRIMARY KEY,
    access_level        NVARCHAR(255)  NULL,
    CONSTRAINT fk_system_administrators_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ---------------------------------------------------------------------
-- 2. OTP codes (registration / voter verification, standalone)
-- ---------------------------------------------------------------------
CREATE TABLE otp_codes (
    otp_id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    email               NVARCHAR(255)  NOT NULL,
    otp_code            NVARCHAR(10)   NOT NULL,
    expiry_time         DATETIME2      NOT NULL,
    verified            BIT            NOT NULL DEFAULT 0,
    created_at          DATETIME2      NOT NULL,
    CONSTRAINT uq_otp_codes_email UNIQUE (email)
);

-- ---------------------------------------------------------------------
-- 3. Award categories
-- ---------------------------------------------------------------------
CREATE TABLE award_categories (
    category_id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    category_name       NVARCHAR(150)  NOT NULL,
    description         NVARCHAR(MAX)  NULL,
    eligibility_criteria NVARCHAR(MAX) NULL,
    nomination_deadline DATETIME2      NULL,
    voting_start_date   DATETIME2      NULL,
    voting_end_date     DATETIME2      NULL,
    evaluation_method   NVARCHAR(30)   NOT NULL DEFAULT 'HYBRID',
    voting_weightage    FLOAT          NULL DEFAULT 50.0,
    judging_weightage   FLOAT          NULL DEFAULT 50.0,
    max_votes_per_voter INT            NULL DEFAULT 1,
    status              NVARCHAR(30)   NOT NULL DEFAULT 'DRAFT',
    created_at          DATETIME2      NOT NULL,
    updated_at          DATETIME2      NULL,
    CONSTRAINT uq_award_categories_name UNIQUE (category_name)
);

-- @ElementCollection on AwardCategory.requiredDocumentTypes
CREATE TABLE category_required_documents (
    category_id         BIGINT         NOT NULL,
    document_type       NVARCHAR(255)  NULL,
    CONSTRAINT fk_category_required_documents_category
        FOREIGN KEY (category_id) REFERENCES award_categories(category_id)
);

-- ---------------------------------------------------------------------
-- 4. Nominations + documents
-- ---------------------------------------------------------------------
CREATE TABLE nominations (
    nomination_id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    nominee_id              BIGINT         NOT NULL,
    category_id             BIGINT         NOT NULL,
    title                   NVARCHAR(200)  NOT NULL,
    achievement_description NVARCHAR(MAX)  NOT NULL,
    evidence_details        NVARCHAR(MAX)  NULL,
    declaration             BIT            NOT NULL DEFAULT 0,
    submission_date         DATETIME2      NULL,
    status                  NVARCHAR(30)   NOT NULL DEFAULT 'DRAFT',
    review_date             DATETIME2      NULL,
    rejection_reason        NVARCHAR(MAX)  NULL,
    reviewed_by             BIGINT         NULL,
    created_at              DATETIME2      NOT NULL,
    updated_at              DATETIME2      NULL,
    CONSTRAINT fk_nominations_nominee  FOREIGN KEY (nominee_id)  REFERENCES nominees(user_id),
    CONSTRAINT fk_nominations_category FOREIGN KEY (category_id) REFERENCES award_categories(category_id),
    CONSTRAINT fk_nominations_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

CREATE TABLE nomination_documents (
    document_id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    nomination_id        BIGINT         NOT NULL,
    document_type        NVARCHAR(60)   NOT NULL,
    file_name            NVARCHAR(255)  NOT NULL,
    file_format          NVARCHAR(30)   NULL,
    file_size            BIGINT         NULL,
    file_path            NVARCHAR(255)  NOT NULL,
    upload_date          DATETIME2      NOT NULL,
    verification_status  NVARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    CONSTRAINT uq_nomination_documents_nomination_type UNIQUE (nomination_id, document_type),
    CONSTRAINT fk_nomination_documents_nomination
        FOREIGN KEY (nomination_id) REFERENCES nominations(nomination_id)
);

-- ---------------------------------------------------------------------
-- 5. Evaluations (judge scoring)
-- ---------------------------------------------------------------------
CREATE TABLE evaluations (
    evaluation_id       BIGINT IDENTITY(1,1) PRIMARY KEY,
    nomination_id       BIGINT         NOT NULL,
    judge_id            BIGINT         NOT NULL,
    category_id         BIGINT         NOT NULL,
    submission_date     DATETIME2      NOT NULL,
    total_score         FLOAT          NULL,
    status              NVARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    criterion_scores    NVARCHAR(MAX)  NULL,
    comments            NVARCHAR(2000) NULL,
    CONSTRAINT fk_evaluations_nomination FOREIGN KEY (nomination_id) REFERENCES nominations(nomination_id),
    CONSTRAINT fk_evaluations_judge      FOREIGN KEY (judge_id)      REFERENCES judges(user_id),
    CONSTRAINT fk_evaluations_category   FOREIGN KEY (category_id)   REFERENCES award_categories(category_id)
);

-- ---------------------------------------------------------------------
-- 6. Votes
-- NOTE: the unique constraint below is copied as-is from the current
-- Vote entity (voter_id, nominee_id, category_id). Per the code-review
-- findings this is almost certainly the WRONG uniqueness rule for
-- one-vote-per-category — see VoteService.submitVote. Fix the entity's
-- @UniqueConstraint to (voter_id, category_id) and regenerate this
-- migration (or add a V2 migration) before relying on it for real data.
-- ---------------------------------------------------------------------
CREATE TABLE votes (
    vote_id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    voter_id             BIGINT         NOT NULL,
    nominee_id           BIGINT         NOT NULL,
    category_id          BIGINT         NOT NULL,
    vote_timestamp       DATETIME2      NOT NULL,
    status               NVARCHAR(30)   NOT NULL DEFAULT 'VALID',
    ip_address           NVARCHAR(50)   NULL,
    CONSTRAINT uq_votes_voter_nominee_category UNIQUE (voter_id, nominee_id, category_id),
    CONSTRAINT fk_votes_voter    FOREIGN KEY (voter_id)    REFERENCES voters(user_id),
    CONSTRAINT fk_votes_nominee  FOREIGN KEY (nominee_id)  REFERENCES nominees(user_id),
    CONSTRAINT fk_votes_category FOREIGN KEY (category_id) REFERENCES award_categories(category_id)
);

-- ---------------------------------------------------------------------
-- 7. Final scores (results / winner)
-- ---------------------------------------------------------------------
CREATE TABLE final_scores (
    score_id             BIGINT IDENTITY(1,1) PRIMARY KEY,
    nominee_id           BIGINT         NOT NULL,
    category_id          BIGINT         NOT NULL,
    vote_score           FLOAT          NULL DEFAULT 0.0,
    judge_score          FLOAT          NULL DEFAULT 0.0,
    final_score          FLOAT          NOT NULL DEFAULT 0.0,
    total_votes          BIGINT         NULL DEFAULT 0,
    total_evaluations    BIGINT         NULL DEFAULT 0,
    [rank]               INT            NULL,
    is_winner            BIT            NULL DEFAULT 0,
    calculated_at        DATETIME2      NULL,
    CONSTRAINT uq_final_scores_nominee_category UNIQUE (nominee_id, category_id),
    CONSTRAINT fk_final_scores_nominee  FOREIGN KEY (nominee_id)  REFERENCES nominees(user_id),
    CONSTRAINT fk_final_scores_category FOREIGN KEY (category_id) REFERENCES award_categories(category_id)
);

-- ---------------------------------------------------------------------
-- 8. Audit logs
-- (performed_by_user_id is a plain Long in the entity, not a JPA
-- association, so Hibernate would NOT generate an FK here either --
-- kept consistent with that, though a real FK is worth adding by hand.)
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
    log_id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    performed_by_user_id BIGINT         NULL,
    action_type          NVARCHAR(255)  NOT NULL,
    details              NVARCHAR(MAX)  NULL,
    entity_type          NVARCHAR(255)  NULL,
    entity_id            BIGINT         NULL,
    [timestamp]          DATETIME2      NOT NULL
);

-- ---------------------------------------------------------------------
-- Helpful indexes on FK columns (SQL Server does not auto-index these)
-- ---------------------------------------------------------------------
CREATE INDEX ix_nominations_nominee_id   ON nominations(nominee_id);
CREATE INDEX ix_nominations_category_id  ON nominations(category_id);
CREATE INDEX ix_nomination_documents_nomination_id ON nomination_documents(nomination_id);
CREATE INDEX ix_evaluations_nomination_id ON evaluations(nomination_id);
CREATE INDEX ix_evaluations_judge_id      ON evaluations(judge_id);
CREATE INDEX ix_evaluations_category_id   ON evaluations(category_id);
CREATE INDEX ix_votes_voter_id            ON votes(voter_id);
CREATE INDEX ix_votes_nominee_id          ON votes(nominee_id);
CREATE INDEX ix_votes_category_id         ON votes(category_id);
CREATE INDEX ix_final_scores_category_id  ON final_scores(category_id);
CREATE INDEX ix_audit_logs_performed_by   ON audit_logs(performed_by_user_id);
CREATE INDEX ix_audit_logs_action_type    ON audit_logs(action_type);
