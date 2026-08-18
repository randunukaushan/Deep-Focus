# Deep Focus API Specification

This document defines the API contract for Deep Focus V1.

It describes how the Deep Focus client communicates with backend services, including request conventions, authentication, resource access, error handling, and synchronization behavior.

The API should provide a stable boundary between the application interface and backend implementation while remaining simple enough for reliable V1 development.

Logical application entities are defined in `DATA_MODEL.md`.

Database-specific storage structures are defined separately in `DATABASE_SCHEMA.md`.

Security requirements are defined in `SECURITY.md`.

---

## 1. API Goals

---

The Deep Focus V1 API should:

- Provide predictable communication between client and backend
- Support authenticated user-owned data
- Protect user privacy
- Validate incoming data
- Return consistent responses
- Provide clear error behavior
- Support reliable focus-session persistence
- Support tasks and goals
- Support settings and assessments
- Support analytics and reward data where required
- Support synchronization without unnecessary complexity
- Prevent unauthorized access to user-owned resources
- Remain extensible without overengineering V1

The API should expose only functionality required by implemented Deep Focus features.

---

## 2. API Design Principles

---

The API should follow these principles:

- Use HTTPS for production communication
- Use JSON for application request and response bodies where applicable
- Use consistent resource naming
- Use appropriate HTTP methods
- Validate all client-provided data
- Treat client input as untrusted
- Enforce authorization on protected resources
- Return consistent error structures
- Avoid exposing internal implementation details
- Avoid returning unnecessary sensitive information
- Keep endpoints focused on clear responsibilities

The client should not be trusted to enforce security-sensitive rules by itself.

Backend validation and authorization should protect server-managed data independently of the user interface.

---

## 3. Base API Structure

---

The production API should use a versioned base path.

Conceptually:

```text
https://api.deepfocus.app/v1
```

The final production domain may differ.

The important requirement is that API versioning remains explicit.

Example resource paths:

```text
/v1/auth
/v1/users
/v1/focus-sessions
/v1/tasks
/v1/goals
/v1/streak
/v1/rewards
/v1/settings
/v1/assessments
/v1/analytics
```

V1 should avoid unnecessary endpoint nesting.

User ownership should normally be determined from the authenticated identity rather than trusting arbitrary user identifiers supplied by the client.

---

## 4. Request Conventions

---

Requests should use JSON where a request body is required.

Example:

```http
POST /v1/tasks
Content-Type: application/json
Authorization: Bearer <access-token>
```

Example request body:

```json
{
  "title": "Review Biology Chapter 4",
  "priority": "high",
  "goalId": "goal_123"
}
```

Clients should send only fields supported by the endpoint.

Unknown or invalid fields should be rejected or safely ignored according to the endpoint contract.

### HTTP Methods

The API should generally use:

```text
GET
→ Retrieve data

POST
→ Create a resource or perform an explicit action

PATCH
→ Partially update an existing resource

DELETE
→ Delete or remove a resource where supported
```

`PUT` may be introduced where complete resource replacement provides a clear implementation benefit, but it is not required as the default update method.

### Query Parameters

Query parameters may be used for:

- Pagination
- Filtering
- Date ranges
- Sorting where supported

Example:

```text
GET /v1/focus-sessions?from=2026-08-01&to=2026-08-31
```

The API should validate query parameters and apply reasonable limits.

---

## 5. Response Conventions

---

Successful responses should use predictable JSON structures.

Example single-resource response:

```json
{
  "data": {
    "id": "task_123",
    "title": "Review Biology Chapter 4",
    "status": "pending"
  }
}
```

Example collection response:

```json
{
  "data": [
    {
      "id": "task_123",
      "title": "Review Biology Chapter 4"
    },
    {
      "id": "task_124",
      "title": "Complete Chemistry Questions"
    }
  ]
}
```

Where pagination is required, metadata may be included:

```json
{
  "data": [],
  "meta": {
    "nextCursor": null
  }
}
```

Endpoints should avoid returning fields the client does not require when those fields contain sensitive or internal information.

