# Unit U-005 (Database Schema) - Functional Design Plan

## Unit Context

**Unit Name**: U-005 - Database Schema
**Type**: Database
**Primary Responsibility**: PostgreSQL 데이터베이스 스키마 정의

**Assigned User Stories** (Supporting All 13 Stories):
- 모든 User Stories의 데이터 저장소 역할

**Key Deliverables**:
- `users` 테이블 (US-009, US-010, US-011, US-012)
- `urls` 테이블 (US-001, US-002, US-003)
- `click_logs` 테이블 (US-004, US-005, US-006, US-007, US-008)
- Flyway 마이그레이션 스크립트 (V1, V2, V3)

---

## Functional Design Execution Plan

### Phase 1: Domain Model Analysis
- [ ] Analyze all 3 domain entities (User, Url, ClickLog)
- [ ] Identify all attributes for each entity
- [ ] Define data types and constraints
- [ ] Map entity relationships (Foreign Keys)

### Phase 2: Business Rules Identification
- [ ] Define data validation rules
- [ ] Define uniqueness constraints
- [ ] Define referential integrity rules (CASCADE behavior)
- [ ] Define default values and auto-generated fields

### Phase 3: Schema Design
- [ ] Design `users` table structure
- [ ] Design `urls` table structure
- [ ] Design `click_logs` table structure
- [ ] Define all indexes for query optimization

### Phase 4: Migration Strategy
- [ ] Plan Flyway versioning strategy (V1, V2, V3)
- [ ] Design rollback-safe migration scripts
- [ ] Ensure idempotent migration execution

### Phase 5: Documentation
- [ ] Document table schemas with all columns
- [ ] Document all constraints and indexes
- [ ] Create entity relationship diagram (ERD)
- [ ] Document migration execution sequence

---

## Clarification Questions

### Section 1: users Table Design

#### Q1: Password Storage for OAuth2 Users
The current design allows `password_hash` to be NULL for OAuth2 users (Google, GitHub). Should we enforce this at the database level or handle it in application logic?

**Options**:
- A: Use CHECK constraint to enforce "password_hash IS NULL when provider != 'local'"
- B: Handle in application logic only (no database constraint)
- C: Create separate tables for local users and OAuth2 users

[Answer]: B

---

#### Q2: Provider ID Uniqueness
For OAuth2 users, should the combination of (provider, provider_id) be unique? For example, if a user logs in with Google, should we prevent duplicate entries?

**Options**:
- A: Yes, add UNIQUE constraint on (provider, provider_id)
- B: No, allow duplicate provider IDs (handle in application)
- C: Add unique constraint but only for non-NULL provider_id

[Answer]: A

---

#### Q3: User Email Constraints
Should email be required for ALL users (including OAuth2 users), or can OAuth2 users have NULL emails if the provider doesn't share it?

**Options**:
- A: Email is required for ALL users (NOT NULL)
- B: Email can be NULL for OAuth2 users
- C: Email is required, but OAuth2 users can use a placeholder (e.g., "no-email@provider.com")

[Answer]: A

---

### Section 2: urls Table Design

#### Q4: Short Code Length
The current design uses `VARCHAR(10)` for short_code. Is 10 characters sufficient for Base62 encoding?

**Context**: Base62 encoding of a BIGINT (max ~9 quintillion) requires approximately 11 characters.

**Options**:
- A: Keep VARCHAR(10) - sufficient for most use cases (handles up to ~62^10 URLs)
- B: Increase to VARCHAR(15) - more headroom
- C: Use VARCHAR(20) - maximum safety

[Answer]: A

---

#### Q5: Anonymous URL Handling
For anonymous URLs (user_id is NULL), should we add any special tracking or constraints?

**Options**:
- A: No special handling - NULL user_id is sufficient
- B: Add a boolean column `is_anonymous` for easier querying
- C: Create a default "anonymous" user (id=0) and use it instead of NULL

[Answer]: A

---

#### Q6: Soft Delete vs Hard Delete
The current design uses `is_active` boolean. Should URL deletion be soft delete (set is_active=false) or hard delete (DELETE from database)?

