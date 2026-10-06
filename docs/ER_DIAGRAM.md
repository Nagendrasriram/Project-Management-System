# Database Schema & Entity-Relationship (ER) Diagram

The Project Management System uses a normalized relational PostgreSQL database managed via Prisma ORM.

## Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Project : "owns (1:N, cascade delete)"
    User ||--o{ AuditLog : "triggers (1:N, set null)"
    Project ||--o{ Task : "contains (1:N, cascade delete)"

    User {
        String id PK "UUID"
        String email UK "Unique, lowercased"
        String passwordHash "Bcrypt cost 12"
        String fullName "User display name"
        Int tokenVersion "Session invalidation counter"
        DateTime createdAt "Timestamp"
        DateTime updatedAt "Timestamp"
    }

    Project {
        String id PK "UUID"
        String name "Project title"
        String description "Optional details"
        ProjectStatus status "NOT_STARTED | IN_PROGRESS | COMPLETED"
        DateTime startDate "Optional start timestamp"
        DateTime endDate "Optional end timestamp (>= startDate)"
        String ownerId FK "References User.id"
        DateTime createdAt "Timestamp"
        DateTime updatedAt "Timestamp"
    }

    Task {
        String id PK "UUID"
        String name "Task title"
        String description "Optional task details"
        TaskPriority priority "LOW | MEDIUM | HIGH"
        TaskStatus status "PENDING | IN_PROGRESS | COMPLETED"
        DateTime dueDate "Optional due timestamp"
        String projectId FK "References Project.id"
        DateTime createdAt "Timestamp"
        DateTime updatedAt "Timestamp"
    }

    AuditLog {
        String id PK "UUID"
        String userId FK "Nullable reference to User.id"
        String action "e.g. USER_LOGIN, TASK_CREATED"
        String entityType "e.g. Project, Task, User"
        String entityId "Target entity ID"
        Json details "Event metadata payload"
        DateTime createdAt "Timestamp"
    }
```

## Relational Constraints & Indexes

1. **Foreign Keys & Cascades**:
   - `projects.ownerId -> users.id` with `ON DELETE CASCADE`. If a user is deleted, all owned projects are safely removed.
   - `tasks.projectId -> projects.id` with `ON DELETE CASCADE`. If a project is deleted, all tasks within that project are deleted automatically.
   - `audit_logs.userId -> users.id` with `ON DELETE SET NULL`. Audit trails remain intact even if user records are purged.

2. **Indexes**:
   - `users(email)`: Unique B-tree index for $O(1)$ case-insensitive login lookups.
   - `projects(ownerId)`: B-tree index for filtering projects by authenticated owner.
   - `projects(status)`: B-tree index for status queries and aggregation.
   - `tasks(projectId)`: B-tree index for loading tasks in a project.
   - `tasks(status)`, `tasks(priority)`, `tasks(dueDate)`: Composite filtering optimization.
   - `audit_logs(userId)`, `audit_logs(createdAt)`: Fast temporal querying for audits.