### HTTP Status Codes

Common status codes should include:

```text
200 OK
→ Successful retrieval or update

201 Created
→ Resource successfully created

204 No Content
→ Successful operation with no response body

400 Bad Request
→ Invalid request

401 Unauthorized
→ Authentication is missing or invalid

403 Forbidden
→ Authenticated user is not allowed to perform the action

404 Not Found
→ Requested resource does not exist or is not available to the user

409 Conflict
→ Request conflicts with current resource state

422 Unprocessable Content
→ Request structure is valid but supplied values fail validation

429 Too Many Requests
→ Request rate limit exceeded where rate limiting is implemented

500 Internal Server Error
→ Unexpected server failure
```

The API should use status codes consistently rather than returning successful status codes for failed operations.

---

## 6. Error Response Format

---

API errors should use a consistent structure.

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "details": {
      "field": "plannedDurationSeconds"
    }
  }
}
```

The `code` should provide a stable machine-readable error identifier.

The `message` should provide a safe human-readable explanation.

`details` should remain optional and should not expose sensitive implementation information.

Possible error codes may include:

```text
VALIDATION_ERROR
AUTHENTICATION_REQUIRED
INVALID_CREDENTIALS
ACCESS_DENIED
RESOURCE_NOT_FOUND
RESOURCE_CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

Additional error codes may be introduced when a real V1 feature requires them.

The API should never intentionally expose:

- Passwords
- Authentication secrets
- Private tokens
- Database credentials
- Internal stack traces
- Sensitive server configuration

---

## 7. Authentication and Authorization

---

Protected API endpoints should require an authenticated user identity.

Conceptually:

```http
Authorization: Bearer <access-token>
```

The exact authentication provider and token implementation should follow `ARCHITECTURE.md` and `SECURITY.md`.

The API should determine the authenticated user's identity from validated authentication state.

Clients should not be allowed to gain access to another user's data by changing a request field such as:

```json
{
  "userId": "another-user-id"
}
```

For user-owned resources, ownership should be enforced by the backend.

Protected resources may include:

- Focus sessions
- Tasks
- Goals
- Streak data
- Reward progress
- User settings
- Assessments
- Private analytics

Authentication and authorization are separate responsibilities.

Authentication answers:

```text
Who is making the request?
```

Authorization answers:

```text
Is this user allowed to access or modify this resource?
```

Both should be enforced where required.

---

## 8. API Resource Overview

---

The V1 API may expose the following primary resource groups:

```text
Authentication
→ Account access and authentication lifecycle

User
→ Current user profile

Focus Sessions
→ Focus activity creation, updates, completion, and history

Tasks
→ Task creation and management

Goals
→ Goal creation and progress

Streak
→ Current consistency information

Rewards
→ Current reward progression and achievements

Settings
→ User preferences

Assessments
→ Assessment attempts and results

Analytics
→ Derived productivity summaries
```

Not every logical data entity requires unrestricted CRUD endpoints.

Endpoints should be introduced according to actual application behavior.

For example, reward progress and streak values should normally be modified through verified productivity events rather than arbitrary client requests.

---

## 9. Authentication and User Endpoints

---

Authentication endpoints should support the account lifecycle required by Deep Focus V1.

The exact authentication provider may vary, but the API contract should remain predictable.

### 1. Sign Up

```http
POST /v1/auth/sign-up
```

Example request:

```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "displayName": "Alex"
}
```

Example response:

```json
{
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "displayName": "Alex"
    },
    "accessToken": "<access-token>"
  }
}
```

The API should:

- Validate the email format
- Validate password requirements
- Prevent duplicate account creation
- Avoid exposing password or credential data
- Create the initial user record safely
- Return only the authentication information required by the client

If email verification is required, the response may indicate that verification must be completed before full access is granted.

### 2. Sign In

```http
POST /v1/auth/sign-in
```

Example request:

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Example response:

```json
{
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "displayName": "Alex"
    },
    "accessToken": "<access-token>"
  }
}
```