**Options**:
- A: Soft delete only (keep all URLs, set is_active=false)
- B: Hard delete only (permanently remove from database)
- C: Support both (soft delete by default, hard delete as admin feature)

[Answer]: A

---

#### Q7: URL Expiration Enforcement
Should expired URLs be automatically deactivated by a database trigger, or handled by application logic (@Scheduled job)?

**Options**:
- A: Database trigger (automatically set is_active=false when expires_at < NOW())
- B: Application @Scheduled job (Spring Boot scheduled task)
- C: Check on each redirect request (no automatic deactivation)

[Answer]: B

---

### Section 3: click_logs Table Design

#### Q8: IP Address Storage Format
Should we store IP addresses as VARCHAR(45) (supports IPv4 and IPv6), or use a specialized IP address type?

**Options**:
- A: VARCHAR(45) - simple and compatible
- B: INET type (PostgreSQL native IP address type)
- C: Store as BIGINT (convert IP to numeric)

[Answer]: A

---

#### Q9: User Agent Storage
User-Agent strings can be very long (500+ characters). Should we limit the length or store full strings?

**Options**:
- A: TEXT - unlimited length
- B: VARCHAR(500) - limit to 500 characters
- C: VARCHAR(1000) - limit to 1000 characters

[Answer]: A

---

#### Q10: Click Log Retention Policy
Should we implement a data retention policy for old click logs (e.g., delete logs older than 2 years)?

**Options**:
- A: No retention policy - keep all click logs forever
- B: Add a retention policy (e.g., delete logs older than 2 years)
- C: Add a soft delete mechanism for archiving old logs

[Answer]: A

---

#### Q11: Country Code Validation
Should we enforce ISO 3166-1 alpha-2 country code format (exactly 2 characters) at the database level?

**Options**:
- A: Yes, add CHECK constraint (LENGTH(country_code) = 2)
- B: No, handle validation in application logic
- C: Use ENUM type with all valid country codes

[Answer]: B

---

### Section 4: Indexes and Performance

#### Q12: Composite Index Strategy
For the `click_logs` table, should we create composite indexes for common query patterns (e.g., url_id + clicked_at)?

**Options**:
- A: Yes, create composite index on (url_id, clicked_at) for date-range queries
- B: No, keep separate indexes on url_id and clicked_at
- C: Create multiple composite indexes based on expected query patterns

[Answer]: A

---

#### Q13: Index on is_active Column
Should we index the `is_active` column in the `urls` table?

**Context**: Most queries will filter by is_active=true.

**Options**:
- A: Yes, create index on is_active
- B: No, low cardinality column (only 2 values) - not worth indexing
- C: Create partial index (WHERE is_active = true)

[Answer]: C

---

### Section 5: Flyway Migration Strategy

#### Q14: Migration Rollback Strategy
Should Flyway migrations include rollback scripts (undo migrations)?

**Options**:
- A: Yes, create Undo migrations (V1__create_users.sql + U1__drop_users.sql)
- B: No, Flyway Community Edition doesn't support undo - use forward-only migrations
- C: Use Flyway Pro for undo migrations

[Answer]: B

---

#### Q15: Migration Testing
Should we create a separate migration for test data (seed data)?

**Options**:
- A: Yes, create V99__seed_test_data.sql for development/testing
- B: No, seed data should be managed outside Flyway (application.yml profiles)
- C: Use Flyway callbacks for test data seeding

[Answer]: B

---

## Summary of Questions
- **Total Questions**: 15
- **Categories**:
  - users Table: 3 questions
  - urls Table: 4 questions
  - click_logs Table: 4 questions
  - Indexes: 2 questions
  - Migration Strategy: 2 questions

---

## Instructions for User

1. Review each question carefully
2. Fill in the [Answer]: tag with your choice (A, B, or C)
3. If you have any clarifications or want to propose a different approach, add a note below the question
4. Once all answers are filled, let me know you're ready to proceed

---

## Next Steps After Completion

1. Analyze answers for ambiguities
2. Generate functional design artifacts:
   - domain-entities.md
   - business-rules.md
   - business-logic-model.md (ERD + schema design)
3. Present completion message and wait for approval
