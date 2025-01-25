# Admin Dashboard Review of Student and Tester Roles

Below is a high-level pass over the code for student and tester roles, highlighting features that could be incorporated into the Admin Dashboard.

---

## Student-Facing Features (`src/features/student/…`)

### **Projects**
- **Files**: `projects.api`, `ProjectsProvider`, `ProjectSettingsDialog`, etc.
- **Current Functionality**:
  - Students can list, create, update, and delete projects.
- **Admin Use Case**:
  - Global oversight of:
    - Total number of projects.
    - Usage statistics per student.
    - Ownership of projects.
  - Ability to lock, archive, or remove projects.

### **Features**
- **Files**: `CreateFeature`, `FeatureDetailsPanel`, `FeatureDetailsPage`, `Comments`.
- **Current Functionality**:
  - Students create “Features” within projects and store comments.
- **Admin Use Case**:
  - Moderation or review of comments.
  - Global overview of features (e.g., validation status, assigned testers).

### **Validations**
- **Files**: `validations.api`, `AddValidation`, `ValidationHistoryPanel`.
- **Current Functionality**:
  - Students submit validations, including videos or screenshots.
- **Admin Use Case**:
  - Track:
    - Total validations.
    - Students with overdue validations.
    - Pending validation reviews.

### **Student Dashboard**
- **Files**: `studentDashboard.api`, `StudentDashboard`.
- **Current Functionality**:
  - Shows stats for individual students (e.g., outstanding tickets).
- **Admin Use Case**:
  - Aggregated stats for all students.
  - Identify students with the most outstanding tickets.

### **AddTesterDialog**
- **Current Functionality**:
  - Students can invite testers.
- **Admin Use Case**:
  - Visibility into “tester invites” and assignments across all projects.

---

## Ticket-Facing Features (`src/features/tickets/…`)

### **Core Ticket Functionality**
- **Files**: `tickets.api`, `tickets.store`.
- **Current Functionality**:
  - Tickets can be created, assigned, and updated.
- **Admin Use Case**:
  - Centralized ticket queue.
  - Reassignment of tickets when testers are unresponsive.

### **Ticket Details**
- **Files**: `TicketAuditLog`, `TicketDetails`, `TicketForm`, `TicketList`.
- **Current Functionality**:
  - Handles ticket creation, listing, and audit logs.
- **Admin Use Case**:
  - At-a-glance view of:
    - All open tickets.
    - Assigned features/students.
    - Audit logs for tracking changes.

---

## Tester-Facing Features (`src/features/tester/…`)

### **Tester Dashboard / Testing Session**
- **Files**: `TesterDashboard`, `TestingSession`.
- **Current Functionality**:
  - Testers manage testing tickets, record sessions, and mark tickets complete.
- **Admin Use Case**:
  - Monitor:
    - Tester workloads.
    - Tickets completed and overdue.
    - Average completion times.

### **Test Queue & History**
- **Files**: `TestQueue`, `TestHistory`.
- **Current Functionality**:
  - Testers manage ticket queues and view history.
- **Admin Use Case**:
  - Track:
    - Backlogs.
    - Tickets in progress.
    - Turnaround times.

### **Embedded Tools**
- **Files**: `EmbeddedBrowser`, `ScreenRecorder`, `FileUploader`.
- **Current Functionality**:
  - Tools for recording and uploading evidence.
- **Admin Use Case**:
  - Aggregate data on:
    - Storage usage.
    - Large video uploads.

### **Tester Metrics**
- **Current Functionality**:
  - Tracks tester performance.
- **Admin Use Case**:
  - Feed data into analytics (e.g., resolution rates, reopened tickets).

---

## Summary of Potential Admin-Dashboard Enhancements

### **Global Project & Feature Oversight**
- Centralized view of all projects and features.
- Admin-level actions (e.g., delete, archive projects).
- Aggregated stats (e.g., features in testing, validated features).

### **Ticket & Testing Oversight**
- Consolidated ticket dashboard:
  - Ownership, assignees, and statuses.
- Metrics on:
  - Resolution times.
  - Reopened tickets.

### **Tester & Student Management**
- Overview of:
  - Tester workloads and performance.
  - Students’ statuses (e.g., active projects, outstanding tickets).

### **Validation & Comments Moderation**
- Centralized moderation for:
  - Comments.
  - Validation submissions.

### **Activity / Audit Logs**
- Investigate system changes:
  - User actions.
  - Ticket state transitions.