Invalid credentials should return a safe authentication error without revealing unnecessary account information.

### 3. Sign Out

```http
POST /v1/auth/sign-out
```

The backend should invalidate server-managed authentication state where applicable.

The client should also remove local authentication state according to the approved security design.

### 4. Forgot Password

```http
POST /v1/auth/forgot-password
```

Example request:

```json
{
  "email": "user@example.com"
}
```

The response should avoid revealing whether the email address belongs to an existing account.

Example:

```json
{
  "data": {
    "message": "If an account exists, password recovery instructions have been sent."
  }
}
```

### 5. Current User

```http
GET /v1/users/me
```

Example response:

```json
{
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "displayName": "Alex",
    "avatarUrl": null,
    "createdAt": "2026-08-19T00:00:00.000Z",
    "updatedAt": "2026-08-19T00:00:00.000Z"
  }
}
```

### 6. Update Current User

```http
PATCH /v1/users/me
```

Example request:

```json
{
  "displayName": "Alex Johnson",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

Only supported profile fields should be accepted.

Authentication credentials should be managed through dedicated security or authentication flows rather than arbitrary profile updates.

---

## 10. Focus Session Endpoints

---

Focus-session endpoints are critical to Deep Focus and should preserve reliable session state.

The API should prevent invalid state transitions and duplicate completion processing.

### 1. Create Focus Session

```http
POST /v1/focus-sessions
```

Example request:

```json
{
  "taskId": "task_123",
  "title": "Review Biology Chapter 4",
  "plannedDurationSeconds": 3000
}
```

Example response:

```json
{
  "data": {
    "id": "session_123",
    "taskId": "task_123",
    "title": "Review Biology Chapter 4",
    "status": "active",
    "plannedDurationSeconds": 3000,
    "focusedDurationSeconds": 0,
    "pausedDurationSeconds": 0,
    "startedAt": "2026-08-19T00:20:00.000Z",
    "createdAt": "2026-08-19T00:20:00.000Z",
    "updatedAt": "2026-08-19T00:20:00.000Z"
  }
}
```

The server should assign ownership from authenticated identity.

The client should not control protected ownership fields.

### 2. Get Focus Session

```http
GET /v1/focus-sessions/{sessionId}
```

The API should return the session only when the authenticated user is allowed to access it.

### 3. List Focus Sessions

```http
GET /v1/focus-sessions
```

Optional query parameters may include:

```text
status
from
to
cursor
limit
```

Example:

```text
GET /v1/focus-sessions?status=completed&from=2026-08-01&to=2026-08-31
```

The API should apply reasonable pagination limits for large history collections.

### 4. Pause Focus Session

```http
POST /v1/focus-sessions/{sessionId}/pause
```

The API should:

- Confirm the session is currently active
- Record the pause timestamp
- Update confirmed focused duration
- Prevent duplicate pause transitions
- Return the updated session state

Example response:

```json
{
  "data": {
    "id": "session_123",
    "status": "paused",
    "focusedDurationSeconds": 1250,
    "lastPausedAt": "2026-08-19T00:40:50.000Z"
  }
}
```

### 5. Resume Focus

## 13. Streak Endpoints

---

Streak endpoints should primarily provide access to calculated consistency information.

The client should not be allowed to directly set trusted streak values.

### 1. Get Current Streak

```http
GET /v1/streak
```

Example response:

```json
{
  "data": {
    "currentStreak": 7,
    "longestStreak": 14,
    "lastQualifyingDate": "2026-08-18",
    "currentStreakStartedAt": "2026-08-12"
  }
}
```

Streak values should be determined from verified qualifying productivity activity.

The client should not submit arbitrary values such as:

```json
{
  "currentStreak": 100
}
```

### 2. Streak Processing

Streak updates should normally occur automatically after qualifying activity.

Conceptually:

```text
Completed FocusSession
        ↓
Verify Qualification
        ↓
Determine User Calendar Day
        ↓
