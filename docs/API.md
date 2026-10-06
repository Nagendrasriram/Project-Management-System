# REST API Reference Documentation

All endpoints return JSON responses. Interactive Swagger UI is hosted at `http://localhost:5000/api/docs`.

## Standard Error Response Format

All errors return a uniform JSON schema:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body payload",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

### HTTP Status Code Conventions
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Input validation failed (e.g. `endDate < startDate`).
- `401 Unauthorized`: Missing, expired, or invalidated token (`TOKEN_EXPIRED`, `TOKEN_REVOKED`).
- `404 Not Found`: Resource does not exist or belongs to another user (prevents leaking existence).
- `409 Conflict`: Resource already exists (e.g. duplicate email registration).
- `429 Too Many Requests`: Rate limiter triggered on auth endpoints (max 5 attempts per 15 min per IP).
- `500 Internal Server Error`: Unhandled server exception.

---

## Authentication Endpoints

### 1. Register User
`POST /api/auth/register` (Rate-limited: 5 req/15min)

**Request Body:**
```json
{
  "fullName": "Alice Smith",
  "email": "alice@example.com",
  "password": "Password123!"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "c1f7ef3a-4412-4c2d-944a-10f763dbd761",
    "fullName": "Alice Smith",
    "email": "alice@example.com",
    "createdAt": "2026-10-06T18:00:00.000Z"
  }
}
```

### 2. Login User
`POST /api/auth/login` (Rate-limited: 5 req/15min)

**Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "c1f7ef3a-4412-4c2d-944a-10f763dbd761",
    "fullName": "Alice Smith",
    "email": "alice@example.com",
    "createdAt": "2026-10-06T18:00:00.000Z"
  }
}
```

### 3. Logout User
`POST /api/auth/logout`

**Headers:**
`Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```
*Note: Increments `tokenVersion` in the database, actively invalidating all tokens issued for this session.*

### 4. Get Current Profile
`GET /api/auth/me`

**Headers:**
`Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "id": "c1f7ef3a-4412-4c2d-944a-10f763dbd761",
  "fullName": "Alice Smith",
  "email": "alice@example.com",
  "createdAt": "2026-10-06T18:00:00.000Z"
}
```

---

## Dashboard Endpoints

### 1. Get Aggregated Statistics
`GET /api/dashboard`

**Headers:**
`Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "totalProjects": 3,
  "totalTasks": 9,
  "completedTasks": 4,
  "pendingTasks": 3,
  "projectsInProgress": 2
}
```

---

## Project Endpoints

### 1. List Projects
`GET /api/projects?search=&status=&page=1&limit=10&sortBy=createdAt&order=desc`

**Headers:**
`Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "2bc047db-d933-4f93-b4d6-db2638e4a7a8",
      "name": "Mobile App Redesign",
      "description": "Revamping native UI with Expo and React Navigation",
      "status": "IN_PROGRESS",
      "startDate": "2026-10-01T00:00:00.000Z",
      "endDate": "2026-11-30T00:00:00.000Z",
      "ownerId": "c1f7ef3a-4412-4c2d-944a-10f763dbd761",
      "createdAt": "2026-10-06T18:00:00.000Z",
      "_count": {
        "tasks": 4
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### 2. Create Project
`POST /api/projects`

**Headers:**
`Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Cloud Infrastructure Migration",
  "description": "Automate containerized deployments",
  "status": "NOT_STARTED",
  "startDate": "2026-11-01T00:00:00.000Z",
  "endDate": "2026-12-15T00:00:00.000Z"
}
```

**Response (201 Created):**
```json
{
  "id": "f51950c4-9727-4632-a548-c2b62d8544ab",
  "name": "Cloud Infrastructure Migration",
  "description": "Automate containerized deployments",
  "status": "NOT_STARTED",
  "startDate": "2026-11-01T00:00:00.000Z",
  "endDate": "2026-12-15T00:00:00.000Z",
  "ownerId": "c1f7ef3a-4412-4c2d-944a-10f763dbd761",
  "createdAt": "2026-10-06T18:05:00.000Z"
}
```

### 3. Get Project Details
`GET /api/projects/:id`

**Response (200 OK):**
```json
{
  "id": "2bc047db-d933-4f93-b4d6-db2638e4a7a8",
  "name": "Mobile App Redesign",
  "description": "Revamping native UI",
  "status": "IN_PROGRESS",
  "tasks": [...]
}
```
*Note: Returns 404 if project does not belong to the authenticated user.*

### 4. Update Project
`PUT /api/projects/:id`

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

### 5. Delete Project
`DELETE /api/projects/:id`

**Response (200 OK):**
```json
{
  "message": "Project deleted successfully"
}
```

---

## Task Endpoints

### 1. List Tasks
`GET /api/tasks?projectId=&search=&status=&priority=&page=1&limit=10`

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "3587b1c1-f1eb-47eb-ba05-d14467c6999a",
      "name": "Design wireframes",
      "description": "High fidelity Figma mockups",
      "priority": "HIGH",
      "status": "COMPLETED",
      "dueDate": "2026-10-20T00:00:00.000Z",
      "projectId": "2bc047db-d933-4f93-b4d6-db2638e4a7a8",
      "createdAt": "2026-10-06T18:00:00.000Z",
      "project": {
        "id": "2bc047db-d933-4f93-b4d6-db2638e4a7a8",
        "name": "Mobile App Redesign"
      }
    }
  ],
  "pagination": { ... }
}
```

### 2. Create Task
`POST /api/tasks`

**Request Body:**
```json
{
  "name": "Implement auth middleware",
  "description": "Verify tokenVersion in JWT",
  "priority": "HIGH",
  "status": "PENDING",
  "projectId": "2bc047db-d933-4f93-b4d6-db2638e4a7a8",
  "dueDate": "2026-10-15T00:00:00.000Z"
}
```

### 3. Update Task
`PUT /api/tasks/:id`

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

### 4. Delete Task
`DELETE /api/tasks/:id`

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully"
}
```

---

## Health Endpoint
`GET /health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-10-06T18:30:00.000Z"
}
```
