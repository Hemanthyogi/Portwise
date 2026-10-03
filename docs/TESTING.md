# PORTWISE — Testing Specification & Verification
**Quality Assurance Report**

## 1. Test Architecture
The test suite utilizes JUnit 5, Mockito, and Spring Boot Test with an isolated test configuration (`application-test.yml`) running an in-memory H2 database in PostgreSQL mode to ensure rapid, deterministic verification.

## 2. Test Execution
Execute the full test suite from the backend directory:
```bash
cd backend
mvn test
```

## 3. Verified Test Classes & Business Rule Coverage

### `com.portwise.BerthConflictTest`
- **`testDraftExceedsBerthMaxDraft()`**: Verifies **RULE 2** — If a vessel's draft exceeds the berth's maximum draft, a `ConflictException` is thrown and berthing is prevented.
- **`testLOAExceedsBerthMaxLOA()`**: Verifies **RULE 3** — If a vessel's length overall (LOA) exceeds the berth's supported LOA, a `ConflictException` is thrown.
- **`testCompatibleVesselPasses()`**: Verifies that vessels within physical draft and length limits pass validation smoothly.
- **`testScheduleBerthConflictDetection()`**: Verifies **RULE 1** — Overlapping time windows for the same berth trigger a `ConflictException` during scheduling or approval.

### `com.portwise.CargoTrackingTest`
- **`testCompletedCargoCannotRevertToRegistered()`**: Verifies **RULE 7** — Cargo in `COMPLETED` state cannot be returned to `REGISTERED` without explicit administrative action, preventing custody record tampering.
- **`testValidStatusTransition()`**: Verifies that legitimate status updates automatically append an event record to the `CargoMovement` timeline with timestamp and operator metadata.

### `com.portwise.AuthServiceTest`
- **`testLoginSuccess()`**: Verifies BCrypt authentication, JWT token generation, and role authority mapping.
- **`testRegisterSuccess()`**: Verifies secure password hashing using BCrypt before persisting the user.
- **`testRegisterDuplicateEmail()`**: Verifies unique constraint checks, throwing `ConflictException` on duplicate email addresses.

## 4. Test Results Summary
```
[INFO] Running com.portwise.AuthServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.portwise.BerthConflictTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.portwise.CargoTrackingTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
```