Update Streak
```

Repeated processing of the same qualifying activity should not increment the streak multiple times.

### 3. Streak Recalculation

If a server-side recalculation mechanism is required for recovery or maintenance, it should not normally be exposed as an unrestricted client endpoint.

Recalculation should use authoritative focus-session history.

---

## 14. Reward Endpoints

---

Reward endpoints should expose verified user progression without allowing the client to grant itself rewards.

### 1. Get Reward Progress

```http
GET /v1/rewards
```

Example response:

```json
{
  "data": {
    "totalXp": 1250,
    "level": 6,
    "unlockedAchievementIds": [
      "first_focus_session",
      "three_day_streak"
    ]
  }
}
```

### 2. Reward Processing

Reward progress should normally be updated through verified backend events.

Examples include:

```text
Completed FocusSession
        ↓
Reward Eligibility
        ↓
XP / Achievement
```

```text
Completed Goal
        ↓
Reward Eligibility
        ↓
XP / Achievement
```

```text
Streak Milestone
        ↓
Reward Eligibility
        ↓
XP / Achievement
```

The V1 API should not expose an unrestricted endpoint such as:

```text
POST /v1/rewards/add-xp
```

that allows a client to arbitrarily increase trusted reward progress.

### 3. Achievements

Where the client requires achievement definitions, the API may expose:

```http
GET /v1/rewards/achievements
```

Example response:

```json
{
  "data": [
    {
      "id": "first_focus_session",
      "title": "First Focus",
      "description": "Complete your first qualifying focus session."
    },
    {
      "id": "three_day_streak",
      "title": "Building Momentum",
      "description": "Reach a 3-day focus streak."
    }
  ]
}
```

Static achievement definitions may instead remain bundled with the application when remote delivery provides no meaningful V1 benefit.

---

## 15. Settings Endpoints

---

Settings endpoints should allow users to retrieve and modify supported preferences.

### 1. Get Settings

```http
GET /v1/settings
```

Example response:

```json
{
  "data": {
    "theme": "system",
    "defaultFocusDurationMinutes": 25,
    "defaultBreakDurationMinutes": 5,
    "notificationsEnabled": true,
    "focusRemindersEnabled": true,
    "breakRemindersEnabled": true,
    "achievementNotificationsEnabled": true,
    "soundEnabled": true,
    "hapticsEnabled": true,
    "reducedMotion": false,
    "aiFeaturesEnabled": true,
    "aiCoachingNotificationsEnabled": false
  }
}
```

If no stored settings exist, the backend or client should apply the approved V1 defaults consistently.

### 2. Update Settings

```http
PATCH /v1/settings
```

Example request:

```json
{
  "theme": "dark",
  "defaultFocusDurationMinutes": 50,
  "hapticsEnabled": false
}
```

The API should:

- Accept only supported settings
- Validate supplied values
- Preserve settings not included in the partial update
- Reject invalid duration or enum values
- Update `updatedAt` where applicable

Changing settings should not modify historical focus sessions or other historical productivity records.

### 3. Device-Level Restrictions

API settings do not override operating-system permissions.

For example:

```text
notificationsEnabled = true
OS notification permission = denied

