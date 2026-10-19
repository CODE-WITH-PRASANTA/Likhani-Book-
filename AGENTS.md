# Engineering Standards & Operating Principles for Likhani-Book

This codebase requires the diligence and skepticism of a senior engineer working on production systems where data integrity, reliability, and security are paramount. Every AI agent working on this repository MUST abide by the following 8 core rules for every task, without exception.

---

## 1. Do Not Trust Your Own Output by Default
- After writing or modifying any code, the default assumption is **"this might be wrong until proven otherwise"**.
- Prove correctness by:
  - Running the code and verifying actual runtime behavior.
  - Writing and running automated tests that specifically test failure and edge conditions.
  - Tracing data flow by hand with concrete inputs.
  - Testing edge cases: empty collections, null/undefined inputs, malformed types, concurrent writes, network drops, partial failures, out-of-order calls.

## 2. Go Through Every Layer, Every Time — Don't Stop at "It Compiles"
- **Frontend**:
  - Loading, error, empty, and success states properly handled?
  - Calling the correct endpoint with the exact expected payload shape?
  - Graceful degradation on network failure, slow 3G, or server 500s?
  - Tested on responsive/mobile viewports?
  - No broken or misleading UI states?
- **Backend**:
  - Comprehensive input validation & sanitization (type, length, format, enum values)?
  - Robust failure paths (database connection down, timeouts, duplicate submissions, concurrent requests)?
  - Authentication, authorization, and tenant isolation strictly enforced?
  - Response shape matches frontend expectations exactly (validated against both sides)?
  - Unhandled promise rejections and uncaught exceptions impossible?
- **Database**:
  - Schema constraints (unique, required, foreign keys, check constraints) enforced at the DB level, not just app code.
  - Correct indexes for all query filters, foreign keys, and sorting fields.
  - Race conditions prevented (transactions, optimistic/pessimistic concurrency where appropriate).
  - Clean rollback behavior and data migration safety.
- **System / Architecture**:
  - Failure/graceful degradation if an upstream or external dependency is slow or down.
  - Statelessness verification: will horizontal scaling behind a load balancer break sessions, local file storage, or in-memory caches?
  - Timeouts, retries with exponential backoff, and circuit breakers on external service calls.

## 3. Do Not Break Existing Flows — Check, Don't Assume
- Identify every model, table, route, helper, or component touched.
- Search the entire repository for usages before and after modifying shared code.
- Run existing tests and manually verify affected flows before declaring work complete.

## 4. Research Before You Implement
- For any unfamiliar API, package version, or framework pattern, consult official documentation.
- When multiple architectural approaches exist, explicitly compare tradeoffs (correctness, concurrency, performance, maintainability) and explain the choice.

## 5. Take the Time It Actually Needs
- Correctness and robustness always trump speed.
- Never choose a fast-but-fragile patch over a proper structural fix.
- If a tradeoff or temporary limitation is truly unavoidable, flag it explicitly for user decision.

## 6. Design for Failure, Not Just for Success
- Always determine what happens when an operation fails halfway through.
- Use atomic transactions where partial execution would corrupt state.
- Use idempotency keys for retryable operations.
- Ensure orphaned resources (e.g. uploaded files when DB insert fails) are cleaned up.
- Provide clear recovery paths for failed or stuck records.

## 7. Think About the Actual Human Using It
- Design for real users under real conditions: mobile devices, slow connections, stress.
- Error messages must be actionable, empathetic, and clear (never raw stack traces or cryptic codes).
- Streamline user workflows: minimize friction, confirm destructive actions, provide immediate feedback.

## 8. Show Your Actual Verification, Not a Summary of Intent
- Never say "I implemented X and it should work".
- Provide concrete evidence: test output, executed terminal commands, API response payloads, screenshots/DOM inspection, and verified edge cases.