Result
→ Notifications remain unavailable
```

Device-specific permission state should normally remain device-managed rather than treated as globally synchronized server preference data.

---

## 16. Assessment Endpoints

---

Assessment endpoints should support assessment attempts, answers, completion, and structured results.

Assessment definitions and user answers should remain conceptually separate.

### 1. Get Current Assessment Definition

Where assessment definitions are delivered remotely, the API may expose:

```http
GET /v1/assessments/definition
```

Example response:

```json
{
  "data": {
    "version": "1.0",
    "questions": [
      {
        "id": "preferred_focus_duration",
        "type": "single_choice",
        "prompt": "How long do you usually prefer to focus?",
        "required": true
      }
    ]
  }
}
```

If V1 uses a static assessment definition bundled with the application, this endpoint is not required.

### 2. Start Assessment

```http
POST /v1/assessments
```

Example response:

```json
{
  "data": {
    "id": "assessment_123",
    "version": "1.0",
    "status": "in_progress",
    "answers": [],
    "startedAt": "2026-08-19T00:30:00.000Z"
  }
}
```

### 3. Save Assessment Answers

```http
PATCH /v1/assessments/{assessmentId}
```

Example request:

```json
{
  "answers": [
    {
      "questionId": "preferred_focus_duration",
      "value": 25
    },
    {
      "questionId": "common_distractions",
      "value": [
        "social_media",
        "notifications"
      ]
    }
  ]
}
```

The API should verify that:

- The assessment belongs to the authenticated user
- The assessment version is valid
- Question identifiers are valid
- Answer types match the question definitions
- Invalid duplicate answers are prevented

### 4. Complete Assessment

```http
POST /v1/assessments/{assessmentId}/complete
```

The API should:

- Validate required answers
- Calculate supported structured results
- Set `status` to `completed`
- Record `completedAt`
- Return the completed result

Example response:

```json
{
  "data": {
    "id": "assessment_123",
    "status": "completed",
    "result": {
      "recommendedFocusDurationMinutes": 25,
      "recommendedBreakDurationMinutes": 5,
      "primaryChallenges": [
        "notifications"
      ]
    }
  }
}
```

### 5. List Assessments

Where historical attempts are supported:

```http
GET /v1/assessments
```

The newest assessment may be returned first.

### 6. Assessment and Settings

Assessment recommendations should not silently overwrite explicit user settings unless approved product behavior clearly requires it.

A preferred V1 interaction is:

```text
Assessment Completed
        ↓
Recommendation Returned
        ↓
User Reviews Recommendation
        ↓
User Accepts
        ↓
Settings Updated
```

### 7. AI-Assisted Assessment

Where AI is used for assessment recommendations:

- AI processing should respect the user's AI preference
- Only required assessment data should be transmitted
- AI failures should not corrupt the assessment record
- AI output should not be treated as trusted authorization or security data
- Deterministic application-critical validation should remain outside AI processing

The exact AI service contract may be implemented behind the backend rather than exposing third-party AI credentials directly to the mobile client.

---

## 17. Analytics Endpoints

---

Analytics endpoints should provide derived productivity information.

Analytics should not become a second authoritative copy of focus-session history.

### 1. Analytics Summary

```http
GET /v1/analytics/summary
```

Optional date parameters may include:

```text
from
to
```

Example:

```text
GET /v1/analytics/summary?from=2026-08-01&to=2026-08-31
```

Example response:

```json
{
  "data": {
    "totalFocusSeconds": 43200,
    "completedSessions": 18,
    "completedTasks": 12,
    "completedGoals": 3,
    "averageFocusSessionSeconds": 2400
  }
}
```

### 2. Daily Analytics

Where charts or trend views require daily data:

```http
GET /v1/analytics/daily
```

Example:

```text
GET /v1/analytics/daily?from=2026-08-12&to=2026-08-18
```

Example response:

```json
{
  "data": [
    {
      "date": "2026-08-17",
      "focusSeconds": 5400,
      "completedSessions": 2
    },
    {
      "date": "2026-08-18",
      "focusSeconds": 7200,
      "completedSessions": 3
    }
  ]
}
```

### 3. Analytics Sources

Analytics should derive information from authoritative records such as:

```text
FocusSession
Task
Goal
Streak
RewardProgress
```

The client should not submit trusted analytics totals that can be calculated from verified backend data.

For example, the API should not trust:

```json
{
  "totalFocusSeconds": 99999999
}
```

as authoritative productivity history.

### 4. Date Range Validation

Analytics requests should validate date ranges.

The API may apply reasonable limits to prevent unnecessarily expensive requests.

Invalid ranges should return a clear validation error.

### 5. Analytics Consistency

Analytics calculations should:

- Exclude cancelled focus sessions where appropriate
- Exclude paused duration from confirmed focus time
- Use consistent calendar and time-zone rules
- Avoid double-counting synchronized records
- Remain consistent with goal and streak calculations where they depend on the same activity

Precomputed analytics summaries may be introduced later when required for performance.

V1 should prefer simpler derived calculations until demonstrated scale or performance requirements justify additional infrastructure.

---

## 18. Pagination

---

Collection endpoints should support pagination when result sets may grow significantly.

Examples include:

- Focus-session history
- Tasks
- Goals
- Assessments

Cursor-based pagination is preferred where practical.

Example request:

```http
GET /v1/focus-sessions?limit=20&cursor=<cursor>
```

Example response:

```json
{
  "data": [],
  "meta": {
    "nextCursor": "<next-cursor>"
  }
}
```

When no additional results exist:

```json
{
  "data": [],
  "meta": {
    "nextCursor": null
  }
}
```

The API should:

- Apply reasonable default limits
- Apply maximum limits
- Validate pagination parameters
- Avoid returning unnecessarily large collections
- Preserve predictable ordering

The client should not assume that every collection can be retrieved in a single request.

---

## 19. Validation

---

All client-provided data should be validated by the backend.

Client-side validation improves user experience but should not be treated as a security boundary.

Backend validation should verify:

- Required fields
- Supported enum values
- Numeric ranges
- String length limits
- Date and timestamp formats
- Resource ownership
- Valid relationships
- Valid lifecycle transitions
- Supported query parameters

For example:

```json
{
  "plannedDurationSeconds": -500
}
```

should be rejected.

Similarly, unsupported values such as:

```json
{
  "status": "super_completed"
}
```

should not be accepted.

Validation errors should use the standard API error format.

---

## 20. Idempotency and Duplicate Processing

---

Operations that may produce important side effects should be designed to prevent unintended duplicate processing.

Critical examples include:

- Focus-session completion
- Goal completion
- Task completion
- Streak updates
- XP awards
- Achievement unlocks

A network retry should not cause the same logical event to be processed multiple times.

For example:

```text
Complete Focus Session
        ↓
Network Response Lost
        ↓
Client Retries Request
        ↓
Same Session Must Not Award XP Twice
```

Where appropriate, the API may support an idempotency key.

Example:

```http
Idempotency-Key: <unique-operation-id>
```

The exact implementation may be defined during backend and database development.

Even without explicit client-provided idempotency keys, server-side state transitions should prevent obvious duplicate processing.

---

## 21. Offline Behavior and Synchronization

---

Deep Focus should remain reliable during temporary network loss.

Core focus behavior should not depend unnecessarily on continuous network connectivity.

Where local-first behavior is implemented, the client may temporarily persist changes locally and synchronize them when connectivity returns.

Synchronization may include:

- Focus sessions
- Tasks
- Goals
- Settings
- Assessments

The synchronization system should:

- Preserve stable identifiers
- Avoid duplicate records
- Retry recoverable failures
- Preserve completed historical activity
- Avoid duplicate reward processing
- Detect conflicting updates where necessary
- Avoid silently replacing newer valid information with older data

### Focus Session Synchronization

Focus-session synchronization requires additional care because sessions may continue while the application is offline.

The client should preserve enough local timing information to recover the session reliably.

When synchronization occurs, the backend should validate the submitted session state before accepting trusted productivity activity.

The server should not blindly trust arbitrary duration values supplied by a modified or invalid client.

The exact balance between local timer authority and server validation should be defined during implementation according to the selected architecture.

### Conflict Handling

V1 should use simple and predictable conflict handling.

Different resource types may use different strategies.

For example:

```text
Settings
→ Latest valid update may be acceptable

Completed FocusSession
→ Historical record should normally remain immutable

Task
→ Updated timestamp may help resolve conflicts
```

Complex collaborative conflict-resolution systems are not required for V1.

---

## 22. Rate Limiting

---

The backend may apply rate limits to protect service reliability and prevent abuse.

Rate limiting may be particularly relevant for:

- Authentication attempts
- Password recovery
- AI-assisted endpoints
- Expensive analytics requests
- Repeated automated requests

When a limit is exceeded, the API should return:

```http
429 Too Many Requests
```

The response should use the standard error format.

Example:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later."
  }
}
```

Rate-limit behavior should avoid exposing unnecessary internal infrastructure details.

---

## 23. AI API Boundaries

---

Where Deep Focus uses external AI services, the mobile client should not contain private provider credentials.

Preferred architecture:

```text
Deep Focus Client
        ↓
Deep Focus Backend
        ↓
AI Provider
```

The backend should control:

- Provider authentication
- Request validation
- Required data selection
- Rate limiting
- Error handling
- Response normalization

Only information required for the supported AI feature should be transmitted.

AI endpoints should respect relevant user preferences and privacy requirements.

AI failures should not prevent core focus functionality from operating where AI is optional.

AI-generated output should not be trusted for:

- Authentication
- Authorization
- Ownership decisions
- Security-sensitive validation
- Trusted reward calculations

Deterministic backend logic should remain responsible for those operations.

---

## 24. API Security Requirements

---

All production API communication should use HTTPS.

Protected endpoints should verify authentication and authorization before returning or modifying user-owned information.

The API should:

- Treat all client input as untrusted
- Validate authentication tokens
- Enforce resource ownership
- Protect sensitive data
- Avoid exposing internal errors
- Avoid logging sensitive credentials
- Apply reasonable abuse protections
- Keep private service credentials on trusted backend infrastructure

Security-sensitive implementation details should follow `SECURITY.md`.

The API specification defines expected behavior but does not replace the project's dedicated security requirements.

---

## 25. API Versioning

---

The V1 API should use explicit versioning.

Example:

```text
/v1/focus-sessions
/v1/tasks
/v1/goals
```

Breaking API changes should not silently change the behavior expected by existing clients.

Future breaking changes may introduce a new API version.

Example:

```text
/v2/
```

Non-breaking additions may remain within the current version where compatibility is preserved.

The project should avoid creating new API versions unless a real compatibility requirement exists.

---

## 26. API Documentation and Implementation Alignment

---

The API implementation and this specification should remain synchronized.

When an endpoint changes significantly:

- Update this document
- Update related data-model documentation
- Update database documentation where required
- Update security documentation where required
- Update affected tests
- Update the changelog when the change is significant

Endpoints that are not implemented should not be presented as completed production functionality.

During development, planned API behavior may remain documented as part of the approved V1 contract.

---

## 27. V1 API Summary

---

The Deep Focus V1 API is organized around the following resource groups:

```text
/v1/auth
→ Authentication lifecycle

/v1/users
→ User profile

/v1/focus-sessions
→ Focus activity and session recovery

/v1/tasks
→ Task management

/v1/goals
→ Productivity goals

/v1/streak
→ Consistency information

/v1/rewards
→ XP and achievements

/v1/settings
→ User preferences

/v1/assessments
→ Assessment attempts and results

/v1/analytics
→ Derived productivity information
```

The API should distinguish between client-editable information and trusted server-managed information.

Conceptually:

```text
Client-Editable
├── Profile
├── Tasks
├── Goals
├── Settings
└── Assessment Answers

Verified / Server-Managed
├── Trusted Session Completion
├── Goal Progress
├── Streak
├── Reward Progress
├── Achievement Unlocks
└── Analytics
```

The exact implementation may vary according to the selected backend architecture while preserving these responsibilities.

---

# Conclusion

---

This API Specification defines the communication contract required for Deep Focus V1.

The API should prioritize:

- Predictable behavior
- Reliable focus-session handling
- Authentication and authorization
- Data validation
- User ownership
- Privacy
- Consistent error handling
- Duplicate-processing protection
- Reliable synchronization
- Maintainable versioning
- Clear client and server responsibilities

The API should remain focused on functionality required by the first usable version of Deep Focus.

Logical application entities should follow `DATA_MODEL.md`.

Database tables, relationships, constraints, and indexes should be defined in `DATABASE_SCHEMA.md`.

Authentication, authorization, credential handling, privacy, and security controls should be defined in `SECURITY.md`.

Implementation details should remain flexible where they do not affect the API contract.

---